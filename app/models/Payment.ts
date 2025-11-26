import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

export enum PaymentMethod {
    CREDIT_CARD = 'Credit Card',
    DEBIT_CARD = 'Debit Card',
    CASH = 'Cash',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn({ name: 'payment_id' })
    paymentId!: number;

    @Column({ name: 'bill_id', type: 'int' })
    billId!: number;

    @CreateDateColumn({ name: 'payment_date', type: 'date' })
    paymentDate!: Date;

    @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.CREDIT_CARD })
    paymentMethod!: PaymentMethod;

    // Relations
    @ManyToOne(() => require('./Bill').Bill, (bill: any) => bill.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bill_id' })
    bill!: any;
}