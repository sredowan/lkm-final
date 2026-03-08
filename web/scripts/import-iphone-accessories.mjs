import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const JSON_PATH = 'c:\\Users\\ADMIN\\OneDrive\\Documents\\PERSONAL\\DEVELOPMENTS\\LKM\\JSON IMPORT\\17promax.json';
const PARENT_CATEGORY = 'iPhone Accessories';
const CHILD_CATEGORY = '17 Pro Max';
const STOCK_QUANTITY = 10;
const BASE_PRICE = 35.00;
const PRICE_REDUCTION = 10;

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

function getTagsFromTitle(title) {
    const tags = new Set();
    const t = title.toLowerCase();

    if (t.includes('case') || t.includes('cover') || t.includes('diary')) tags.add('phone case');
    if (t.includes('glass') || t.includes('protector')) tags.add('screen protector');
    if (t.includes('charging') || t.includes('charger') || t.includes('magsafe')) tags.add('charger');
    if (t.includes('adapter')) tags.add('power adapter');
    if (t.includes('cable')) tags.add('cable');
    if (t.includes('ring')) tags.add('magnetic ring');
    if (t.includes('hybrid')) tags.add('hybrid');
    if (t.includes('shockproof')) tags.add('shockproof');

    return Array.from(tags).join(', ');
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
        console.error(`Error downloading image ${url}: ${error.message}`);
        return null;
    }
}

async function run() {
    console.log('Starting iPhone 17 Pro Max accessories import...');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king'
    });

    try {
        // 1. Handle Categories
        const parentSlug = slugify(PARENT_CATEGORY);
        const childSlug = slugify(CHILD_CATEGORY);

        // Parent Category
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

        // Child Category
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
        const rawData = fs.readFileSync(JSON_PATH, 'utf8');
        const products = JSON.parse(rawData);
        console.log(`Found ${products.length} products in JSON.`);

        let importedCount = 0;
        let skippedCount = 0;

        for (const item of products) {
            const name = item.title;
            const slug = slugify(name);
            const sku = item.sku || null;
            const description = item.description ? item.description.replace(/\n/g, '<br>') : name;
            const tags = getTagsFromTitle(name);

            // Handle Price
            let jsonPrice = parseFloat(item.price);
            if (isNaN(jsonPrice)) {
                jsonPrice = BASE_PRICE;
            }
            const price = Math.max(0, jsonPrice - PRICE_REDUCTION);
            const comparePrice = jsonPrice;

            // Check if exists
            const [existing] = await connection.execute('SELECT id FROM products WHERE slug = ?', [slug]);
            if (existing.length > 0) {
                console.log(`Skipping existing product: ${name}`);
                skippedCount++;
                continue;
            }

            // Insert Product
            const [prodResult] = await connection.execute(
                `INSERT INTO products 
                (name, slug, sku, description, price, compare_price, category_id, stock, tags, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, slug, sku, description, price.toFixed(2), comparePrice.toFixed(2), categoryId, STOCK_QUANTITY, tags, true]
            );
            const productId = prodResult.insertId;
            importedCount++;
            console.log(`Added product [${importedCount}/${products.length}]: ${name}`);

            // 3. Handle Images
            // Main Image
            if (item.main_image) {
                const ext = path.extname(new URL(item.main_image).pathname) || '.jpg';
                const mainFilename = `${slug}-main${ext}`;
                const localPath = await downloadImage(item.main_image, mainFilename);
                if (localPath) {
                    await connection.execute(
                        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                        [productId, localPath, true, 0]
                    );
                }
            }

            // Gallery Images
            if (item.gallery_images && Array.isArray(item.gallery_images)) {
                let sortOrder = 1;
                for (const imgUrl of item.gallery_images) {
                    // Skip if it's the same as main image
                    if (imgUrl === item.main_image) continue;

                    const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
                    const galleryFilename = `${slug}-gallery-${sortOrder}${ext}`;
                    const localPath = await downloadImage(imgUrl, galleryFilename);
                    if (localPath) {
                        await connection.execute(
                            'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
                            [productId, localPath, false, sortOrder]
                        );
                        sortOrder++;
                    }
                }
            }
        }

        console.log(`\nImport Summary:`);
        console.log(`Total Products: ${products.length}`);
        console.log(`Imported: ${importedCount}`);
        console.log(`Skipped: ${skippedCount}`);

    } catch (error) {
        console.error('Import process failed:', error);
    } finally {
        await connection.end();
    }
}

run();
