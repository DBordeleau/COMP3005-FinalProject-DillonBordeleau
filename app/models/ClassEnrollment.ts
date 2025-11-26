import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';

@Entity('class_enrollments')
@Unique(['classId', 'memberId'])
export class ClassEnrollment {
    @PrimaryGeneratedColumn({ name: 'enrollment_id' })
    enrollmentId!: number;

    @Column({ name: 'class_id', type: 'int' })
    classId!: number;

    @Column({ name: 'member_id', type: 'int' })
    memberId!: number;

    @CreateDateColumn({ name: 'enrollment_date', type: 'date' })
    enrollmentDate!: Date;

    // Relations
    @ManyToOne(() => require('./GroupClass').GroupClass, (groupClass: any) => groupClass.enrollments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'class_id' })
    groupClass!: any;

    @ManyToOne(() => require('./Member').Member, (member: any) => member.classEnrollments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member!: any;
}