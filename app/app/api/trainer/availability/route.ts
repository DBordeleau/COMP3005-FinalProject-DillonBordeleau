import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { TrainerDaySchedule } from '@/models/TrainerDaySchedule';

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'trainer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const dataSource = await getDataSource();
        const scheduleRepository = dataSource.getRepository(TrainerDaySchedule);

        const schedules = await scheduleRepository.find({
            where: { trainerId: user.memberId },
            order: { day: 'ASC', startTime: 'ASC' }
        });

        return NextResponse.json({
            schedules: schedules.map(s => ({
                schedule_id: s.scheduleId,
                day: s.day,
                start_time: s.startTime,
                end_time: s.endTime
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'trainer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { schedules } = body;

        const dataSource = await getDataSource();
        const scheduleRepository = dataSource.getRepository(TrainerDaySchedule);

        // Delete all existing schedules for this trainer
        await scheduleRepository.delete({ trainerId: user.memberId });

        // Create new schedules
        const newSchedules = schedules.map((schedule: any) =>
            scheduleRepository.create({
                trainerId: user.memberId,
                day: schedule.day,
                startTime: schedule.start_time,
                endTime: schedule.end_time
            })
        );

        await scheduleRepository.save(newSchedules);

        return NextResponse.json(
            { message: 'Availability updated successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating availability:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}