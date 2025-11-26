import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { ClassEnrollment } from '@/models/ClassEnrollment';

// Enrolls the logged in member in a group class if it isn't full and they aren't already enrolled
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { classId } = body;

        if (!classId) {
            return NextResponse.json(
                { error: 'Class ID is required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const enrollmentRepository = dataSource.getRepository(ClassEnrollment);

        // Check if already enrolled
        const existing = await enrollmentRepository.findOne({
            where: {
                classId: parseInt(classId),
                memberId: user.memberId
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Already enrolled in this class' },
                { status: 409 }
            );
        }

        // The database trigger will check capacity automatically
        // If the class is full, the trigger will throw an exception
        const enrollment = enrollmentRepository.create({
            classId: parseInt(classId),
            memberId: user.memberId
        });

        await enrollmentRepository.save(enrollment);

        return NextResponse.json(
            { message: 'Successfully enrolled in class' },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Error enrolling in class:', error);

        // Check if it's the capacity error from the database trigger
        if (error.message && error.message.includes('full capacity')) {
            return NextResponse.json(
                { error: 'Class is at full capacity. Cannot enroll more members.' },
                { status: 409 }
            );
        }

        // Check for other database constraint violations
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json(
                { error: 'Already enrolled in this class' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}