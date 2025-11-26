import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { ClassEnrollment } from '@/models/ClassEnrollment';

// Unenrolls the logged in member from a group class
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { classId } = await params;
        const dataSource = await getDataSource();
        const enrollmentRepository = dataSource.getRepository(ClassEnrollment);

        const enrollment = await enrollmentRepository.findOne({
            where: {
                classId: parseInt(classId),
                memberId: user.memberId
            }
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: 'Enrollment not found' },
                { status: 404 }
            );
        }

        await enrollmentRepository.remove(enrollment);

        return NextResponse.json(
            { message: 'Successfully unenrolled from class' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error unenrolling from class:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}