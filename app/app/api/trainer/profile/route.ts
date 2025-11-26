import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { Trainer } from '@/models/Trainer';
import bcrypt from 'bcrypt';
import { getUserFromRequest } from '@/app/lib/jwt';

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
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            email: trainer.email
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'trainer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { firstName, lastName, currentPassword, newPassword } = body;

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

        trainer.firstName = firstName;
        trainer.lastName = lastName;

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to change password' },
                    { status: 400 }
                );
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, trainer.passwordHash);
            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 401 }
                );
            }

            if (newPassword.length < 8) {
                return NextResponse.json(
                    { error: 'New password must be at least 8 characters long' },
                    { status: 400 }
                );
            }

            trainer.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        await trainerRepository.save(trainer);

        return NextResponse.json(
            { message: 'Profile updated successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}