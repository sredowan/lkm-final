import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkData() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        console.log('--- Categories ---');
        const [categories] = await connection.execute('SELECT * FROM categories');
        console.table(categories);

        console.log('\n--- Product Counts per Category ---');
        const [counts] = await connection.execute(`
            SELECT c.name, c.slug, COUNT(p.id) as product_count 
            FROM categories c 
            LEFT JOIN products p ON c.id = p.category_id 
            GROUP BY c.id
        `);
        console.table(counts);

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await connection.end();
    }
}

checkData();
