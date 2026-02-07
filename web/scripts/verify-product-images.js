
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../web/.env') });

async function verify() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    try {
        // Get some Baseus products
        const [products] = await connection.execute(
            `SELECT id, name FROM products WHERE name LIKE 'Baseus%' LIMIT 5`
        );

        console.log(`Found ${products.length} Baseus products.`);

        if (products.length > 0) {
            const ids = products.map(p => p.id);
            console.log(`IDs: ${ids.join(', ')}`);

            // Check images for these products
            const [images] = await connection.execute(
                `SELECT * FROM product_images WHERE product_id IN (${ids.join(',')})`
            );

            console.log(`Found ${images.length} images for these products.`);
            images.forEach(img => {
                console.log(`ID: ${img.product_id} URL: ${img.image_url}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

verify();
