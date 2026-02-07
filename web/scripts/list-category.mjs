import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listCategoryProducts(slug) {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        const [products] = await connection.execute(`
            SELECT p.name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE c.slug = ?
        `, [slug]);

        console.log(`Found ${products.length} products in category '${slug}'.`);
        products.forEach(p => console.log(`- ${p.name.substring(0, 50)}`));

    } catch (error) {
        console.error('List failed:', error);
    } finally {
        await connection.end();
    }
}

listCategoryProducts('wall-chargers');
listCategoryProducts('audio');
