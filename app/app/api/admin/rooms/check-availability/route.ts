import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        // We allow members to make requests to this endpoint for PT booking
        if (!user || (user.userType !== 'admin' && user.userType !== 'member')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const roomIdParam = searchParams.get('roomId');
        const day = searchParams.get('day');
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        const excludeClassId = searchParams.get('excludeClassId');

        if (!roomIdParam || !day || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Parse roomId and validate it's a number
        const roomId = parseInt(roomIdParam);
        if (isNaN(roomId)) {
            return NextResponse.json(
                { error: 'Invalid room ID - must be a number' },
                { status: 400 }
            );
        }

        console.log('Checking room availability:', { roomId, day, startTime, endTime, excludeClassId });

        const dataSource = await getDataSource();

        // Check if room is already booked at this time (excluding current class if editing)
        const conflictQuery = excludeClassId
            ? `SELECT * FROM group_classes
               WHERE room_id = $1
               AND class_day::text = $2
               AND class_id != $5
               AND (
                   (start_time::time <= $3::time AND end_time::time > $3::time) OR
                   (start_time::time < $4::time AND end_time::time >= $4::time) OR
                   (start_time::time >= $3::time AND end_time::time <= $4::time)
               )`
            : `SELECT * FROM group_classes
               WHERE room_id = $1
               AND class_day::text = $2
               AND (
                   (start_time::time <= $3::time AND end_time::time > $3::time) OR
                   (start_time::time < $4::time AND end_time::time >= $4::time) OR
                   (start_time::time >= $3::time AND end_time::time <= $4::time)
               )`;

        const params = excludeClassId
            ? [roomId, day, startTime, endTime, parseInt(excludeClassId)]
            : [roomId, day, startTime, endTime];

        const conflicts = await dataSource.query(conflictQuery, params);

        console.log('Room conflicts found:', conflicts);

        if (conflicts.length > 0) {
            return NextResponse.json(
                { error: 'Room is already booked during this time' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { available: true, message: 'Room is available' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error checking room availability:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}