import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('trainers')
export class Trainer {
    @PrimaryGeneratedColumn({ name: 'trainer_id' })
    trainerId!: number;

    @Column({ name: 'email', type: 'varchar', unique: true })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar' })
    passwordHash!: string;

    @Column({ name: 'first_name', type: 'varchar' })
    firstName!: string;

    @Column({ name: 'last_name', type: 'varchar' })
    lastName!: string;

    // Relations
    @OneToMany(() => require('./TrainerDaySchedule').TrainerDaySchedule, (schedule: any) => schedule.trainer, { cascade: true })
    daySchedules!: any[];

    @OneToMany(() => require('./TrainingSession').TrainingSession, (session: any) => session.trainer)
    trainingSessions!: any[];

    @OneToMany(() => require('./GroupClass').GroupClass, (groupClass: any) => groupClass.trainer)
    groupClasses!: any[];
}
