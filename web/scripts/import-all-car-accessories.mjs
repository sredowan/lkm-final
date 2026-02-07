import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_NAME = 'Car Accessories';
const STOCK_QUANTITY = 10;
const PRICE_REDUCTION = 10;

const products = [
    { name: 'iQuick CQ2 38W Fast Car Charging USB-A & USB-C Ports', listPrice: 34.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/image/400x400/9df78eab33525d08d6e5fb8d27136e95/i/q/iquick-38caruc_6.jpg' },
    { name: 'iQuick CQ1 36W Fast Car Charging Dual USB-A Ports', listPrice: 34.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/i/q/iquick-36caruc.jpg' },
    { name: 'Baseus Share Together PPS Multi-port Fast Charging Car Charger with Extension Cord 120W 3U+1C (Gray)', listPrice: 74.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/c/ccbt-b0g.jpg' },
    { name: 'Baseus Share Together PPS Multi-port Fast Charging Car Charger with Extension Cord 120W 2U+2C (Gray)', listPrice: 74.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/c/ccbt-a0g_1.jpg' },
    { name: 'Baseus Circular Plastic Car Charger (C+C) + (C&L) Cable 60W – Cosmic Black', listPrice: 79.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/0/c00035902121-00-4_2.jpg' },
    { name: 'Baseus Circular Plastic Car Charger (U+C) + (C&L) Cable 60W – Cosmic Black', listPrice: 69.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/0/c00035902121-01-02.jpg' },
    { name: 'Baseus Tiny Star 30W Mini Car Charger with USB-C Cable – Cosmic Black', listPrice: 49.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/0/c00035001121-00-13.jpg' },
    { name: 'Baseus Enjoyment Retractable 2-in-1 Car Charger C+L 30W – Black', listPrice: 74.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/g/cgtx000001_1.jpg' },
    { name: 'Baseus Enjoyment Retractable 2-in-1 Car Charger C+C 33W', listPrice: 69.99, imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/0/c00035500111-00.jpg' },
    { name: 'Baseus Enjoyment Pro Car Charger C + Retractable iP Cable 55W – Cluster Black', listPrice: 64.99, imageUrl: null },
    { name: 'Baseus Enjoyment Pro Car Charger U + Retractable Type-C Cable 60W – Cluster Black', listPrice: 59.99, imageUrl: null },
    { name: 'Baseus S-09 Pro Series Car FM Transmitter – Cluster Black', listPrice: 59.99, imageUrl: null },
    { name: 'Baseus T-Typed S-09A Bluetooth MP3 Car Charger (Standard Edition) – Black', listPrice: 49.99, imageUrl: null },
    { name: 'Baseus GoTrip DP1 Car Charger C+C 30W – Cosmic Black', listPrice: 44.99, imageUrl: null },
    { name: 'Baseus Particular Digital Display QC + PPS Dual Quick Car Charger 65W (with C-to-C 100W Cable) – Dark Gray', listPrice: 77.99, imageUrl: null },
    { name: 'Baseus Magic Series PPS Digital Display Dual Quick Car Charger 45W', listPrice: 44.99, imageUrl: null },
    { name: 'Baseus Magic Series Dual QC Digital Display Car Charger 45W', listPrice: 44.99, imageUrl: null },
    { name: 'Baseus Digital Display Dual USB 4.8A Car Charger 24W', listPrice: 39.99, imageUrl: null },
    { name: 'Baseus Golden Contactor Max Dual Fast Charger U+C 60W', listPrice: 44.99, imageUrl: null },
    { name: 'Baseus Golden Contactor Max Dual Fast Charger U+U 60W', listPrice: 44.99, imageUrl: null },
    { name: 'Baseus Golden Contactor Pro Triple Fast Charger U+C+C 65W', listPrice: 64.99, imageUrl: null },
    { name: 'Baseus Golden Contactor Pro Dual Fast Charger U+C 40W – Dark Gray', listPrice: 39.99, imageUrl: null },
    { name: 'Baseus Golden Contactor Pro Dual Quick Charger U+C 40W (with C-to-iP Cable) – Dark Gray', listPrice: 49.99, imageUrl: null },
    { name: 'Baseus Golden Contactor Pro Dual Fast Charger U+U 40W – Dark Gray', listPrice: 39.99, imageUrl: null },
    { name: 'Baseus Circular Plastic A+C 30W PPS Car Charger – Black', listPrice: 44.99, imageUrl: null },
    { name: 'Baseus Grain Pro Car Charger (Dual USB 4.8A)', listPrice: 29.99, imageUrl: null },
    { name: 'Baseus Circular Plastic A+A 30W Dual QC3.0 Car Charger – Black', listPrice: 34.99, imageUrl: null }
];

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

async function downloadImage(url, filename) {
    if (!url || url.includes('ajax-load.gif')) return null;

    const uploadDir = path.join(__dirname, '../public/uploads/products');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        console.log(`Downloaded image: ${filename}`);
        return `/uploads/products/${filename}`;
    } catch (error) {
        console.error(`Error downloading image ${url}:`, error.message);
        return null;
    }
}

async function run() {
    console.log('Starting car accessories import of all 31 products...');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        // 1. Get or create category
        const categorySlug = slugify(CATEGORY_NAME);
        const [existingCategories] = await connection.execute(
            'SELECT id FROM categories WHERE slug = ?',
            [categorySlug]
        );

        let categoryId;
        if (existingCategories.length > 0) {
            categoryId = existingCategories[0].id;
            console.log(`Using existing category: ${CATEGORY_NAME} (ID: ${categoryId})`);
        } else {
            const [result] = await connection.execute(
                'INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)',
                [CATEGORY_NAME, categorySlug, true]
            );
            categoryId = result.insertId;
            console.log(`Created new category: ${CATEGORY_NAME} (ID: ${categoryId})`);
        }

        let importedCount = 0;
        let skippedCount = 0;

        // 2. Process products
        for (const item of products) {
            const slug = slugify(item.name);
            const price = Math.max(0, item.listPrice - PRICE_REDUCTION);
            const comparePrice = item.listPrice;

            const [existing] = await connection.execute(
                'SELECT id FROM products WHERE slug = ?',
                [slug]
            );

            let productId;
            if (existing.length > 0) {
                productId = existing[0].id;
                console.log(`SKIPPING: Product already exists: ${item.name}`);
                skippedCount++;
            } else {
                const [result] = await connection.execute(
                    `INSERT INTO products 
                    (name, slug, description, price, compare_price, stock, category_id, is_active) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [item.name, slug, item.name, price, comparePrice, STOCK_QUANTITY, categoryId, true]
                );
                productId = result.insertId;
                console.log(`ADDED: ${item.name} (ID: ${productId}, Price: ${price}, Compare: ${comparePrice})`);
                importedCount++;

                // 3. Handle image
                if (item.imageUrl) {
                    const imageFilename = `${slug}.jpg`;
                    const localImagePath = await downloadImage(item.imageUrl, imageFilename);

                    if (localImagePath) {
                        await connection.execute(
                            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                            [productId, localImagePath, true]
                        );
                        console.log(`   Image added: ${localImagePath}`);
                    }
                }
            }
        }

        console.log(`Import completed successfully!`);
        console.log(`Summary: ${importedCount} added, ${skippedCount} skipped.`);
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await connection.end();
    }
}

run();
