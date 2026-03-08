import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyData() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    const targetName = 'Baseus Premium Mini Car Ashtray with LED Light';
    let output = '';

    try {
        const [rows] = await connection.execute('SELECT * FROM products WHERE name = ?', [targetName]);

        if (rows.length > 0) {
            const product = rows[0];
            output += `Product Found: ${product.name}\n`;
            output += `Price: ${product.price}\n`;
            output += `Compare Price: ${product.compare_price}\n`;
            output += `Stock: ${product.stock}\n`;

            // Check images
            const [images] = await connection.execute('SELECT * FROM product_images WHERE product_id = ?', [product.id]);
            output += `Images Count: ${images.length}\n`;
            images.forEach(i => output += `Image: ${i.image_url}\n`);
        } else {
            output += `Product not found: ${targetName}\n`;
        }

        fs.writeFileSync('verification_result.txt', output);
        console.log('Verification result written to verification_result.txt');

    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

verifyData();
