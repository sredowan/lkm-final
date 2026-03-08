import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const JSON_PATH = 'C:\\Users\\ADMIN\\Downloads\\scraped_data_db6aa531-079d-4ea5-aabf-c216c86de08a.json';
const DEFAULT_PRICE = 35.00;

async function run() {
    console.log(`Starting price update from scraped_data_db6aa531-079d-4ea5-aabf-c216c86de08a.json (iPhone 17 Air)...`);

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });

    try {
        if (!fs.existsSync(JSON_PATH)) {
            console.error(`JSON file not found at: ${JSON_PATH}`);
            return;
        }

        const rawData = fs.readFileSync(JSON_PATH, 'utf8');
        const products = JSON.parse(rawData);
        console.log(`Processing ${products.length} products to check for price updates...`);

        let updateCount = 0;
        let notFoundCount = 0;

        for (const item of products) {
            let title = item.title;
            if (title.length > 250) title = title.substring(0, 250);

            // Fetch current product from DB
            const [existing] = await connection.execute('SELECT id, price, compare_price FROM products WHERE name = ?', [title]);

            if (existing.length === 0) {
                // Product not in DB, skip
                notFoundCount++;
                continue;
            }

            const productId = existing[0].id;

            // Calculate new prices
            let baseVal = DEFAULT_PRICE;
            if (item.price && !item.price.includes('Login required')) {
                const parsed = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(parsed)) baseVal = parsed;
            }

            const newPrice = Math.max(0, baseVal - 10);
            const newComparePrice = baseVal;

            // Only update if one of the prices is different
            if (Number(existing[0].price) !== newPrice || Number(existing[0].compare_price) !== newComparePrice) {
                await connection.execute(
                    'UPDATE products SET price = ?, compare_price = ? WHERE id = ?',
                    [newPrice, newComparePrice, productId]
                );
                updateCount++;
                console.log(`Updated [${productId}] ${title.substring(0, 30)}... Price: ${existing[0].price} -> ${newPrice}, Compare: ${existing[0].compare_price} -> ${newComparePrice}`);
            }
        }

        console.log(`\nPrice Update Completed!`);
        console.log(`Total Products in JSON: ${products.length}`);
        console.log(`Successfully Updated: ${updateCount}`);
        console.log(`Not Found / Skipped: ${notFoundCount}`);

    } catch (error) {
        console.error('Database error:', error.message || error);
    } finally {
        await connection.end();
    }
}

run();
