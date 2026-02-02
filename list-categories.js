const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'web/.env' });

async function listCategories() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });

    try {
        const [rows] = await connection.execute('SELECT * FROM categories');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error listing categories:', error);
    } finally {
        await connection.end();
    }
}

listCategories();
