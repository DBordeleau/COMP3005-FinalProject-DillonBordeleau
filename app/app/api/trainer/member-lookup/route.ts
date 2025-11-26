import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';

// Fetches latest fitness goal and health metric info for the queried member
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'trainer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: 'Name parameter is required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();

        // Search for member (case-insensitive)
        const members = await dataSource.query(
            `SELECT member_id, first_name, last_name, email
             FROM members
             WHERE LOWER(first_name || ' ' || last_name) LIKE LOWER($1)
             LIMIT 1`,
            [`%${name}%`]
        );

        if (members.length === 0) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        const member = members[0];

        // Get latest fitness goal
        const latestGoal = await dataSource.query(
            `SELECT name, target_value, target_date, status
             FROM fitness_goals
             WHERE member_id = $1
             ORDER BY created_date DESC
             LIMIT 1`,
            [member.member_id]
        );

        // Get latest health metric
        const latestMetric = await dataSource.query(
            `SELECT weight, body_fat_percentage, heart_rate, blood_pressure, recorded_date
             FROM health_metrics
             WHERE member_id = $1
             ORDER BY recorded_date DESC
             LIMIT 1`,
            [member.member_id]
        );

        return NextResponse.json({
            member_id: member.member_id,
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            latest_goal: latestGoal[0] || null,
            latest_metric: latestMetric[0] || null
        }, { status: 200 });

    } catch (error) {
        console.error('Error looking up member:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}