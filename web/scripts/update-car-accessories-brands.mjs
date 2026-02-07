import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_NAME = 'Car Accessories';

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

async function run() {
    console.log('Starting brand update for Car Accessories...');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        // 1. Ensure iQuick brand exists
        console.log('Checking for iQuick brand...');
        const [iquickBrand] = await connection.execute(
            'SELECT id FROM brands WHERE name = ?',
            ['iQuick']
        );

        if (iquickBrand.length === 0) {
            console.log('iQuick brand not found. Creating it...');
            const iquickSlug = slugify('iQuick');
            await connection.execute(
                'INSERT INTO brands (name, slug, is_popular, is_active, sort_order) VALUES (?, ?, ?, ?, ?)',
                ['iQuick', iquickSlug, false, true, 100]
            );
            console.log('Created iQuick brand.');
        } else {
            console.log('iQuick brand already exists.');
        }

        // 2. Get Car Accessories Category ID
        const [categories] = await connection.execute(
            'SELECT id FROM categories WHERE name = ?',
            [CATEGORY_NAME]
        );

        if (categories.length === 0) {
            console.error(`Category '${CATEGORY_NAME}' not found!`);
            return;
        }

        const categoryId = categories[0].id;
        console.log(`Found category '${CATEGORY_NAME}' with ID: ${categoryId}`);

        // 3. Fetch products in the category
        const [products] = await connection.execute(
            'SELECT id, name, brand FROM products WHERE category_id = ?',
            [categoryId]
        );

        console.log(`Found ${products.length} products to process.`);

        let updatedCount = 0;

        for (const product of products) {
            let newBrand = null;

            if (product.name.toLowerCase().includes('baseus')) {
                newBrand = 'Baseus';
            } else if (product.name.toLowerCase().includes('iquick')) {
                newBrand = 'iQuick';
            }

            if (newBrand && product.brand !== newBrand) {
                await connection.execute(
                    'UPDATE products SET brand = ? WHERE id = ?',
                    [newBrand, product.id]
                );
                console.log(`Updated product '${product.name}' brand to '${newBrand}'`);
                updatedCount++;
            } else if (newBrand) {
                // Brand is already correct
                // console.log(`Product '${product.name}' already has brand '${newBrand}'`);
            } else {
                console.log(`Skipping product '${product.name}': No matching brand keyword found.`);
            }
        }

        console.log(`\nUpdate completed. Updated brands for ${updatedCount} products.`);

    } catch (error) {
        console.error('Error updating brands:', error);
    } finally {
        await connection.end();
    }
}

run();
