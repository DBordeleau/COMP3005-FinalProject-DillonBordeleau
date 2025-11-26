import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { Trainer } from '@/models/Trainer';
import bcrypt from 'bcrypt';
import { generateToken } from '@/app/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Should never happen, form forces these to be rpesent
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Connect to DB and find trainer by email
        const dataSource = await getDataSource();
        const trainerRepository = dataSource.getRepository(Trainer);

        const trainer = await trainerRepository.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!trainer) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, trainer.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            memberId: trainer.trainerId,
            email: trainer.email,
            userType: 'trainer'
        });

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                trainer: {
                    trainerId: trainer.trainerId,
                    email: trainer.email,
                    firstName: trainer.firstName,
                    lastName: trainer.lastName,
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}