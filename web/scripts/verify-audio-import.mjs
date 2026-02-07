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
        console.log('Verifying Audio Import...');

        // 1. Check Category
        const [categories] = await connection.execute('SELECT * FROM categories WHERE name = "Audio"');
        if (categories.length === 0) {
            console.error('FAIL: "Audio" category not found.');
        } else {
            console.log(`PASS: "Audio" category found (ID: ${categories[0].id})`);

            // 2. Count Products
            const categoryId = categories[0].id;
            const [products] = await connection.execute('SELECT count(*) as count FROM products WHERE category_id = ?', [categoryId]);
            console.log(`PASS: Found ${products[0].count} products in "Audio" category.`);

            // 3. Check a sample product
            const [sampleProduct] = await connection.execute('SELECT * FROM products WHERE category_id = ? LIMIT 1', [categoryId]);
            if (sampleProduct.length > 0) {
                const p = sampleProduct[0];
                console.log(`Sample Product: ${p.name}`);
                console.log(`  Price: ${p.price}`);
                console.log(`  Compare Price: ${p.compare_price}`);
                console.log(`  Stock: ${p.stock}`);
                console.log(`  Description Preview: ${p.description ? p.description.substring(0, 200) + '...' : 'N/A'}`);

                // 4. Check images for sample
                const [images] = await connection.execute('SELECT * FROM product_images WHERE product_id = ?', [p.id]);
                console.log(`  Images: ${images.length} found.`);
                images.forEach(img => console.log(`    - ${img.image_url} (${img.is_primary ? 'Primary' : 'Secondary'})`));
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await connection.end();
    }
}

verify();
