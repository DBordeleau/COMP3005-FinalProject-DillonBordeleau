import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { Member } from '@/models/Member';
import bcrypt from 'bcrypt';
import { generateToken } from '@/app/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // This should never happen since form validates it
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Connect to DB and find member by email
        const dataSource = await getDataSource();
        const memberRepository = dataSource.getRepository(Member);

        const member = await memberRepository.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!member) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, member.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token so we can access protected routes
        const token = generateToken({
            memberId: member.memberId,
            email: member.email,
            userType: 'member'
        });

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                member: {
                    memberId: member.memberId,
                    email: member.email,
                    firstName: member.firstName,
                    lastName: member.lastName,
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