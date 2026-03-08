import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
    const conn = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king'
    });

    try {
        const [cat] = await conn.execute('SELECT id FROM categories WHERE name = "17 Pro Max"');
        if (cat.length === 0) {
            console.log('Category "17 Pro Max" not found!');
            return;
        }
        const categoryId = cat[0].id;

        const [p] = await conn.execute('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [categoryId]);
        console.log(`Products in 17 Pro Max category: ${p[0].count}`);

        const [img] = await conn.execute(
            'SELECT COUNT(*) as count FROM product_images WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)',
            [categoryId]
        );
        console.log(`Total images for these products: ${img[0].count}`);

        const [tags] = await conn.execute(
            'SELECT name, tags FROM products WHERE category_id = ? LIMIT 3',
            [categoryId]
        );
        console.log('Sample products and tags:');
        tags.forEach(t => console.log(` - ${t.name}: [${t.tags}]`));

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await conn.end();
    }
}

verify();
