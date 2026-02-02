import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        });

        const [products] = await connection.execute('SELECT id, name, price FROM products');
        console.log('Total Products in DB:', products.length);

        for (const p of products.slice(0, 5)) {
            const [img] = await connection.execute('SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = 1', [p.id]);
            const imagePath = img[0] ? img[0].image_url : 'NO IMAGE';
            console.log(`- ${p.name}: $${p.price} (Image: ${imagePath})`);
        }

        const [images] = await connection.execute('SELECT count(*) as count FROM product_images');
        console.log('Total Entries in product_images:', images[0].count);

        const [categories] = await connection.execute('SELECT id, name FROM categories WHERE name IN ("Accessory", "Tech Accessories", "Chargers")');
        console.log('Categories Created:', categories);

        // Check image files
        const uploadsDir = path.join(__dirname, '../public/uploads/products');
        const files = fs.readdirSync(uploadsDir);
        console.log('Total Files in uploads/products:', files.length);

    } catch (err) {
        console.error('Verification FAILED:', err);
    } finally {
        if (connection) await connection.end();
    }
}

verify();
