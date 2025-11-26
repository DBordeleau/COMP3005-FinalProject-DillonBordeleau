import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum ServiceType {
    PERSONAL_TRAINING = 'Personal Training',
    GROUP_CLASS = 'Group Class',
    MEMBERSHIP_FEE = 'Membership Fee'
}

@Entity('line_items')
export class LineItem {
    @PrimaryGeneratedColumn({ name: 'line_item_id' })
    lineItemId!: number;

    @Column({ name: 'bill_id', type: 'int' })
    billId!: number;

    @Column({ name: 'service_type', type: 'enum', enum: ServiceType })
    serviceType!: ServiceType;

    @Column({ name: 'description', type: 'varchar' })
    description!: string;

    @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    // Relations
    @ManyToOne(() => require('./Bill').Bill, (bill: any) => bill.lineItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bill_id' })
    bill!: any;
}