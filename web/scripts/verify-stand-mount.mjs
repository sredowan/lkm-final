import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_NAME = 'Stand & Mount';

async function verifyImport() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        console.log('Verifying Stand & Mount Import...');

        // 1. Check Category
        const [categories] = await connection.execute('SELECT id FROM categories WHERE name = ?', [CATEGORY_NAME]);
        if (categories.length === 0) {
            console.error(`Category '${CATEGORY_NAME}' not found!`);
            return;
        }
        const categoryId = categories[0].id;
        console.log(`Category ID: ${categoryId}`);

        // 2. Count Products
        const [productsCount] = await connection.execute('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [categoryId]);
        console.log(`Total Products in 'Stand & Mount': ${productsCount[0].count}`);

        // 3. Verify a Sample Product
        // Let's pick one known product from JSON: "iQuick Satellite CBT-10Q 3 in 1 Foldable Wireless Charger Stand"
        // Original Price: $149.99
        // Expected Price: 139.99
        // Expected Compare Price: 149.99
        // Expected Stock: 10
        const sampleName = 'iQuick Satellite CBT-10Q 3 in 1 Foldable Wireless Charger Stand';
        const [samples] = await connection.execute('SELECT * FROM products WHERE name = ?', [sampleName]);

        if (samples.length > 0) {
            const product = samples[0];
            console.log('\nSample Product Verification:');
            console.log(`Name: ${product.name}`);
            console.log(`Price: ${product.price} (Expected: 139.99)`);
            console.log(`Compare Price: ${product.compare_price} (Expected: 149.99)`);
            console.log(`Stock: ${product.stock} (Expected: 10)`);

            // Check Images
            const [images] = await connection.execute('SELECT * FROM product_images WHERE product_id = ?', [product.id]);
            console.log(`Image Count: ${images.length}`);
            images.forEach(img => {
                console.log(` - ${img.is_primary ? '[Main]' : '[Extra]'} ${img.image_url}`);
            });
        } else {
            console.error(`Sample product '${sampleName}' not found.`);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await connection.end();
    }
}

verifyImport();
