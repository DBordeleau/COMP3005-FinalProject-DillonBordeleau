import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { Room } from '@/models/Room';

// Returns a list of all rooms in the database
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
        const roomRepository = dataSource.getRepository(Room);

        const rooms = await roomRepository.find({
            order: { name: 'ASC' }
        });

        const mappedRooms = rooms.map(room => ({
            room_id: room.roomId,
            name: room.name,
            room_type: room.roomType
        }));

        return NextResponse.json({ rooms: mappedRooms }, { status: 200 });

    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Creates a new room with provided details
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
        const { name, roomType } = body;

        if (!name || !roomType) {
            return NextResponse.json(
                { error: 'Name and room type are required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const roomRepository = dataSource.getRepository(Room);

        const room = roomRepository.create({
            name,
            roomType
        });

        await roomRepository.save(room);

        return NextResponse.json(
            {
                message: 'Room created successfully',
                room: {
                    room_id: room.roomId,
                    name: room.name,
                    room_type: room.roomType
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Updates room details for a specific room ID
export async function PUT(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { roomId, name, roomType } = body;

        if (!roomId) {
            return NextResponse.json(
                { error: 'Room ID is required' },
                { status: 400 }
            );
        }

        if (!name || !roomType) {
            return NextResponse.json(
                { error: 'Name and room type are required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const roomRepository = dataSource.getRepository(Room);

        const room = await roomRepository.findOne({
            where: { roomId: parseInt(roomId) }
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
                room: {
                    room_id: room.roomId,
                    name: room.name,
                    room_type: room.roomType
                }
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

// Deletes a room with the specified room ID
export async function DELETE(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json(
                { error: 'Room ID is required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const roomRepository = dataSource.getRepository(Room);

        const room = await roomRepository.findOne({
            where: { roomId: parseInt(roomId) }
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