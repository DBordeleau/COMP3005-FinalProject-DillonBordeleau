import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { FitnessGoal, GoalStatus } from '@/models/FitnessGoal';

// Update existing fitness goal for the logged in member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ goalId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { goalId } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !Object.values(GoalStatus).includes(status as GoalStatus)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const goalRepository = dataSource.getRepository(FitnessGoal);

        const goal = await goalRepository.findOne({
            where: {
                goalId: parseInt(goalId),
                memberId: user.memberId
            }
        });

        if (!goal) {
            return NextResponse.json(
                { error: 'Goal not found' },
                { status: 404 }
            );
        }

        goal.status = status as GoalStatus;
        await goalRepository.save(goal);

        return NextResponse.json(
            { message: 'Goal updated successfully', goal },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating fitness goal:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Deletes a fitness goal for the logged in member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ goalId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { goalId } = await params;
        const dataSource = await getDataSource();
        const goalRepository = dataSource.getRepository(FitnessGoal);

        const goal = await goalRepository.findOne({
            where: {
                goalId: parseInt(goalId),
                memberId: user.memberId
            }
        });

        if (!goal) {
            return NextResponse.json(
                { error: 'Goal not found' },
                { status: 404 }
            );
        }

        await goalRepository.remove(goal);

        return NextResponse.json(
            { message: 'Goal deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting fitness goal:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}