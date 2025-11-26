import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum EquipmentStatus {
    OPERATIONAL = 'operational',
    OUT_OF_ORDER = 'out_of_order',
}

@Entity('equipment')
export class Equipment {
    @PrimaryGeneratedColumn({ name: 'equipment_id' })
    equipmentId!: number;

    @Column({ name: 'room_id', type: 'int' })
    roomId!: number;

    @Column({ name: 'name', type: 'varchar' })
    name!: string;

    @Column({ name: 'purchase_date', type: 'date' })
    purchaseDate!: Date;

    @Column({ name: 'status', type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.OPERATIONAL })
    status!: EquipmentStatus;

    // Relations
    @ManyToOne(() => require('./Room').Room, (room: any) => room.equipment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'room_id' })
    room!: any;

    @OneToMany(() => require('./MaintenanceTask').MaintenanceTask, (task: any) => task.equipment, { cascade: true })
    maintenanceTasks!: any[];
}
