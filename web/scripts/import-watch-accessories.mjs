import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const JSON_FILE_PATH = path.join(__dirname, '../../JSON IMPORT/watch.json');
const CATEGORY_NAME = 'Watch Accessories';
const CATEGORY_SLUG = 'watch-accessories';

// Helper: Download Image
async function downloadImage(url, filename) {
    if (!url || url.includes('ajax-load.gif')) return null;

    const uploadDir = path.join(__dirname, '../public/uploads/products');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    const relativePath = `/uploads/products/${filename}`;

    // If file exists, skip download
    if (fs.existsSync(filePath)) {
        return relativePath;
    }

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(filePath, () => { }); // Delete failed file
                resolve(null); // Return null on failure but don't crash
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(relativePath));
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { });
            resolve(null);
        });
    });
}

// Helper: Format Description
function formatDescription(item) {
    if (item['description']) {
        return item['description'].replace(/\n/g, '<br>');
    }
    return '';
}

// Helper: Clean Price
function cleanPrice(priceDisplay) {
    if (!priceDisplay) return 0;
    const matches = priceDisplay.match(/\$(\d+(\.\d{1,2})?)/);
    if (matches && matches[1]) {
        return parseFloat(matches[1]);
    }
    return 0;
}

async function importProducts() {
    console.log(`Starting ${CATEGORY_NAME} import...`);

    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error(`File not found: ${JSON_FILE_PATH}`);
        return;
    }

    const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    let products = [];
    try {
        products = JSON.parse(fileContent);
    } catch (e) {
        console.error('JSON parse error:', e);
        return;
    }

    console.log(`Found ${products.length} products to process.`);

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        // 1. Get or Create Category
        let categoryId;
        const [categories] = await connection.execute('SELECT id FROM categories WHERE name = ?', [CATEGORY_NAME]);

        if (categories.length > 0) {
            categoryId = categories[0].id;
            console.log(`Category '${CATEGORY_NAME}' exists (ID: ${categoryId}).`);
        } else {
            const [result] = await connection.execute(
                'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
                [CATEGORY_NAME, CATEGORY_SLUG, CATEGORY_NAME]
            );
            categoryId = result.insertId;
            console.log(`Created category '${CATEGORY_NAME}' (ID: ${categoryId}).`);
        }

        // 2. Process Products
        let count = 0;
        let skipped = 0;

        for (const item of products) {
            const name = item['title'];
            if (!name) continue;

            // Check if product exists - SKIP if found
            const [existing] = await connection.execute('SELECT id FROM products WHERE name = ?', [name]);
            if (existing.length > 0) {
                console.log(`Skipped (Already exists): ${name}`);
                skipped++;
                continue;
            }

            console.log(`Processing: ${name}`);

            // Price Calculation
            const priceRaw = cleanPrice(item['price']);
            const price = priceRaw > 10 ? priceRaw - 10 : priceRaw;
            const comparePrice = priceRaw;

            const description = formatDescription(item);

            // Extract Brand
            let brand = 'Generic';
            // Specific check for "Brand:" starting with a line in description
            const brandMatch = item['description'] ? item['description'].match(/Brand:\s*([^\n]+)/i) : null;
            if (brandMatch && brandMatch[1]) {
                brand = brandMatch[1].trim();
            }

            const stock = 10;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            try {
                // Insert Product
                const [res] = await connection.execute(`
                    INSERT INTO products (name, slug, description, price, compare_price, stock, category_id, brand, is_active, is_featured)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
                `, [name, slug, description, price, comparePrice, stock, categoryId, brand]);

                const productId = res.insertId;

                // Main Image
                const mainImageUrl = item['main_image'];
                if (mainImageUrl) {
                    const ext = path.extname(mainImageUrl) || '.jpg';
                    const filename = `${slug}-main${ext}`;
                    const localPath = await downloadImage(mainImageUrl, filename);

                    if (localPath) {
                        await connection.execute(
                            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                            [productId, localPath, 1]
                        );
                    }
                }

                // Extra Images
                let extraImages = [];
                if (Array.isArray(item['other_images'])) {
                    extraImages = item['other_images'];
                }
                extraImages = [...new Set(extraImages)].filter(u => u && u.startsWith('http') && u !== mainImageUrl);

                for (const url of extraImages) {
                    const ext = path.extname(url) || '.jpg';
                    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
                    const filename = `${slug}-extra-${hash}${ext}`;

                    const localPath = await downloadImage(url, filename);
                    if (localPath) {
                        await connection.execute(
                            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                            [productId, localPath, 0]
                        );
                    }
                }

                count++;
            } catch (err) {
                console.error(`Error inserting ${name}:`, err.message);
            }
        }

        console.log(`Import finished.`);
        console.log(`Processed: ${count}`);
        console.log(`Skipped: ${skipped}`);

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await connection.end();
    }
}

importProducts();
