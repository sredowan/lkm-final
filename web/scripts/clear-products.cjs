const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'web/.env' });

async function clearProducts() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });

    console.log('Connected to database. Clearing all products...');

    try {
        // Disable foreign key checks to allow clearing tables with circular references if any
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Clearing order_refunds...');
        await connection.execute('DELETE FROM order_refunds');

        console.log('Clearing order_items...');
        await connection.execute('DELETE FROM order_items');

        console.log('Clearing orders...');
        await connection.execute('DELETE FROM orders');

        console.log('Clearing product images...');
        await connection.execute('DELETE FROM product_images');

        console.log('Clearing product variants...');
        await connection.execute('DELETE FROM product_variants');

        console.log('Clearing product specs...');
        await connection.execute('DELETE FROM product_specs');

        console.log('Clearing products...');
        await connection.execute('DELETE FROM products');

        // Optional: clear categories if you want a truly fresh start
        // console.log('Clearing categories...');
        // await connection.execute('DELETE FROM categories');

        // Re-enable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Successfully cleared all products, images, variants, and orders.');
    } catch (error) {
        console.error('Error clearing data:', error);
        // Ensure FK checks are re-enabled even on error
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
        await connection.end();
    }
}

clearProducts();
