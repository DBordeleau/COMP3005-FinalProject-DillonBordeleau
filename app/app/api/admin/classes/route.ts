import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { GroupClass } from '@/models/GroupClass';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const dataSource = await getDataSource();

        const classes = await dataSource.query(`
            SELECT 
                gc.class_id,
                gc.class_name,
                gc.description,
                gc.class_day,
                gc.start_time,
                gc.end_time,
                gc.capacity,
                gc.trainer_id,
                gc.room_id,
                CONCAT(t.first_name, ' ', t.last_name) as trainer_name,
                r.name as room_name,
                (SELECT COUNT(*) FROM class_enrollments WHERE class_id = gc.class_id) as enrolled_count
            FROM group_classes gc
            JOIN trainers t ON gc.trainer_id = t.trainer_id
            JOIN rooms r ON gc.room_id = r.room_id
            ORDER BY 
                CASE gc.class_day
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                    WHEN 'Sunday' THEN 7
                END,
                gc.start_time
        `);

        return NextResponse.json(
            { classes },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { className, classDay, startTime, endTime, capacity, description, trainerId, roomId } = body;

        const dataSource = await getDataSource();
        const classRepository = dataSource.getRepository(GroupClass);

        const newClass = classRepository.create({
            className,
            classDay,
            startTime,
            endTime,
            capacity: parseInt(capacity),
            description: description || null,
            trainerId: parseInt(trainerId),
            roomId: parseInt(roomId)
        });

        await classRepository.save(newClass);

        return NextResponse.json(
            { message: 'Class created successfully', class: newClass },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating class:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}