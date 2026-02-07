import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function searchAdapters() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        console.log('Searching for products with "adapter"...');

        const [products] = await connection.execute(`
            SELECT p.id, p.name, c.name as category_name, c.slug as category_slug 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.name LIKE '%adapter%' OR p.description LIKE '%adapter%'
        `);

        console.log(`Found ${products.length} products with "adapter" in name or description.`);

        // Group by category
        const counts = {};
        products.forEach(p => {
            const key = `${p.category_name} (${p.category_slug})`;
            counts[key] = (counts[key] || 0) + 1;
        });

        console.log('\n--- Breakdown by Category ---');
        console.log(JSON.stringify(counts, null, 2));

        // Check specific "Power Adapter" category ID
        const [cat] = await connection.execute('SELECT * FROM categories WHERE slug = "power-adapter"');
        if (cat.length > 0) {
            console.log(`Target Category: ${cat[0].name} (ID: ${cat[0].id}, Slug: ${cat[0].slug})`);
        }

    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        await connection.end();
    }
}

searchAdapters();
