import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_NAME = 'iPhone 15';

async function verify() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king'
    });

    try {
        console.log(`Verifying imports for category: ${CATEGORY_NAME}`);

        // 1. Check Category
        const [categories] = await connection.execute('SELECT id, name FROM categories WHERE name = ?', [CATEGORY_NAME]);
        if (categories.length === 0) {
            console.error(`Error: Category '${CATEGORY_NAME}' not found.`);
            return;
        }
        const categoryId = categories[0].id;
        console.log(`✔ Category '${CATEGORY_NAME}' found with ID ${categoryId}`);

        // 2. Check Products
        const [products] = await connection.execute(`
            SELECT p.id, p.name, p.price, p.compare_price, p.stock, p.tags, p.meta_title, p.meta_description,
                   (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
            FROM products p
            WHERE p.category_id = ?
        `, [categoryId]);

        console.log(`\n✔ Found ${products.length} products in this category.`);

        let hasIssues = false;
        let imagesChecked = 0;

        // Print sample details of a few products
        console.log(`\nSample of imported products:`);
        for (let i = 0; i < Math.min(3, products.length); i++) {
            const p = products[i];
            console.log(`\n  --- Product: ${p.name} ---`);
            console.log(`  Price: $${p.price} (Compare at: $${p.compare_price})`);
            console.log(`  Stock: ${p.stock}`);
            console.log(`  Tags: ${p.tags}`);
            console.log(`  Images in DB: ${p.image_count}`);
            console.log(`  Meta Title: ${p.meta_title?.substring(0, 30)}...`);
            console.log(`  Meta Desc: ${p.meta_description?.substring(0, 30)}...`);

            if (p.price == p.compare_price && p.price > 15) {
                console.log(`  ⚠️ WARNING: Price ($${p.price}) and Compare Price ($${p.compare_price}) are the same, but price > 15.`);
                hasIssues = true;
            }
            if (p.image_count === 0) {
                console.log(`  ⚠️ WARNING: No images found in database for product: ${p.name}`);
                hasIssues = true;
            }
        }

        // 3. Check Filesystem for Images
        const uploadDir = path.join(__dirname, '../public/uploads/products');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            const iphone15Files = files.filter(f => f.includes('iphone-15-') || f.includes('extra'));
            console.log(`\n✔ Found ~${iphone15Files.length} images in ${uploadDir} that might be related to this import.`);

            if (iphone15Files.length < products.length) {
                console.log(`  ⚠️ WARNING: Upload directory has fewer files (${iphone15Files.length}) than products (${products.length}). Some images might have failed to download or have different naming.`);
            }
        } else {
            console.log(`  ⚠️ WARNING: Upload directory ${uploadDir} not found.`);
            hasIssues = true;
        }

        if (!hasIssues) {
            console.log(`\n✅ Verification passed. Products and images look good.`);
        } else {
            console.log(`\n⚠️ Verification finished with warnings. Please review the output above.`);
        }

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await connection.end();
    }
}

verify();
