import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

export enum GoalStatus {
    IN_PROGRESS = 'In Progress',
    ACHIEVED = 'Achieved',
    FAILED = 'Failed',
    CANCELLED = 'Cancelled'
}

@Entity('fitness_goals')
export class FitnessGoal {
    @PrimaryGeneratedColumn({ name: 'goal_id' })
    goalId!: number;

    @Column({ name: 'member_id', type: 'int' })
    memberId!: number;

    @Column({ name: 'name', type: 'varchar' })
    name!: string;

    @Column({ name: 'target_value', type: 'varchar' })
    targetValue!: string;

    @Column({ name: 'target_date', type: 'date' })
    targetDate!: Date;

    @CreateDateColumn({ name: 'created_date', type: 'date' })
    createdDate!: Date;

    @Column({ name: 'status', type: 'enum', enum: GoalStatus, default: GoalStatus.IN_PROGRESS })
    status!: GoalStatus;

    // Relations
    @ManyToOne(() => require('./Member').Member, (member: any) => member.fitnessGoals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member!: any;
}