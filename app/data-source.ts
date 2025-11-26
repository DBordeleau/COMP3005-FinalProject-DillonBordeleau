import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as entities from '@/models';
import { CREATEINDEX1700000001000 } from '@/migrations/CREATE_INDEX';
import { CREATETRIGGER1700000002000 } from '@/migrations/CREATE_TRIGGER';
import { CREATEVIEW1700000003000 } from '@/migrations/CREATE_VIEW';
import { CreateDefaultAdmin1732500000000 } from '@/migrations/CreateDefaultAdmin';

let dataSource: DataSource | null = null;
let isInitializing = false;

export async function getDataSource(): Promise<DataSource> {
    // If already initialized, return immediately (this was running on every page load before)
    if (dataSource?.isInitialized) {
        return dataSource;
    }

    // If currently initializing, wait for it
    if (isInitializing) {
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (dataSource?.isInitialized) {
            return dataSource;
        }
    }

    // Start initialization
    isInitializing = true;

    try {
        if (!dataSource) {
            dataSource = new DataSource({
                type: 'postgres',
                host: '127.0.0.1',
                port: 5433,
                username: 'postgres',
                password: 'password',
                database: 'comp3005_final_project',
                synchronize: true,
                logging: false, // reduce console spam
                entities: Object.values(entities),
                migrations: [
                    CREATEINDEX1700000001000,
                    CREATETRIGGER1700000002000,
                    CREATEVIEW1700000003000,
                    CreateDefaultAdmin1732500000000,
                ],
            });
        }

        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            await dataSource.runMigrations();
        }

        return dataSource;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    } finally {
        isInitializing = false;
    }
}