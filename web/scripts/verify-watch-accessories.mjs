import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_NAME = 'Watch Accessories';

async function verifyImport() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        console.log('Verifying Watch Accessories Import...');

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
        console.log(`Total Products in 'Watch Accessories': ${productsCount[0].count}`);

        // 3. Verify a Sample Product
        // Original Price: $23.00
        // Expected Price: 13.00
        // Expected Compare Price: 23.00
        // Expected Stock: 10
        const sampleName = 'REDEFINE Hard PC Case with Tempered Glass Screen Protector for Apple Watch Series 10 46mm';
        const [samples] = await connection.execute('SELECT * FROM products WHERE name = ?', [sampleName]);

        if (samples.length > 0) {
            const product = samples[0];
            console.log('\nSample Product Verification:');
            console.log(`Name: ${product.name}`);
            console.log(`Price: ${product.price} (Expected: 13.00)`);
            console.log(`Compare Price: ${product.compare_price} (Expected: 23.00)`);
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
