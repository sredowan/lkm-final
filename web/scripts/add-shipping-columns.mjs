
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function addShippingColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king',
    });

    try {
        await connection.execute(`
            ALTER TABLE orders 
            ADD COLUMN tracking_number VARCHAR(100),
            ADD COLUMN shipping_provider VARCHAR(50)
        `);
        console.log('Shipping columns added successfully!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Error adding columns:', error);
        }
    } finally {
        await connection.end();
    }
}

addShippingColumns();
