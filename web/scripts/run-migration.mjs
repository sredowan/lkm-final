
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king',
        multipleStatements: true
    });

    console.log('Connected to database.');

    try {
        const sqlPath = path.join(process.cwd(), 'drizzle', '0003_concerned_terror.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration 0003_concerned_terror.sql...');

        // Split by statement-breakpoint if needed, but multipleStatements: true should handle it if formatted correctly
        // However, drizzle sql files often have --> statement-breakpoint which mysql2 doesn't like directly
        const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);

        for (const statement of statements) {
            console.log('Executing:', statement.substring(0, 50) + '...');
            try {
                await connection.query(statement);
                console.log('Done.');
            } catch (stmtError) {
                if (stmtError.code === 'ER_TABLE_EXISTS_ERROR' ||
                    stmtError.code === 'ER_DUP_FIELDNAME' ||
                    stmtError.code === 'ER_FK_DUP_NAME' ||
                    stmtError.code === 'ER_DUP_KEY') {
                    console.log('Skipping (already exists/duplicate)');
                } else {
                    console.error('Error executing statement:', stmtError.message);
                }
            }
        }

        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

runMigration();
