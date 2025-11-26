import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('health_metrics')
export class HealthMetric {
    @PrimaryGeneratedColumn({ name: 'metric_id' })
    metricId!: number;

    @Column({ name: 'member_id', type: 'int' })
    memberId!: number;

    @CreateDateColumn({ name: 'recorded_date', type: 'timestamp' })
    recordedDate!: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    weight!: number;

    @Column({ name: 'body_fat_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
    bodyFatPercentage!: number;

    @Column({ name: 'heart_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
    heartRate!: number;

    @Column({ name: 'blood_pressure', type: 'decimal', precision: 5, scale: 2, nullable: true })
    bloodPressure!: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes!: string;

    // Relations
    @ManyToOne(() => require('./Member').Member, (member: any) => member.healthMetrics, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member!: any;
}