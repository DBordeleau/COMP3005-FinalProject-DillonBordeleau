import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from 'bcrypt';

// Creates a default admin account with username "admin@admin.com" and password "admin"
export class CreateDefaultAdmin1732500000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hash the password "admin"
        const passwordHash = await bcrypt.hash('admin', 10);

        // Insert default admin account
        await queryRunner.query(
            `INSERT INTO admin_staff (email, password_hash, first_name, last_name) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING`,
            ['admin@admin.com', passwordHash, 'Super', 'Admin']
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove default admin on rollback
        await queryRunner.query(
            `DELETE FROM admin_staff WHERE email = $1`,
            ['admin@admin.com']
        );
    }
}