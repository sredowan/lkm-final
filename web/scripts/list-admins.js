const mysql = require('mysql2/promise');
require('dotenv').config();

async function listAdmins() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king',
    });

    try {
        const [rows] = await connection.execute('SELECT id, name, email, role FROM admins');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error fetching admins:', error);
    } finally {
        await connection.end();
    }
}

listAdmins();
