import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { Member } from '@/models/Member';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, dateOfBirth, gender } = body;

        // Validate required fields, registration form won't submit if any of these are missing so this shouldn't happen
        if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength (minimum 8 characters)
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Connect to database
        const dataSource = await getDataSource();
        const memberRepository = dataSource.getRepository(Member);

        // Check if email already exists in database
        const existingMember = await memberRepository.findOne({
            where: { email: email.toLowerCase() }
        });

        if (existingMember) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new member record in postgres
        const newMember = memberRepository.create({
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            registrationDate: new Date()
        });

        // Save to database
        await memberRepository.save(newMember);

        // Return success response (without password hash obviously)
        return NextResponse.json(
            {
                message: 'Registration successful',
                member: {
                    memberId: newMember.memberId,
                    email: newMember.email,
                    firstName: newMember.firstName,
                    lastName: newMember.lastName,
                    registrationDate: newMember.registrationDate
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}