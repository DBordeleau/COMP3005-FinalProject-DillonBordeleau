import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum Day {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday'
}

@Entity('group_classes')
export class GroupClass {
    @PrimaryGeneratedColumn({ name: 'class_id' })
    classId!: number;

    @Column({ name: 'trainer_id', type: 'int' })
    trainerId!: number;

    @Column({ name: 'room_id', type: 'int' })
    roomId!: number;

    @Column({ name: 'class_name', type: 'varchar' })
    className!: string;

    @Column({ name: 'class_day', type: 'enum', enum: Day })
    classDay!: Day;

    @Column({ name: 'start_time', type: 'time' })
    startTime!: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime!: string;

    @Column({ name: 'capacity', type: 'int' })
    capacity!: number;

    @Column({ type: 'text', nullable: true })
    description!: string;

    // Relations
    @ManyToOne(() => require('./Trainer').Trainer, (trainer: any) => trainer.groupClasses)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: any;

    @ManyToOne(() => require('./Room').Room, (room: any) => room.groupClasses)
    @JoinColumn({ name: 'room_id' })
    room!: any;

    @OneToMany(() => require('./ClassEnrollment').ClassEnrollment, (enrollment: any) => enrollment.groupClass, { cascade: true })
    enrollments!: any[];
}
