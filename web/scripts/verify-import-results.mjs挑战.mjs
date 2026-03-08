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
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king'
    });

    try {
        console.log('Verifying imported products for iPhone 15 Pro Max...');

        // Count products in the subcategory
        const [rows] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM products 
            WHERE category_id = (SELECT id FROM categories WHERE name = 'iPhone 15 Pro Max' LIMIT 1)
        `);
        console.log(`Total products in iPhone 15 Pro Max: ${rows[0].count}`);

        // Sample products check
        const [samples] = await connection.execute(`
            SELECT name, price, compare_price, tags, stock 
            FROM products 
            WHERE category_id = (SELECT id FROM categories WHERE name = 'iPhone 15 Pro Max' LIMIT 1)
            LIMIT 5
        `);
        console.table(samples);

        // Check image count
        const [imageCount] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM product_images pi
            JOIN products p ON pi.product_id = p.id
            WHERE p.category_id = (SELECT id FROM categories WHERE name = 'iPhone 15 Pro Max' LIMIT 1)
        `);
        console.log(`Total images for these products: ${imageCount[0].count}`);

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await connection.end();
    }
}

verify();
