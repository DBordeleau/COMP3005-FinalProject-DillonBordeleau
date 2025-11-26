import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { Room } from '@/models/Room';

export async function PUT(
    request: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, roomType } = body;

        if (!name || !roomType) {
            return NextResponse.json(
                { error: 'Name and room type are required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const roomRepository = dataSource.getRepository(Room);

        const room = await roomRepository.findOne({
            where: { roomId: parseInt(params.roomId) }
        });

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        room.name = name;
        room.roomType = roomType;

        await roomRepository.save(room);

        return NextResponse.json(
            {
                message: 'Room updated successfully',
                room
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const dataSource = await getDataSource();
        const roomRepository = dataSource.getRepository(Room);

        const room = await roomRepository.findOne({
            where: { roomId: parseInt(params.roomId) }
        });

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        await roomRepository.remove(room);

        return NextResponse.json(
            { message: 'Room deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}