import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const dataSource = await getDataSource();

        // Get upcoming training sessions
        const trainingSessions = await dataSource.query(
            `SELECT 
                ts.session_id,
                ts.session_date,
                ts.start_time,
                ts.end_time,
                ts.trainer_id,
                ts.room_id,
                CONCAT(t.first_name, ' ', t.last_name) as trainer_name,
                r.name as room_name
            FROM training_sessions ts
            JOIN trainers t ON ts.trainer_id = t.trainer_id
            JOIN rooms r ON ts.room_id = r.room_id
            WHERE ts.member_id = $1 
            AND ts.status = 'scheduled'
            AND ts.session_date >= CURRENT_DATE
            ORDER BY ts.session_date, ts.start_time
            LIMIT 10`,
            [user.memberId]
        );

        // Get enrolled group classes
        const groupClasses = await dataSource.query(
            `SELECT 
                gc.class_id,
                gc.class_name,
                gc.class_day,
                gc.start_time,
                gc.end_time,
                CONCAT(t.first_name, ' ', t.last_name) as trainer_name
            FROM class_enrollments ce
            JOIN group_classes gc ON ce.class_id = gc.class_id
            JOIN trainers t ON gc.trainer_id = t.trainer_id
            WHERE ce.member_id = $1
            ORDER BY 
                CASE gc.class_day::text
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                    WHEN 'Sunday' THEN 7
                END,
                gc.start_time`,
            [user.memberId]
        );

        return NextResponse.json(
            { trainingSessions, groupClasses },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}