import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';

export enum BillStatus {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
    OVERDUE = 'OVERDUE'
}

@Entity('bills')
export class Bill {
    @PrimaryGeneratedColumn({ name: 'bill_id' })
    billId!: number;

    @Column({ name: 'member_id', type: 'int' })
    memberId!: number;

    @Column({ name: 'admin_id', type: 'int' })
    adminId!: number;

    @CreateDateColumn({ name: 'bill_date', type: 'date' })
    billDate!: Date;

    @Column({ name: 'status', type: 'enum', enum: BillStatus, default: BillStatus.UNPAID })
    status!: BillStatus;

    @Column({ name: 'due_date', type: 'date' })
    dueDate!: Date;

    // Relations
    @ManyToOne(() => require('./Member').Member, (member: any) => member.bills, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'member_id' })
    member!: any;

    @ManyToOne(() => require('./AdminStaff').AdminStaff, (admin: any) => admin.bills)
    @JoinColumn({ name: 'admin_id' })
    adminStaff!: any;

    @OneToMany(() => require('./LineItem').LineItem, (lineItem: any) => lineItem.bill, { cascade: true })
    lineItems!: any[];

    @OneToMany(() => require('./Payment').Payment, (payment: any) => payment.bill, { cascade: true })
    payments!: any[];
}
