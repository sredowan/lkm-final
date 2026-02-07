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
    {
        name: 'Baseus Enjoyment Pro Car Charger C + Retractable iP Cable 55W',
        originalPrice: 49.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/p/1/p10243400113-00.jpg',
        description: 'Enjoyment Pro Car Charger with retractable cable, 55W fast charging.'
    },
    {
        name: 'Baseus S-09 Pro Series Car FM Transmitter',
        originalPrice: 39.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/s/0/s09_pro_1.jpg',
        description: 'S-09 Pro Series Car FM Transmitter for wireless audio and charging.'
    },
    {
        name: 'Baseus GoTrip DP1 Car Charger C+C 30W',
        originalPrice: 24.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/b/a/baseus-gotrip-dp1-car-charger-c-c-30w-cosmic-black.jpg',
        description: 'GoTrip DP1 dual C-port car charger, 30W output.'
    },
    {
        name: 'Baseus Particular Digital Display QC + PPS Dual Quick Car Charger 65W',
        originalPrice: 49.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/c/ccjx-0g.jpg',
        description: 'High power 65W dual car charger with digital display.'
    },
    {
        name: 'Baseus Magic Series PPS Digital Display Dual Quick Car Charger 45W',
        originalPrice: 39.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/c/ccml-01.jpg',
        description: 'Magic Series 45W car charger with PPS and digital display.'
    },
    {
        name: 'Baseus Golden Contactor Max Dual Fast Charger U+C 60W',
        originalPrice: 34.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/c/ccjd-0g_2.jpg',
        description: 'Golden Contactor Max 60W fast charger with U+C ports.'
    },
    {
        name: 'Baseus Golden Contactor Pro Triple Fast Charger U+C+C 65W',
        originalPrice: 44.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/g/cgjp010013.jpg',
        description: 'Golden Contactor Pro 65W triple port fast charger.'
    },
    {
        name: 'Baseus Grain Pro Car Charger (Dual USB 4.8A)',
        originalPrice: 24.99,
        imageUrl: 'https://www.crazyparts.com.au/media/catalog/product/cache/1/small_image/360x360/9df78eab33525d08d6e5fb8d27136e95/c/c/ccall-mlp01.jpg',
        description: 'Compact Grain Pro car charger with dual USB 4.8A output.'
    }
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
        return `/uploads/products/${filename}`;
    } catch (error) {
        console.error(`Error downloading image ${url}:`, error.message);
        return null;
    }
}

async function run() {
    console.log('Starting car accessories import...');

    console.log(`Connecting to database: ${process.env.DATABASE_NAME} on ${process.env.DATABASE_HOST}`);
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

        // 2. Process products
        for (const item of products) {
            const slug = slugify(item.name);
            const price = Math.max(0, item.originalPrice - PRICE_REDUCTION);
            const comparePrice = item.originalPrice;

            console.log(`Processing product: ${item.name}`);

            const [existing] = await connection.execute(
                'SELECT id FROM products WHERE slug = ?',
                [slug]
            );

            let productId;
            if (existing.length > 0) {
                productId = existing[0].id;
                console.log(`Product already exists: ${item.name} (ID: ${productId})`);
            } else {
                const [result] = await connection.execute(
                    `INSERT INTO products 
                    (name, slug, description, price, compare_price, stock, category_id, is_active) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [item.name, slug, item.description, price, comparePrice, STOCK_QUANTITY, categoryId, true]
                );
                productId = result.insertId;
                console.log(`Added product: ${item.name} (ID: ${productId})`);
            }

            // 3. Check if image already exists in DB
            const [existingImg] = await connection.execute(
                'SELECT id FROM product_images WHERE product_id = ?',
                [productId]
            );

            if (existingImg.length === 0) {
                // 4. Download and add image
                const imageFilename = `${slug}.jpg`;
                console.log(`Downloading image for ${item.name} from ${item.imageUrl}...`);
                const localImagePath = await downloadImage(item.imageUrl, imageFilename);

                if (localImagePath) {
                    console.log(`Saving image record to DB for product ID ${productId}: ${localImagePath}`);
                    const [imgResult] = await connection.execute(
                        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                        [productId, localImagePath, true]
                    );
                    console.log(`Image record saved. Result:`, imgResult);
                } else {
                    console.warn(`No local image path returned for ${item.name}`);
                }
            } else {
                console.log(`Image already exists for ${item.name}, skipping download.`);
            }
        }

        console.log('Import completed successfully!');
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await connection.end();
    }
}

run();
