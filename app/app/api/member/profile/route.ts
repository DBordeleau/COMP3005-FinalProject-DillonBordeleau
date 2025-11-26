import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { Member } from '@/models/Member';
import bcrypt from 'bcrypt';
import { getUserFromRequest } from '@/app/lib/jwt';

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
        const memberRepository = dataSource.getRepository(Member);

        const member = await memberRepository.findOne({
            where: { memberId: user.memberId }
        });

        if (!member) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            firstName: member.firstName,
            lastName: member.lastName,
            gender: member.gender,
            email: member.email
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

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { firstName, lastName, gender, currentPassword, newPassword } = body;

        const dataSource = await getDataSource();
        const memberRepository = dataSource.getRepository(Member);

        const member = await memberRepository.findOne({
            where: { memberId: user.memberId }
        });

        if (!member) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        member.firstName = firstName;
        member.lastName = lastName;
        member.gender = gender;

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to change password' },
                    { status: 400 }
                );
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, member.passwordHash);
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

            member.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        await memberRepository.save(member);

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