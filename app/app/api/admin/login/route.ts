import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { AdminStaff } from '@/models/AdminStaff';
import bcrypt from 'bcrypt';
import { generateToken } from '@/app/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // These will always be here but just in case
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Connect to DB and find admin by email
        const dataSource = await getDataSource();
        const adminRepository = dataSource.getRepository(AdminStaff);

        const admin = await adminRepository.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            memberId: admin.adminId,
            email: admin.email,
            userType: 'admin'
        });

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                admin: {
                    adminId: admin.adminId,
                    email: admin.email,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
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