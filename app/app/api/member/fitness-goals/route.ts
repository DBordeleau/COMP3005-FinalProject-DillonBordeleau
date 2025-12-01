import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { FitnessGoal, GoalStatus } from '@/models/FitnessGoal';

// Returns all fitness goals for the logged in member
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const dataSource = await getDataSource();

        const goals = await dataSource.query(
            `SELECT 
                goal_id,
                name,
                target_value,
                target_date,
                status
            FROM fitness_goals
            WHERE member_id = $1
            ORDER BY 
                CASE 
                    WHEN status = 'In Progress' THEN 1
                    WHEN status = 'Achieved' THEN 2
                    ELSE 3
                END,
                target_date DESC`,
            [user.memberId]
        );

        return NextResponse.json({ goals }, { status: 200 });

    } catch (error) {
        console.error('Error fetching fitness goals:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Creates a new fitness goal for the logged in member
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
        const { name, targetValue, targetDate } = body;

        if (!name || !targetValue || !targetDate) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const goalRepository = dataSource.getRepository(FitnessGoal);

        const goal = goalRepository.create({
            memberId: user.memberId,
            name,
            targetValue,
            targetDate: new Date(targetDate),
            status: GoalStatus.IN_PROGRESS
        });

        await goalRepository.save(goal);

        return NextResponse.json(
            { message: 'Goal created successfully', goal },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating fitness goal:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Update existing fitness goal for the logged in member (can only change status)
export async function PUT(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { goalId, status } = body;

        if (!goalId) {
            return NextResponse.json(
                { error: 'Goal ID is required' },
                { status: 400 }
            );
        }

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
export async function DELETE(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const goalId = searchParams.get('goalId');

        if (!goalId) {
            return NextResponse.json(
                { error: 'Goal ID is required' },
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