import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { Trainer } from '@/models/Trainer';
import bcrypt from 'bcrypt';

// Returns a list of all trainers
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
        const trainerRepository = dataSource.getRepository(Trainer);

        const trainers = await trainerRepository.find({
            order: { firstName: 'ASC' }
        });

        return NextResponse.json({ trainers }, { status: 200 });

    } catch (error) {
        console.error('Error fetching trainers:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Creates a new trainer account
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
        const { email, password, firstName, lastName } = body;

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const trainerRepository = dataSource.getRepository(Trainer);

        // Check if email already exists
        const existingTrainer = await trainerRepository.findOne({
            where: { email: email.toLowerCase() }
        });

        if (existingTrainer) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create trainer
        const trainer = trainerRepository.create({
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName
        });

        await trainerRepository.save(trainer);

        return NextResponse.json(
            {
                message: 'Trainer created successfully',
                trainer: {
                    trainerId: trainer.trainerId,
                    email: trainer.email,
                    firstName: trainer.firstName,
                    lastName: trainer.lastName
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating trainer:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}