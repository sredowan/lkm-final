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

const JSON_FILE_PATH = path.join(__dirname, '../../JSON IMPORT/Thunderbit_4508f6_20260216_145236_images_fixed.json');
const CATEGORY_NAME = 'Car Accessories';
const CATEGORY_SLUG = 'car-accessories';

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
    let sections = [];

    // Main Description
    if (item['description']) {
        sections.push(item['description']);
    }

    // Features
    if (item['Features']) {
        sections.push(`<h3>Features</h3><ul>${item['Features'].split('\n').map(f => `<li>${f}</li>`).join('')}</ul>`);
    }

    // Package Included
    if (item['Package Included']) {
        sections.push(`<h3>Package Included</h3><p>${item['Package Included']}</p>`);
    }

    // Warranty
    if (item['Warranty']) {
        sections.push(`<h3>Warranty</h3><p>${item['Warranty']}</p>`);
    }

    return sections.join('<br>');
}

function safeParseJSON(jsonString) {
    if (!jsonString) return [];
    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

async function importProducts() {
    console.log(`Starting ${CATEGORY_NAME} import...`);

    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error(`File not found: ${JSON_FILE_PATH}`);
        return;
    }

    const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const products = JSON.parse(fileContent);

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
        for (const item of products) {
            const name = item['Product Name'];
            if (!name) continue;

            const priceRaw = parseFloat(item['Retail Price (AUD)']);
            const price = isNaN(priceRaw) ? 0 : Math.max(0, priceRaw - 10);
            const comparePrice = isNaN(priceRaw) ? 0 : priceRaw;
            const description = formatDescription(item);
            const brand = item['Brand'] || 'Generic';

            // Main image
            const mainImageUrl = item['Product Image'];

            // Extra images
            let extraImages = [];

            // From "Product Images" (comma separated)
            if (item['Product Images']) {
                extraImages = [...extraImages, ...item['Product Images'].split(',').map(u => u.trim())];
            }

            // From "Other image" (JSON string)
            const otherImages = safeParseJSON(item['Other image']);
            extraImages = [...extraImages, ...otherImages];

            // Filter duplicates and remove main image from extras
            extraImages = [...new Set(extraImages)].filter(u => u && u.startsWith('http') && u !== mainImageUrl);

            const stock = 10;

            // Generate slug
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            try {
                // Check if product exists
                const [existing] = await connection.execute('SELECT id FROM products WHERE name = ?', [name]);
                let productId;

                if (existing.length > 0) {
                    productId = existing[0].id;
                    // Update
                    await connection.execute(`
                        UPDATE products 
                        SET price = ?, compare_price = ?, stock = ?, description = ?, category_id = ?, brand = ?
                        WHERE id = ?
                    `, [price, comparePrice, stock, description, categoryId, brand, productId]);
                    console.log(`Updated: ${name}`);
                } else {
                    // Insert
                    const [res] = await connection.execute(`
                        INSERT INTO products (name, slug, description, price, compare_price, stock, category_id, brand, is_active, is_featured)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
                    `, [name, slug, description, price, comparePrice, stock, categoryId, brand]);
                    productId = res.insertId;
                    console.log(`Inserted: ${name}`);
                }

                // Process Main Image
                if (mainImageUrl) {
                    const ext = path.extname(mainImageUrl) || '.jpg';
                    const filename = `${slug}-main${ext}`;
                    const localPath = await downloadImage(mainImageUrl, filename);

                    if (localPath) {
                        const [imgCheck] = await connection.execute(
                            'SELECT id FROM product_images WHERE product_id = ? AND image_url = ?',
                            [productId, localPath]
                        );
                        if (imgCheck.length === 0) {
                            await connection.execute(
                                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                                [productId, localPath, 1]
                            );
                            console.log(`  > Main image linked: ${filename}`);
                        }
                    }
                }

                // Process Extra Images
                for (let i = 0; i < extraImages.length; i++) {
                    const url = extraImages[i];
                    const ext = path.extname(url) || '.jpg';
                    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
                    const filename = `${slug}-extra-${hash}${ext}`;

                    const localPath = await downloadImage(url, filename);
                    if (localPath) {
                        const [imgCheck] = await connection.execute(
                            'SELECT id FROM product_images WHERE product_id = ? AND image_url = ?',
                            [productId, localPath]
                        );
                        if (imgCheck.length === 0) {
                            await connection.execute(
                                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                                [productId, localPath, 0]
                            );
                            console.log(`  > Extra image linked: ${filename}`);
                        }
                    }
                }

                count++;
            } catch (err) {
                console.error(`Error processing ${name}:`, err.message);
            }
        }

        console.log(`Import finished. Processed ${count} products.`);

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await connection.end();
    }
}

importProducts();
