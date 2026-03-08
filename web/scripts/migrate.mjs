import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from '../src/db/index';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    console.log('Running migrations...');
    try {
        await migrate(db, {
            migrationsFolder: path.join(__dirname, '../drizzle'),
        });
        console.log('Migrations applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
