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
        console.log('Checking for tags column...');
        const [rows] = await connection.execute('SHOW COLUMNS FROM products LIKE "tags"');

        if (rows.length === 0) {
            console.log('Adding tags column to products table...');
            await connection.execute('ALTER TABLE products ADD COLUMN tags VARCHAR(512) AFTER meta_description');
            console.log('Column added successfully.');
        } else {
            console.log('Tags column already exists.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

run();
