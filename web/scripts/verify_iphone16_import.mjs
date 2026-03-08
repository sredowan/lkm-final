import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    const [rows] = await conn.execute('SELECT COUNT(*) as c FROM products WHERE category_id = (SELECT id FROM categories WHERE name = "iPhone 16 Pro")');
    console.log('Products imported:', rows[0].c);

    const [imgs] = await conn.execute('SELECT COUNT(*) as c FROM product_images WHERE product_id IN (SELECT id FROM products WHERE category_id = (SELECT id FROM categories WHERE name = "iPhone 16 Pro"))');
    console.log('Images imported:', imgs[0].c);

    const [sample] = await conn.execute('SELECT name, tags, price, compare_price FROM products WHERE category_id = (SELECT id FROM categories WHERE name = "iPhone 16 Pro") LIMIT 3');
    console.log('Sample products:', sample);

    await conn.end();
}
run().catch(console.error);
