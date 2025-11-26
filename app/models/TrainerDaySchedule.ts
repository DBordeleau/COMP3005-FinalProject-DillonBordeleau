import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum Day {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday'
}

@Entity('trainer_day_schedules')
export class TrainerDaySchedule {
    @PrimaryGeneratedColumn({ name: 'schedule_id' })
    scheduleId!: number;

    @Column({ name: 'trainer_id', type: 'int' })
    trainerId!: number;

    @Column({ name: 'day', type: 'enum', enum: Day })
    day!: Day;

    @Column({ name: 'start_time', type: 'time' })
    startTime!: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime!: string;

    // Relations
    @ManyToOne(() => require('./Trainer').Trainer, (trainer: any) => trainer.daySchedules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: any;
}