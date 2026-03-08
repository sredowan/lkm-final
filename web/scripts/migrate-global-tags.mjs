import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king'
    });

    try {
        console.log('Creating global_tags table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS global_tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Table created or already exists.');

        console.log('Populating global_tags from existing product tags...');
        const [products] = await connection.execute('SELECT tags FROM products WHERE tags IS NOT NULL');

        const uniqueTags = new Set();
        products.forEach(p => {
            const tagList = p.tags.split(',').map(t => t.trim()).filter(Boolean);
            tagList.forEach(t => uniqueTags.add(t));
        });

        console.log(`Found ${uniqueTags.size} unique tags. Inserting...`);

        for (const tag of uniqueTags) {
            try {
                await connection.execute('INSERT IGNORE INTO global_tags (name) VALUES (?)', [tag]);
            } catch (e) {
                // Ignore duplicates
            }
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

run();
