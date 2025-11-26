import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';

@Entity('members')
export class Member {
    @PrimaryGeneratedColumn({ name: 'member_id' })
    memberId!: number;

    @Column({ name: 'email', type: 'varchar', unique: true })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar' })
    passwordHash!: string;

    @Column({ name: 'first_name', type: 'varchar' })
    firstName!: string;

    @Column({ name: 'last_name', type: 'varchar' })
    lastName!: string;

    @Column({ name: 'date_of_birth', type: 'date' })
    dateOfBirth!: Date;

    @Column({ name: 'gender', type: 'varchar' })
    gender!: string;

    @CreateDateColumn({ name: 'registration_date', type: 'date' })
    registrationDate!: Date;

    // Relations
    @OneToMany(() => require('./FitnessGoal').FitnessGoal, (goal: any) => goal.member, { cascade: true })
    fitnessGoals!: any[];

    @OneToMany(() => require('./HealthMetric').HealthMetric, (metric: any) => metric.member, { cascade: true })
    healthMetrics!: any[];

    @OneToMany(() => require('./TrainingSession').TrainingSession, (session: any) => session.member, { cascade: true })
    trainingSessions!: any[];

    @OneToMany(() => require('./ClassEnrollment').ClassEnrollment, (enrollment: any) => enrollment.member, { cascade: true })
    classEnrollments!: any[];

    @OneToMany(() => require('./Bill').Bill, (bill: any) => bill.member, { cascade: true })
    bills!: any[];
}