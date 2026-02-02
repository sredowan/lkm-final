import 'dotenv/config';
import mysql from 'mysql2/promise';

async function createVariantsTable() {
    const conn = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    try {
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS product_variants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                color VARCHAR(50),
                storage VARCHAR(50),
                sku VARCHAR(100),
                price DECIMAL(10,2),
                compare_price DECIMAL(10,2),
                stock INT DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
        console.log('✓ product_variants table created successfully');
    } catch (e: any) {
        console.error('Error:', e.message);
    }

    await conn.end();
    process.exit(0);
}

createVariantsTable();
