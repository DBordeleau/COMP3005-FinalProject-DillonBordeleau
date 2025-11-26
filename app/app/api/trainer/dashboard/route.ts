import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { Trainer } from '@/models/Trainer';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'trainer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const dataSource = await getDataSource();
        const trainerRepository = dataSource.getRepository(Trainer);

        const trainer = await trainerRepository.findOne({
            where: { trainerId: user.memberId }
        });

        if (!trainer) {
            return NextResponse.json(
                { error: 'Trainer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            trainer_id: trainer.trainerId,
            first_name: trainer.firstName,
            last_name: trainer.lastName,
            email: trainer.email
        }, { status: 200 });

    } catch (error) {
        console.error('Dashboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}