import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { TrainerDaySchedule } from '@/models/TrainerDaySchedule';

// Fetches all existing availability slots for the logged in trainer
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

// Updates availability for the logged in trainer (deletes existing and creates new)
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

        // Validate that all schedules have end time after start time
        for (const schedule of schedules) {
            if (schedule.start_time >= schedule.end_time) {
                return NextResponse.json(
                    { error: `Invalid time range for ${schedule.day}: End time must be after start time` },
                    { status: 400 }
                );
            }
        }

        // Check for overlapping schedules on the same day
        for (let i = 0; i < schedules.length; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                const schedule1 = schedules[i];
                const schedule2 = schedules[j];

                // Only check if they're on the same day
                if (schedule1.day === schedule2.day) {
                    // Check if time ranges overlap
                    const overlap = (
                        (schedule1.start_time < schedule2.end_time && schedule1.end_time > schedule2.start_time) ||
                        (schedule2.start_time < schedule1.end_time && schedule2.end_time > schedule1.start_time)
                    );

                    if (overlap) {
                        return NextResponse.json(
                            {
                                error: `Invalid availability. Overlapping schedules detected for ${schedule1.day}: ${schedule1.start_time}-${schedule1.end_time} conflicts with ${schedule2.start_time}-${schedule2.end_time}`
                            },
                            { status: 400 }
                        );
                    }
                }
            }
        }

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