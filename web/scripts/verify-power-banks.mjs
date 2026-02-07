import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        const [rows] = await connection.execute(`
            SELECT p.id, p.name, p.price, p.compare_price, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE c.name = 'Power Bank'
        `);

        console.log(`Found ${rows.length} products in 'Power Bank' category.`);

        if (rows.length > 0) {
            console.log('Sample products:');
            rows.slice(0, 5).forEach(p => {
                console.log(`- ${p.name}: Price $${p.price} (Compare $${p.compare_price})`);
            });
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await connection.end();
    }
}

verify();
