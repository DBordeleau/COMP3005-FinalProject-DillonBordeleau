import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum RoomType {
    STUDIO = 'studio',
    GYM = 'gym',
    CARDIO_ROOM = 'cardio_room',
    WEIGHT_ROOM = 'weight_room',
    YOGA_STUDIO = 'yoga_studio',
    SPIN_ROOM = 'spin_room'
}

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn({ name: 'room_id' })
    roomId!: number;

    @Column({ name: 'name', type: 'varchar' })
    name!: string;

    @Column({ name: 'room_type', type: 'enum', enum: RoomType })
    roomType!: RoomType;

    // Relations
    @OneToMany(() => require('./Equipment').Equipment, (equipment: any) => equipment.room, { cascade: true })
    equipment!: any[];

    @OneToMany(() => require('./TrainingSession').TrainingSession, (session: any) => session.room)
    trainingSessions!: any[];

    @OneToMany(() => require('./GroupClass').GroupClass, (groupClass: any) => groupClass.room)
    groupClasses!: any[];
}