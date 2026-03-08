import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const JSON_PATH = 'C:\\Users\\ADMIN\\OneDrive\\Documents\\PERSONAL\\DEVELOPMENTS\\LKM\\JSON IMPORT\\16 pro max.json';
const PARENT_CATEGORY = 'iPhone Accessories';
const CHILD_CATEGORY = 'iPhone 16 Pro Max';
const STOCK_QUANTITY = 10;
const DEFAULT_PRICE = 35.00; // Used when "Login required"

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .slice(0, 150); // Prevent Data too long error
}

/**
 * Maps the product title to a single specific tag.
 */
function getSingleTagFromTitle(title) {
    const t = title.toLowerCase();

    if (t.includes('case') || t.includes('cover') || t.includes('diary')) return 'phone case';
    if (t.includes('glass') || t.includes('protector')) return 'screen protector';
    if (t.includes('adapter')) return 'power adapter';
    if (t.includes('cable')) return 'cable';
    if (t.includes('battery')) return 'battery';
    if (t.includes('ring')) return 'magnetic ring';

    return 'accessory';
}

async function downloadImage(url, filename) {
    if (!url || url.includes('ajax-load.gif')) return null;

    const uploadDir = path.join(__dirname, '../public/uploads/products');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);

    // Check if image already exists to save time/bandwidth
    if (fs.existsSync(filePath)) {
        return `/uploads/products/${filename}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        console.log(`Downloaded image: ${filename}`);
        return `/uploads/products/${filename}`;
    } catch (error) {
        console.error(`Error downloading image ${url}: ${error.message}`);
        return null;
    }
}

async function run() {
    console.log(`Starting ${CHILD_CATEGORY} accessories import from 16 pro max.json...`);

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });

    try {
        // 1. Ensure Categories exist
        const parentSlug = slugify(PARENT_CATEGORY);
        const childSlug = slugify(CHILD_CATEGORY);

        // Parent
        const [existingParents] = await connection.execute('SELECT id FROM categories WHERE slug = ?', [parentSlug]);
        let parentId;
        if (existingParents.length > 0) {
            parentId = existingParents[0].id;
        } else {
            const [result] = await connection.execute(
                'INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)',
                [PARENT_CATEGORY, parentSlug, true]
            );
            parentId = result.insertId;
            console.log(`Created parent category: ${PARENT_CATEGORY}`);
        }

        // Child
        const [existingChildren] = await connection.execute('SELECT id FROM categories WHERE slug = ? AND parent_id = ?', [childSlug, parentId]);
        let categoryId;
        if (existingChildren.length > 0) {
            categoryId = existingChildren[0].id;
        } else {
            const [result] = await connection.execute(
                'INSERT INTO categories (name, slug, parent_id, is_active) VALUES (?, ?, ?, ?)',
                [CHILD_CATEGORY, childSlug, parentId, true]
            );
            categoryId = result.insertId;
            console.log(`Created child category: ${CHILD_CATEGORY}`);
        }

        // 2. Load JSON
        if (!fs.existsSync(JSON_PATH)) {
            console.error(`JSON file not found at: ${JSON_PATH}`);
            return;
        }

        const rawData = fs.readFileSync(JSON_PATH, 'utf8');
        const products = JSON.parse(rawData);
        console.log(`Processing ${products.length} products...`);

        let count = 0;
        let skipCount = 0;
        for (const item of products) {
            count++;
            let title = item.title;
            if (title.length > 250) title = title.substring(0, 250);
            const slug = slugify(title);
            let sku = item.sku ? item.sku.toString().substring(0, 90) : null;
            const description = item.description ? item.description.replace(/\n/g, '<br>') : title;
            const tag = getSingleTagFromTitle(title);

            // Handle Price logic
            let baseVal = DEFAULT_PRICE;
            if (item.price && !item.price.includes('Login required')) {
                const parsed = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(parsed)) baseVal = parsed;
            }

            const price = Math.max(0, baseVal - 10);
            const comparePrice = baseVal;

            // Check if product already exists BY TITLE in this specific category
            const [existing] = await connection.execute('SELECT id FROM products WHERE name = ? AND category_id = ?', [title, categoryId]);
            let productId;
            let uniqueSlug = slug;

            if (existing.length > 0) {
                console.log(`Skipping duplicate product in category: ${title}`);
                skipCount++;
                continue;
            } else {
                // Generate globally unique slug
                let slugSuffix = 1;
                while (true) {
                    const [slugCheck] = await connection.execute('SELECT id FROM products WHERE slug = ?', [uniqueSlug]);
                    if (slugCheck.length === 0) break;
                    uniqueSlug = `${slug}-${slugSuffix}`;
                    slugSuffix++;
                }

                // Generate globally unique SKU
                let uniqueSku = sku;
                if (uniqueSku) {
                    let skuSuffix = 1;
                    while (true) {
                        const [skuCheck] = await connection.execute('SELECT id FROM products WHERE sku = ?', [uniqueSku]);
                        if (skuCheck.length === 0) break;
                        uniqueSku = `${sku}-${skuSuffix}`;
                        skuSuffix++;
                    }
                }

                const [result] = await connection.execute(
                    `INSERT INTO products 
                    (name, slug, sku, description, price, compare_price, category_id, stock, tags, is_active) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [title, uniqueSlug, uniqueSku, description, price, comparePrice, categoryId, STOCK_QUANTITY, tag, true]
                );
                productId = result.insertId;
                console.log(`Added new product [${count}/${products.length}]: ${title}`);

                // Add tag globally if not exists
                const [tagExists] = await connection.execute('SELECT id FROM global_tags WHERE name = ?', [tag]);
                if (tagExists.length === 0) {
                    await connection.execute('INSERT INTO global_tags (name) VALUES (?)', [tag]);
                }
            }

            // 4. Handle Images
            const imagesToDownload = [];
            if (item.main_image) imagesToDownload.push({ url: item.main_image, primary: true });

            if (item.gallery_images && Array.isArray(item.gallery_images)) {
                item.gallery_images.forEach(url => {
                    if (url !== item.main_image) {
                        imagesToDownload.push({ url, primary: false });
                    }
                });
            }

            // Clear existing images for this product if re-importing
            await connection.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);

            let sortOrder = 0;
            for (const imgData of imagesToDownload) {
                const ext = path.extname(new URL(imgData.url).pathname) || '.jpg';
                const filename = `${uniqueSlug}-${sortOrder}${ext}`; // Use uniqueSlug for image name
                const localPath = await downloadImage(imgData.url, filename);

                if (localPath) {
                    await connection.execute(
                        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                        [productId, localPath, imgData.primary, sortOrder]
                    );
                    sortOrder++;
                }
            }
        }

        console.log(`\nImport completed! Added: ${count - skipCount}, Skipped: ${skipCount}`);
    } catch (error) {
        console.error('Database error:', error.message || error);
    } finally {
        await connection.end();
    }
}

run();
