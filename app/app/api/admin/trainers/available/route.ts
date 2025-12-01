import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';

// Returns a list of trainers available on a given day and time
// Used to populate trainer dropdown when booking training sessions or creating group classes
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        // We allow members to make requests to this endpoint for PT booking
        if (!user || (user.userType !== 'admin' && user.userType !== 'member')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const day = searchParams.get('day');
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        const excludeClassId = searchParams.get('excludeClassId');

        if (!day || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        console.log('Searching for trainers:', { day, startTime, endTime, excludeClassId });

        const dataSource = await getDataSource();

        // Get trainers who have availability for this day and time
        // Exclude trainers who:
        // 1. Are teaching a group class at that time (unless it's the class being edited)
        // 2. Have a training session scheduled at that time
        const excludeClause = excludeClassId
            ? `AND gc.class_id != ${parseInt(excludeClassId)}`
            : '';

        // NOTE: After demo video I updated this to use an exclude clause so we can select the current trainer when editing a class
        // This is the same idea as excluding the currentclass when checking room availability
        const availableTrainers = await dataSource.query(
            `SELECT DISTINCT t.trainer_id, t.first_name, t.last_name,
                    tds.day, tds.start_time, tds.end_time
             FROM trainers t
             INNER JOIN trainer_day_schedules tds ON t.trainer_id = tds.trainer_id
             WHERE tds.day::text = $1
             AND tds.start_time::time <= $2::time
             AND tds.end_time::time >= $3::time
             AND NOT EXISTS (
                 SELECT 1 FROM group_classes gc
                 WHERE gc.trainer_id = t.trainer_id
                 AND gc.class_day::text = $1
                 ${excludeClause}
                 AND (
                     (gc.start_time::time <= $2::time AND gc.end_time::time > $2::time) OR
                     (gc.start_time::time < $3::time AND gc.end_time::time >= $3::time) OR
                     (gc.start_time::time >= $2::time AND gc.end_time::time <= $3::time)
                 )
             )
             AND NOT EXISTS (
                 SELECT 1 FROM training_sessions ts
                 WHERE ts.trainer_id = t.trainer_id
                 AND EXTRACT(DOW FROM ts.session_date) = (
                     CASE $1
                         WHEN 'Sunday' THEN 0
                         WHEN 'Monday' THEN 1
                         WHEN 'Tuesday' THEN 2
                         WHEN 'Wednesday' THEN 3
                         WHEN 'Thursday' THEN 4
                         WHEN 'Friday' THEN 5
                         WHEN 'Saturday' THEN 6
                     END
                 )
                 AND ts.status = 'scheduled'
                 AND (
                     (ts.start_time::time <= $2::time AND ts.end_time::time > $2::time) OR
                     (ts.start_time::time < $3::time AND ts.end_time::time >= $3::time) OR
                     (ts.start_time::time >= $2::time AND ts.end_time::time <= $3::time)
                 )
             )
             ORDER BY t.first_name, t.last_name`,
            [day, startTime, endTime]
        );

        console.log('Available trainers found:', availableTrainers);

        return NextResponse.json({
            trainers: availableTrainers.map((t: any) => ({
                trainerId: t.trainer_id,
                firstName: t.first_name,
                lastName: t.last_name
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching available trainers:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}