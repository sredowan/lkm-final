import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Test start');
console.log('DB Host:', process.env.DATABASE_HOST);

async function test() {
    try {
        console.log('Attempting DB connection...');
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        });
        console.log('DB Connection SUCCESS');
        await connection.end();

        console.log('Attempting Fetch...');
        const res = await fetch('https://example.com');
        console.log('Fetch SUCCESS, status:', res.status);
    } catch (err) {
        console.error('Test FAILED:', err);
    }
}

test();
