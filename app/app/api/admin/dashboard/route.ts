import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { AdminStaff } from '@/models/AdminStaff';

// Returns information sassociated with the logged in admin
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
        const adminRepository = dataSource.getRepository(AdminStaff);

        const admin = await adminRepository.findOne({
            where: { adminId: user.memberId }
        });

        if (!admin) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            admin_id: admin.adminId,
            first_name: admin.firstName,
            last_name: admin.lastName,
            email: admin.email
        }, { status: 200 });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}