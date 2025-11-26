import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';

// Returns a list of available rooms for the specified date and time
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        const excludeSessionId = searchParams.get('excludeSessionId');

        if (!date || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        // Get rooms not booked during this time (checking both training sessions and group classes)
        const excludeSessionClause = excludeSessionId
            ? `AND ts.session_id != ${parseInt(excludeSessionId)}`
            : '';

        const availableRooms = await dataSource.query(
            `SELECT r.room_id, r.name
             FROM rooms r
             WHERE NOT EXISTS (
                 -- Check training sessions on this specific date
                 SELECT 1 FROM training_sessions ts
                 WHERE ts.room_id = r.room_id
                 AND ts.session_date = $1
                 AND ts.status != 'canceled'
                 ${excludeSessionClause}
                 AND (
                     (ts.start_time::time <= $2::time AND ts.end_time::time > $2::time) OR
                     (ts.start_time::time < $3::time AND ts.end_time::time >= $3::time) OR
                     (ts.start_time::time >= $2::time AND ts.end_time::time <= $3::time)
                 )
             )
             AND NOT EXISTS (
                 -- Check recurring group classes on this day of week
                 SELECT 1 FROM group_classes gc
                 WHERE gc.room_id = r.room_id
                 AND gc.class_day::text = $4
                 AND (
                     (gc.start_time::time <= $2::time AND gc.end_time::time > $2::time) OR
                     (gc.start_time::time < $3::time AND gc.end_time::time >= $3::time) OR
                     (gc.start_time::time >= $2::time AND gc.end_time::time <= $3::time)
                 )
             )
             ORDER BY r.name`,
            [date, startTime, endTime, dayOfWeek]
        );

        return NextResponse.json({
            rooms: availableRooms.map((r: any) => ({
                roomId: r.room_id,
                name: r.name
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching available rooms:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}