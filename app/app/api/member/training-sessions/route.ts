import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { TrainingSession, TrainingSessionStatus } from '@/models/TrainingSession';

// Books a new training session for the logged in member
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { sessionDate, startTime, endTime, trainerId, roomId } = body;

        if (!sessionDate || !startTime || !endTime || !trainerId || !roomId) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const sessionRepository = dataSource.getRepository(TrainingSession);

        const session = sessionRepository.create({
            memberId: user.memberId,
            trainerId: parseInt(trainerId),
            roomId: parseInt(roomId),
            sessionDate: new Date(sessionDate),
            startTime,
            endTime,
            status: TrainingSessionStatus.SCHEDULED
        });

        await sessionRepository.save(session);

        return NextResponse.json(
            { message: 'Training session booked successfully', session },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error booking training session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}