import { MigrationInterface, QueryRunner } from "typeorm";

// Migration class names need to have a timestamp or they fail to run
export class CREATEINDEX1700000001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create index on health_metrics for efficient member dashboard queries
        // Helps quickly find the latest health metrics for a member
        await queryRunner.query(`
            CREATE INDEX idx_health_metrics_member_date 
            ON health_metrics(member_id, recorded_date DESC);
        `);

        // Create index on training_sessions for upcoming sessions queries
        // Helps quickly find all sessions for a member sorted by date
        await queryRunner.query(`
            CREATE INDEX idx_training_sessions_member_date 
            ON training_sessions(member_id, session_date);
        `);

        // Create index on class_enrollments for member enrollment lookups
        // Helps quickly find all classes a member is enrolled in
        await queryRunner.query(`
            CREATE INDEX idx_class_enrollments_member 
            ON class_enrollments(member_id);
        `);
    }

    // Drops the indexes for future rollbacks
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_health_metrics_member_date;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_training_sessions_member_date;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_class_enrollments_member;
        `);
    }
}