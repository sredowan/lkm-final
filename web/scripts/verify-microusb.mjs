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
        const [cats] = await connection.execute('SELECT * FROM categories WHERE slug = ?', ['micro-usb-cables']);
        if (cats.length === 0) {
            console.log('Category NOT FOUND!');
            return;
        }
        const cat = cats[0];
        console.log(`Category Found: ${cat.name} (ID: ${cat.id})`);

        const [products] = await connection.execute('SELECT count(*) as count FROM products WHERE category_id = ?', [cat.id]);
        console.log(`Product Count: ${products[0].count}`);

        const [sample] = await connection.execute('SELECT * FROM products WHERE category_id = ? LIMIT 1', [cat.id]);
        if (sample.length > 0) {
            console.log('Sample Product:', sample[0].name);
            console.log('Price:', sample[0].price);
            console.log('Compare Price:', sample[0].compare_price);
            console.log('Stock:', sample[0].stock);

            const [imgs] = await connection.execute('SELECT * FROM product_images WHERE product_id = ?', [sample[0].id]);
            console.log('Images:', imgs.length);
            console.log('First Image URL:', imgs[0]?.image_url);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

verify();
