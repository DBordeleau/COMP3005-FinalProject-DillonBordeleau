import { MigrationInterface, QueryRunner } from "typeorm";

// Migration class names need to have a timestamp or they fail to run
export class CREATETRIGGER1700000002000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create trigger function to automatically update bill payment status
        // Calculates total paid vs total bill amount and updates status accordingly
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_payment_status()
            RETURNS TRIGGER AS $$
            DECLARE
                total_paid DECIMAL(10,2);
                bill_total DECIMAL(10,2);
            BEGIN
                -- Calculate total amount paid for this bill
                SELECT COALESCE(SUM(amount), 0) INTO total_paid
                FROM payments
                WHERE bill_id = NEW.bill_id;
                
                -- Calculate total bill amount from line items
                SELECT COALESCE(SUM(amount), 0) INTO bill_total
                FROM line_items
                WHERE bill_id = NEW.bill_id;
                
                -- Update bill status based on payment completion
                UPDATE bills
                SET status = CASE
                    WHEN total_paid >= bill_total THEN 'PAID'
                    WHEN total_paid > 0 AND total_paid < bill_total THEN 'UNPAID'
                    ELSE 'UNPAID'
                END
                WHERE bill_id = NEW.bill_id;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger the function whenever a payment is inserted or updated
        await queryRunner.query(`
            CREATE TRIGGER trigger_update_payment_status
            AFTER INSERT OR UPDATE ON payments
            FOR EACH ROW
            EXECUTE FUNCTION update_payment_status();
        `);

        // Create trigger function to check class capacity before class enrollment
        // Prevents enrolling in a class that has reached its capacity limit
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_class_capacity()
            RETURNS TRIGGER AS $$
            DECLARE
                current_enrollment INT;
                max_capacity INT;
            BEGIN
                -- Get current enrollment count for the class
                SELECT COUNT(*) INTO current_enrollment
                FROM class_enrollments
                WHERE class_id = NEW.class_id;
                
                -- Get the maximum capacity for the class
                SELECT capacity INTO max_capacity
                FROM group_classes
                WHERE class_id = NEW.class_id;
                
                -- Check if class is at capacity
                IF current_enrollment >= max_capacity THEN
                    RAISE EXCEPTION 'Class is at full capacity. Cannot enroll more members.';
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger the function before inserting a new enrollment
        await queryRunner.query(`
            CREATE TRIGGER trigger_check_class_capacity
            BEFORE INSERT ON class_enrollments
            FOR EACH ROW
            EXECUTE FUNCTION check_class_capacity();
        `);
    }

    // Drop triggers and functions for rollbacks
    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop trigger first, then the function
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_update_payment_status ON payments;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS update_payment_status();
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_check_class_capacity ON class_enrollments;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS check_class_capacity();
        `);
    }
}