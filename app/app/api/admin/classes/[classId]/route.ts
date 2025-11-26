import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { GroupClass } from '@/models/GroupClass';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { classId } = await params;
        const body = await request.json();
        const { className, classDay, startTime, endTime, capacity, description, trainerId, roomId } = body;

        const dataSource = await getDataSource();
        const classRepository = dataSource.getRepository(GroupClass);

        const groupClass = await classRepository.findOne({
            where: { classId: parseInt(classId) }
        });

        if (!groupClass) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        groupClass.className = className;
        groupClass.classDay = classDay;
        groupClass.startTime = startTime;
        groupClass.endTime = endTime;
        groupClass.capacity = parseInt(capacity);
        groupClass.description = description || null;
        groupClass.trainerId = parseInt(trainerId);
        groupClass.roomId = parseInt(roomId);

        await classRepository.save(groupClass);

        return NextResponse.json(
            { message: 'Class updated successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating class:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { classId } = await params;
        const dataSource = await getDataSource();
        const classRepository = dataSource.getRepository(GroupClass);

        const groupClass = await classRepository.findOne({
            where: { classId: parseInt(classId) }
        });

        if (!groupClass) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        await classRepository.remove(groupClass);

        return NextResponse.json(
            { message: 'Class deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting class:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}