import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const JSON_PATH = path.join(__dirname, '../../JSON IMPORT/extracted_products(6).json');
const CATEGORY_NAME = 'Wall Chargers';
const STOCK_QUANTITY = 10;
const PRICE_REDUCTION = 10;

function cleanDescription(html) {
    if (!html) return '';
    let description = html;

    // Remove scripts and styles
    description = description.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    description = description.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");
    // Remove CDATA
    description = description.replace(/\/\/<!\[CDATA\[[\s\S]*?\/\/\]\]>/gim, "");
    // Remove specific garbage text
    description = description.replace(/To get better price,Learn more about[\s\S]*?VIP/gim, "");
    description = description.replace(/Availability:\s*In stock/gim, "");
    description = description.replace(/Register Business Partner account for better prices/gim, "");
    description = description.replace(/Add to Cart/gim, "");
    description = description.replace(/Having problem add to cart\?/gim, "");

    // Collapse whitespace
    description = description.replace(/\n\s*\n/g, "\n");
    return description.trim();
}

function getHighResImageUrl(url) {
    if (!url) return null;
    // Replace /thumbnail/100x100/ or /small_image/360x360/ with /image/
    // Example: https://.../cache/1/thumbnail/100x100/hash/... -> https://.../cache/1/image/hash/...
    return url.replace(/\/cache\/1\/(?:thumbnail|small_image)\/[\dx]+\//, '/cache/1/image/');
}

function detectBrand(title, explicitBrand) {
    if (explicitBrand && explicitBrand.trim() !== '') return explicitBrand.trim();

    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('apple')) return 'Apple';
    if (lowerTitle.includes('anker')) return 'Anker';
    if (lowerTitle.includes('ugreen')) return 'UGREEN';
    if (lowerTitle.includes('iquick')) return 'iQuick';
    if (lowerTitle.includes('samsung')) return 'Samsung';
    if (lowerTitle.includes('baseus')) return 'Baseus';
    if (lowerTitle.includes('transformers')) return 'Transformers';

    return 'Generic';
}

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
    if (!url) return null;

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
        console.log(`   Detailed Download: ${url} -> ${filename}`);
        return `/uploads/products/${filename}`;
    } catch (error) {
        console.error(`   Error downloading image ${url}:`, error.message);
        return null;
    }
}

async function run() {
    console.log('Starting Wall Chargers import...');

    if (!fs.existsSync(JSON_PATH)) {
        console.error(`JSON file not found at: ${JSON_PATH}`);
        process.exit(1);
    }

    let rawData = fs.readFileSync(JSON_PATH, 'utf-8').trim();

    // Fix potentially malformed/truncated JSON
    if (rawData.endsWith(',')) {
        rawData = rawData.slice(0, -1);
    }
    if (!rawData.endsWith(']')) {
        rawData += ']';
    }

    let products;
    try {
        products = JSON.parse(rawData);
    } catch (e) {
        console.error("Failed to parse JSON:", e.message);
        console.error("Tail of data:", rawData.slice(-100));
        process.exit(1);
    }

    console.log(`Loaded ${products.length} products from JSON.`);

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
            const name = item.title;
            const slug = slugify(name);
            const price = Math.max(0, parseFloat(item.price) - PRICE_REDUCTION);
            const comparePrice = parseFloat(item.price);

            // Generate SKU if not present in item (JSON doesn't seem to have SKU, using random)
            const sku = `WC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const brand = detectBrand(name, item.brand);
            const description = cleanDescription(item.description);

            // Check existence
            const [existing] = await connection.execute(
                'SELECT id FROM products WHERE slug = ?',
                [slug]
            );

            let productId;
            if (existing.length > 0) {
                productId = existing[0].id;
                console.log(`SKIPPING: Product already exists: ${name}`);
                skippedCount++;
            } else {
                const [result] = await connection.execute(
                    `INSERT INTO products 
                    (name, slug, sku, description, price, compare_price, stock, category_id, brand, is_active) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [name, slug, sku, description, price, comparePrice, STOCK_QUANTITY, categoryId, brand, true]
                );
                productId = result.insertId;
                console.log(`ADDED: ${name} (ID: ${productId}, Price: ${price}, Brand: ${brand})`);
                importedCount++;

                // 3. Handle image
                // Transform URL for better quality
                const highResUrl = getHighResImageUrl(item.imageUrl);
                if (highResUrl) {
                    const imageFilename = `${slug}.jpg`;
                    const localImagePath = await downloadImage(highResUrl, imageFilename);

                    if (localImagePath) {
                        await connection.execute(
                            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                            [productId, localImagePath, true]
                        );
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
