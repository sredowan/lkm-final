import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkImport() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        const [rows] = await connection.execute(`
            SELECT COUNT(p.id) as count 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE c.name = 'Car Accessories'
        `);
        console.log(`Current Product Count: ${rows[0].count}`);

    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

checkImport();
