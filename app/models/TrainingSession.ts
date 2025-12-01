import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum TrainingSessionStatus {
    SCHEDULED = 'scheduled',
    COMPLETED = 'completed',
    CANCELED = 'canceled',
}

@Entity('training_sessions')
export class TrainingSession {
    @PrimaryGeneratedColumn({ name: 'session_id' })
    sessionId!: number;

    @Column({ name: 'member_id', type: 'int' })
    memberId!: number;

    @Column({ name: 'trainer_id', type: 'int' })
    trainerId!: number;

    @Column({ name: 'room_id', type: 'int' })
    roomId!: number;

    @Column({ name: 'session_date', type: 'date' })
    sessionDate!: Date;

    @Column({ name: 'start_time', type: 'time' })
    startTime!: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime!: string;

    @Column({ name: 'status', type: 'enum', enum: TrainingSessionStatus, default: TrainingSessionStatus.SCHEDULED })
    status!: TrainingSessionStatus;

    // Relations
    @ManyToOne(() => require('./Member').Member, (member: any) => member.trainingSessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member!: any;

    @ManyToOne(() => require('./Trainer').Trainer, (trainer: any) => trainer.trainingSessions)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: any;

    @ManyToOne(() => require('./Room').Room, (room: any) => room.trainingSessions)
    @JoinColumn({ name: 'room_id' })
    room!: any;
}