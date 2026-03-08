import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lkm'
    });

    try {
        const [categoryRows] = await connection.execute('SELECT id FROM categories WHERE name = "iPhone 16E"');
        const categoryId = categoryRows[0].id;
        const [products] = await connection.execute('SELECT name, price, compare_price FROM products WHERE category_id = ?', [categoryId]);

        console.log(`Verifying ${products.length} products...`);
        let passCount = 0;
        let failCount = 0;

        products.forEach(p => {
            const comp = parseFloat(p.compare_price);
            const actual = parseFloat(p.price);
            const expected = comp <= 15 ? comp : comp - 10;
            if (Math.abs(actual - expected) < 0.01) {
                passCount++;
            } else {
                failCount++;
                console.log(`[FAIL] ${p.name}: Comp=${comp}, Actual=${actual}, Expected=${expected}`);
            }
        });

        console.log(`Summary: ${passCount} Passed, ${failCount} Failed.`);

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await connection.end();
    }
}
verify();
