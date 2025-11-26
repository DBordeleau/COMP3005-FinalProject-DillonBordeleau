import { MigrationInterface, QueryRunner } from "typeorm";

// Migration class names need to have a timestamp or they fail to run
export class CREATEVIEW1700000003000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create view for member dashboard summary
        // Aggregates member data with their latest health metrics,
        // active goals count, total classes enrolled, and upcoming sessions
        await queryRunner.query(`
            CREATE VIEW member_dashboard_summary AS
            SELECT 
                m.member_id,
                m.first_name,
                m.last_name,
                m.email,
                m.gender,
                m.registration_date,
                -- Latest health metrics (most recent entry)
                (SELECT weight 
                 FROM health_metrics hm 
                 WHERE hm.member_id = m.member_id 
                 ORDER BY recorded_date DESC 
                 LIMIT 1) as latest_weight,
                (SELECT body_fat_percentage 
                 FROM health_metrics hm 
                 WHERE hm.member_id = m.member_id 
                 ORDER BY recorded_date DESC 
                 LIMIT 1) as latest_body_fat,
                (SELECT heart_rate 
                 FROM health_metrics hm 
                 WHERE hm.member_id = m.member_id 
                 ORDER BY recorded_date DESC 
                 LIMIT 1) as latest_heart_rate,
                (SELECT recorded_date 
                 FROM health_metrics hm 
                 WHERE hm.member_id = m.member_id 
                 ORDER BY recorded_date DESC 
                 LIMIT 1) as latest_metric_date,
                -- Count of active fitness goals
                (SELECT COUNT(*) 
                 FROM fitness_goals fg 
                 WHERE fg.member_id = m.member_id 
                 AND fg.status = 'In Progress') as active_goals_count,
                -- Total number of classes enrolled (all time)
                (SELECT COUNT(*) 
                 FROM class_enrollments ce 
                 WHERE ce.member_id = m.member_id) as total_classes_enrolled,
                -- Count of upcoming training sessions
                (SELECT COUNT(*) 
                 FROM training_sessions ts 
                 WHERE ts.member_id = m.member_id 
                 AND ts.session_date >= CURRENT_DATE) as upcoming_sessions_count
            FROM members m;
        `);
    }

    // Drops view for rollbacks
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP VIEW IF EXISTS member_dashboard_summary;
        `);
    }
}