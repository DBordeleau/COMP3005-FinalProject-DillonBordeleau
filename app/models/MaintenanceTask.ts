import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

export enum MaintenanceStatus {
    PENDING = 'Pending',
    COMPLETED = 'Completed',
}

@Entity('maintenance_tasks')
export class MaintenanceTask {
    @PrimaryGeneratedColumn({ name: 'maintenance_id' })
    maintenanceId!: number;

    @Column({ name: 'equipment_id', type: 'int' })
    equipmentId!: number;

    @Column({ name: 'admin_id', type: 'int' })
    adminId!: number;

    @Column({ name: 'description', type: 'text' })
    description!: string;

    @CreateDateColumn({ name: 'created_date', type: 'date' })
    createdDate!: Date;

    @Column({ name: 'status', type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.PENDING })
    status!: MaintenanceStatus;

    @Column({ name: 'assignee', type: 'varchar', nullable: true })
    assignee!: string;

    @Column({ name: 'resolved_date', type: 'date', nullable: true })
    resolvedDate!: Date;

    // Relations
    @ManyToOne(() => require('./Equipment').Equipment, (equipment: any) => equipment.maintenanceTasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'equipment_id' })
    equipment!: any;

    @ManyToOne(() => require('./AdminStaff').AdminStaff, (admin: any) => admin.maintenanceTasks)
    @JoinColumn({ name: 'admin_id' })
    adminStaff!: any;
}