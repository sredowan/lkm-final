import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listAdapters() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        const [products] = await connection.execute(`
            SELECT p.name, c.name as category_name, c.slug as category_slug 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.name LIKE '%adapter%' OR p.description LIKE '%adapter%'
            ORDER BY c.name
        `);

        console.log(`Found ${products.length} products.`);
        products.forEach(p => {
            console.log(`[${p.category_name}] ${p.name.substring(0, 50)}`);
        });

    } catch (error) {
        console.error('List failed:', error);
    } finally {
        await connection.end();
    }
}

listAdapters();
