import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function dumpData() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        const [categories] = await connection.execute('SELECT * FROM categories');
        const [counts] = await connection.execute(`
            SELECT c.name, c.slug, COUNT(p.id) as product_count 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.category_id 
            GROUP BY c.id
        `);

        let output = '--- Categories ---\n';
        output += JSON.stringify(categories, null, 2);
        output += '\n\n--- Product Counts ---\n';
        output += JSON.stringify(counts, null, 2);

        fs.writeFileSync('db_dump.txt', output);
        console.log('Dumped to db_dump.txt');

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await connection.end();
    }
}

dumpData();
