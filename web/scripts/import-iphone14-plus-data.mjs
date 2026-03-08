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

const JSON_FILE_PATH = 'C:/Users/ADMIN/Downloads/scraped_data_88824573-f0e1-495e-bac1-28a9b1993b63.json';
const PARENT_CATEGORY_NAME = 'iPhone Accessories';
const SUB_CATEGORY_NAME = 'iPhone 14 Plus';

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

/**
 * Extract a single tag from the title
 */
function extractTag(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('case') || lowerTitle.includes('cover')) return 'phone case';
    if (lowerTitle.includes('screen') || lowerTitle.includes('protector') || lowerTitle.includes('glass')) return 'screen protector';
    if (lowerTitle.includes('lens')) return 'lens protector';
    if (lowerTitle.includes('cable') || lowerTitle.includes('charger') || lowerTitle.includes('magsafe')) return 'charger';
    if (lowerTitle.includes('mount') || lowerTitle.includes('holder') || lowerTitle.includes('stand')) return 'mount';
    return 'accessory';
}

function generateMetaDescription(title, descriptionStr) {
    // Basic SEO friendly description using the title
    if (title) {
        return `Buy ${title}. High-quality accessory for iPhone 14 Plus. Correct format and premium quality.`;
    }
    return 'High-quality accessory for iPhone 14 Plus.';
}

async function importProducts() {
    console.log(`Starting import for ${SUB_CATEGORY_NAME}...`);

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
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king'
    });

    try {
        // 1. Get or Create Parent Category
        let parentCategoryId;
        const [parentCategories] = await connection.execute('SELECT id FROM categories WHERE name = ?', [PARENT_CATEGORY_NAME]);

        if (parentCategories.length > 0) {
            parentCategoryId = parentCategories[0].id;
            console.log(`Parent category '${PARENT_CATEGORY_NAME}' exists (ID: ${parentCategoryId}).`);
        } else {
            const slug = PARENT_CATEGORY_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const [result] = await connection.execute(
                'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
                [PARENT_CATEGORY_NAME, slug, PARENT_CATEGORY_NAME]
            );
            parentCategoryId = result.insertId;
            console.log(`Created parent category '${PARENT_CATEGORY_NAME}' (ID: ${parentCategoryId}).`);
        }

        // 2. Get or Create Sub Category
        let subCategoryId;
        const [subCategories] = await connection.execute('SELECT id FROM categories WHERE name = ? AND parent_id = ?', [SUB_CATEGORY_NAME, parentCategoryId]);

        if (subCategories.length > 0) {
            subCategoryId = subCategories[0].id;
            console.log(`Sub category '${SUB_CATEGORY_NAME}' exists (ID: ${subCategoryId}).`);
        } else {
            const slug = SUB_CATEGORY_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const [result] = await connection.execute(
                'INSERT INTO categories (name, slug, description, parent_id) VALUES (?, ?, ?, ?)',
                [SUB_CATEGORY_NAME, slug, SUB_CATEGORY_NAME, parentCategoryId]
            );
            subCategoryId = result.insertId;
            console.log(`Created sub category '${SUB_CATEGORY_NAME}' (ID: ${subCategoryId}).`);
        }

        // 3. Process Products
        let count = 0;
        for (const item of products) {
            const name = item['title'];
            if (!name) continue;

            // Extract Price
            let priceRaw = 0;
            if (item['price']) {
                priceRaw = parseFloat(item['price'].replace(/[^0-9.]/g, ''));
            }

            const comparePrice = isNaN(priceRaw) ? 0 : priceRaw;
            let price = isNaN(priceRaw) ? 0 : priceRaw;

            // Logic: if product price is less than or equal to 15 do not decrease the price keep as it is
            // Otherwise, json file price - $10
            if (price > 15) {
                price = price - 10;
            }

            // Format Description (keeping existing HTML structure if any, replacing newlines with <br>)
            let description = item['description'] || '';
            description = description.replace(/\n/g, '<br>');

            const tag = extractTag(name);

            // SEO Meta tags
            let metaTitle = name.substring(0, 255);
            let metaDescription = generateMetaDescription(name, item['description']);

            // Images
            const mainImageUrl = item['main_image'];
            let extraImages = Array.isArray(item['gallery_images']) ? item['gallery_images'] : [];

            // Filter duplicates and remove main image from extras
            extraImages = [...new Set(extraImages)].filter(u => u && u.startsWith('http') && u !== mainImageUrl);

            const stock = 10;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            try {
                // Check if product exists
                const [existing] = await connection.execute('SELECT id FROM products WHERE sku = ? OR name = ?', [item['sku'] || '', name]);
                let productId;

                if (existing.length > 0) {
                    productId = existing[0].id;
                    // Update
                    await connection.execute(`
                        UPDATE products 
                        SET price = ?, compare_price = ?, stock = ?, description = ?, category_id = ?, tags = ?, meta_title = ?, meta_description = ?
                        WHERE id = ?
                    `, [price, comparePrice, stock, description, subCategoryId, tag, metaTitle, metaDescription, productId]);
                    console.log(`Updated: ${name}`);
                } else {
                    // Insert
                    const [res] = await connection.execute(`
                        INSERT INTO products (name, slug, sku, description, price, compare_price, stock, category_id, tags, meta_title, meta_description, is_active, is_featured)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
                    `, [name, slug, item['sku'] || null, description, price, comparePrice, stock, subCategoryId, tag, metaTitle, metaDescription]);
                    productId = res.insertId;
                    console.log(`Inserted: ${name}`);
                }

                // Process Main Image
                if (mainImageUrl) {
                    let ext = '.jpg';
                    try { ext = path.extname(new URL(mainImageUrl).pathname) || '.jpg'; } catch (e) { }
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
                    let ext = '.jpg';
                    try { ext = path.extname(new URL(url).pathname) || '.jpg'; } catch (e) { }

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
        console.error('Database Operation failed:', error);
    } finally {
        await connection.end();
    }
}

importProducts();
