import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { Member } from '@/models/Member';
import { Trainer } from '@/models/Trainer';
import { AdminStaff } from '@/models/AdminStaff';
import bcrypt from 'bcrypt';
import { generateToken } from '@/app/lib/jwt';

// Authenticates a user (member, trainer, or admin) and returns a JWT token upon successful login
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, userType } = body;

        if (!email || !password || !userType) {
            return NextResponse.json(
                { error: 'Email, password, and userType are required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();

        let user, passwordHash, tokenPayload, responseUser;

        if (userType === 'member') { // Member auth
            const repo = dataSource.getRepository(Member);
            user = await repo.findOne({ where: { email: email.toLowerCase() } });
            if (user) {
                passwordHash = user.passwordHash;
                tokenPayload = {
                    memberId: user.memberId,
                    email: user.email,
                    userType: 'member' as const
                };
                responseUser = {
                    memberId: user.memberId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            }
        } else if (userType === 'trainer') { // Trainer auth
            const repo = dataSource.getRepository(Trainer);
            user = await repo.findOne({ where: { email: email.toLowerCase() } });
            if (user) {
                passwordHash = user.passwordHash;
                tokenPayload = {
                    memberId: user.trainerId,
                    email: user.email,
                    userType: 'trainer' as const
                };
                responseUser = {
                    trainerId: user.trainerId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            }
        } else if (userType === 'admin') { // Admin auth
            const repo = dataSource.getRepository(AdminStaff);
            user = await repo.findOne({ where: { email: email.toLowerCase() } });
            if (user) {
                passwordHash = user.passwordHash;
                tokenPayload = {
                    memberId: user.adminId,
                    email: user.email,
                    userType: 'admin' as const
                };
                responseUser = {
                    adminId: user.adminId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid userType' },
                { status: 400 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        if (!user || !passwordHash || !tokenPayload) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }


        const isPasswordValid = await bcrypt.compare(password, passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const token = generateToken(tokenPayload);

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                [userType]: responseUser
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