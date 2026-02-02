import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function listBrands() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king',
    });

    try {
        const [rows] = await connection.execute('SELECT id, name, slug, logo FROM brands');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error fetching brands:', error);
    } finally {
        await connection.end();
    }
}

listBrands();
