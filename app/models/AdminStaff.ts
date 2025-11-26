import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('admin_staff')
export class AdminStaff {
    @PrimaryGeneratedColumn({ name: 'admin_id' })
    adminId!: number;

    @Column({ unique: true, type: 'varchar' })
    email!: string;

    @Column({ name: 'password_hash', type: 'varchar' })
    passwordHash!: string;

    @Column({ name: 'first_name', type: 'varchar' })
    firstName!: string;

    @Column({ name: 'last_name', type: 'varchar' })
    lastName!: string;

    // Relations (removed bill and equipment relations)
}