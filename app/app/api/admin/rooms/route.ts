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

        // Map to ensure consistent property names
        const mappedRooms = rooms.map(room => ({
            room_id: room.roomId,
            name: room.name,
            room_type: room.roomType
        }));

        console.log('Returning rooms:', mappedRooms); // Debug log

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