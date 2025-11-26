import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { TrainingSession, TrainingSessionStatus } from '@/models/TrainingSession';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { sessionId } = await params;
        const body = await request.json();
        const { sessionDate, startTime, endTime, trainerId, roomId } = body;

        const dataSource = await getDataSource();
        const sessionRepository = dataSource.getRepository(TrainingSession);

        const session = await sessionRepository.findOne({
            where: {
                sessionId: parseInt(sessionId),
                memberId: user.memberId
            }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        session.sessionDate = new Date(sessionDate);
        session.startTime = startTime;
        session.endTime = endTime;
        session.trainerId = parseInt(trainerId);
        session.roomId = parseInt(roomId);

        await sessionRepository.save(session);

        return NextResponse.json(
            { message: 'Training session rescheduled successfully', session },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error rescheduling training session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { sessionId } = await params;
        const dataSource = await getDataSource();
        const sessionRepository = dataSource.getRepository(TrainingSession);

        const session = await sessionRepository.findOne({
            where: {
                sessionId: parseInt(sessionId),
                memberId: user.memberId
            }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        session.status = TrainingSessionStatus.CANCELED;
        await sessionRepository.save(session);

        return NextResponse.json(
            { message: 'Training session cancelled successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error cancelling training session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}