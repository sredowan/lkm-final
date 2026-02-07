import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const CATEGORY_NAME = 'Audio';
const JSON_FILE_PATH = path.join(__dirname, '../../JSON IMPORT/audio.json');
const STOCK_QUANTITY = 10;
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

async function downloadImage(url, filename) {
    if (!url || url.includes('ajax-load.gif')) return null;

    const uploadDir = path.join(__dirname, '../public/uploads/products');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);

    // Check if file already exists to avoid redownloading
    if (fs.existsSync(filePath)) {
        console.log(`Image already exists: ${filename}`);
        return `/uploads/products/${filename}`;
    }

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(filePath, () => { }); // Delete the file async
                console.error(`Failed to download image ${url}: Status Code ${response.statusCode}`);
                resolve(null);
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close(() => {
                    console.log(`Downloaded image: ${filename}`);
                    resolve(`/uploads/products/${filename}`);
                });
            });

            file.on('error', (err) => {
                fs.unlink(filePath, () => { }); // Delete the file async
                console.error(`Error writing file ${filename}: ${err.message}`);
                resolve(null);
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { }); // Delete the file async
            console.error(`Error downloading image ${url}: ${err.message}`);
            resolve(null);
        });
    });
}

async function run() {
    console.log(`Starting ${CATEGORY_NAME} products import...`);

    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error(`JSON file not found at: ${JSON_FILE_PATH}`);
        process.exit(1);
    }

    const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const products = JSON.parse(jsonContent);

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
            const productName = item["Product Name"];
            const productUrl = item["Product URL"];
            const productDescription = item["Description"];
            const retailPriceStr = item["Retail Price (AUD)"];
            const mainImageUrl = item["Product Image"];
            const otherImages = item["Other Images"] || [];

            if (!productName) {
                console.log('Skipping item with no name');
                continue;
            }

            const slug = slugify(productName);
            const retailPrice = parseFloat(retailPriceStr.replace(/[^0-9.]/g, '')); // Remove currency symbols

            if (isNaN(retailPrice)) {
                console.log(`Skipping ${productName} due to invalid price: ${retailPriceStr}`);
                continue;
            }

            const price = Math.max(0, retailPrice - PRICE_REDUCTION);
            const comparePrice = retailPrice;

            // Format Description
            let formattedDescription = productDescription;
            if (formattedDescription) {
                // 1. Replace **Header** with <h3>Header</h3>
                formattedDescription = formattedDescription.replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>');

                const lines = formattedDescription.split('\n');
                let htmlLines = [];
                let inList = false;

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].trim();
                    if (!line) continue;

                    if (line.startsWith('-')) {
                        if (!inList) {
                            htmlLines.push('<ul>');
                            inList = true;
                        }
                        htmlLines.push(`<li>${line.substring(1).trim()}</li>`);
                    } else if (line.startsWith('Package Included:') || line.startsWith('Features:')) {
                        if (inList) {
                            htmlLines.push('</ul>');
                            inList = false;
                        }
                        htmlLines.push(`<h3>${line}</h3>`);
                    } else if (line.includes(':') && !line.startsWith('http') && line.length < 100) {
                        if (inList) {
                            htmlLines.push('</ul>');
                            inList = false;
                        }
                        const parts = line.split(':');
                        if (parts.length > 1) {
                            htmlLines.push(`<p><strong>${parts[0].trim()}:</strong> ${parts.slice(1).join(':').trim()}</p>`);
                        } else {
                            htmlLines.push(`<p>${line}</p>`);
                        }
                    } else {
                        if (inList) {
                            htmlLines.push('</ul>');
                            inList = false;
                        }
                        htmlLines.push(`<p>${line}</p>`);
                    }
                }
                if (inList) {
                    htmlLines.push('</ul>');
                }

                formattedDescription = htmlLines.join('');
            }

            const [existing] = await connection.execute(
                'SELECT id FROM products WHERE slug = ?',
                [slug]
            );

            let productId;
            if (existing.length > 0) {
                productId = existing[0].id;

                await connection.execute(
                    'UPDATE products SET stock = ?, price = ?, compare_price = ?, description = ? WHERE id = ?',
                    [STOCK_QUANTITY, price, comparePrice, formattedDescription, productId]
                );

                console.log(`UPDATED: ${productName} (ID: ${productId}) - Stock/Price/Desc updated.`);
            } else {
                const [result] = await connection.execute(
                    `INSERT INTO products 
                    (name, slug, description, price, compare_price, stock, category_id, is_active, meta_title, meta_description) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [productName, slug, formattedDescription, price, comparePrice, STOCK_QUANTITY, categoryId, true, productName, productDescription?.substring(0, 160)]
                );
                productId = result.insertId;
                console.log(`ADDED: ${productName} (ID: ${productId}, Price: ${price}, Compare: ${comparePrice})`);
                importedCount++;
            }

            // 3. Handle images
            // Main Image
            if (mainImageUrl) {
                const imageFilename = `${slug}-main.jpg`;
                const localImagePath = await downloadImage(mainImageUrl, imageFilename);

                if (localImagePath) {
                    // Check if image already linked to product
                    const [existingImages] = await connection.execute(
                        'SELECT id FROM product_images WHERE product_id = ? AND image_url = ?',
                        [productId, localImagePath]
                    );

                    if (existingImages.length === 0) {
                        await connection.execute(
                            'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                            [productId, localImagePath, true]
                        );
                        console.log(`   Main Image added: ${localImagePath}`);
                    }
                }
            }

            // Other Images
            if (otherImages && otherImages.length > 0) {
                let imgCount = 1;
                for (const imgUrl of otherImages) {
                    const imageFilename = `${slug}-${imgCount}.jpg`;
                    const localImagePath = await downloadImage(imgUrl, imageFilename);

                    if (localImagePath) {
                        const [existingImages] = await connection.execute(
                            'SELECT id FROM product_images WHERE product_id = ? AND image_url = ?',
                            [productId, localImagePath]
                        );

                        if (existingImages.length === 0) {
                            await connection.execute(
                                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
                                [productId, localImagePath, false]
                            );
                            console.log(`   Additional Image added: ${localImagePath} `);
                        }
                    }
                    imgCount++;
                }
            }

        }

        console.log(`Import completed successfully!`);
        console.log(`Summary: ${importedCount} added.`);
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await connection.end();
    }
}

run();
