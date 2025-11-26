import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || (user.userType !== 'trainer' && user.userType !== 'admin')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { classId } = await params;
        const dataSource = await getDataSource();

        // Get class details
        const classDetails = await dataSource.query(
            `SELECT 
                gc.class_id,
                gc.class_name,
                gc.description,
                gc.class_day,
                gc.start_time,
                gc.end_time,
                gc.capacity,
                CONCAT(t.first_name, ' ', t.last_name) as trainer_name,
                r.name as room_name,
                (SELECT COUNT(*) FROM class_enrollments WHERE class_id = gc.class_id) as enrolled_count
            FROM group_classes gc
            JOIN trainers t ON gc.trainer_id = t.trainer_id
            JOIN rooms r ON gc.room_id = r.room_id
            WHERE gc.class_id = $1`,
            [parseInt(classId)]
        );

        if (classDetails.length === 0) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        // Get enrolled members
        const enrolledMembers = await dataSource.query(
            `SELECT 
                m.member_id,
                m.first_name,
                m.last_name,
                m.email,
                ce.enrollment_date
            FROM class_enrollments ce
            JOIN members m ON ce.member_id = m.member_id
            WHERE ce.class_id = $1
            ORDER BY m.last_name, m.first_name`,
            [parseInt(classId)]
        );

        return NextResponse.json(
            {
                class: classDetails[0],
                enrolledMembers
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching class details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}