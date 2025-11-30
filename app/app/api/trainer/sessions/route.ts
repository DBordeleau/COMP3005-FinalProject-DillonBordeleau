import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';

// Returns a list of all upcoming group sessions and training sessions associated with the logged in trainer
// Used to populate their schedule in the dashboard so only upcoming sessions are returned
// Anything in the past is omitted
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'trainer') {
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
                ts.member_id,
                CONCAT(m.first_name, ' ', m.last_name) as member_name,
                r.name as room_name
            FROM training_sessions ts
            JOIN members m ON ts.member_id = m.member_id
            JOIN rooms r ON ts.room_id = r.room_id
            WHERE ts.trainer_id = $1 
            AND ts.session_date >= CURRENT_DATE
            ORDER BY ts.session_date, ts.start_time
            LIMIT 20`,
            [user.memberId]
        );

        // Get group classes
        const groupClasses = await dataSource.query(
            `SELECT 
                gc.class_id,
                gc.class_name,
                gc.class_day,
                gc.start_time,
                gc.end_time,
                r.name as room_name
            FROM group_classes gc
            JOIN rooms r ON gc.room_id = r.room_id
            WHERE gc.trainer_id = $1
            ORDER BY gc.class_day, gc.start_time`,
            [user.memberId]
        );

        return NextResponse.json(
            { trainingSessions, groupClasses },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}