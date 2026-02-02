import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createCustomersTable() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king',
    });

    try {
        // Create customers table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                city VARCHAR(100),
                postcode VARCHAR(20),
                state VARCHAR(50),
                country VARCHAR(50) DEFAULT 'Australia',
                total_orders INT DEFAULT 0,
                total_spent DECIMAL(10, 2) DEFAULT 0,
                last_order_date TIMESTAMP NULL,
                notes TEXT,
                tags VARCHAR(255),
                source VARCHAR(50),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Customers table created successfully!');

        // Migrate existing customers from orders table
        const [existingCustomers] = await connection.execute(`
            SELECT 
                customer_email as email,
                customer_name as name,
                customer_phone as phone,
                shipping_address as address,
                COUNT(*) as total_orders,
                SUM(total) as total_spent,
                MAX(created_at) as last_order_date,
                MIN(created_at) as first_order_date
            FROM orders
            GROUP BY customer_email, customer_name, customer_phone, shipping_address
        `);

        console.log(`Found ${existingCustomers.length} existing customers from orders`);

        for (const customer of existingCustomers) {
            try {
                await connection.execute(
                    `INSERT INTO customers (email, name, phone, address, total_orders, total_spent, last_order_date, source)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     total_orders = VALUES(total_orders),
                     total_spent = VALUES(total_spent),
                     last_order_date = VALUES(last_order_date)`,
                    [
                        customer.email,
                        customer.name,
                        customer.phone || '',
                        customer.address || '',
                        customer.total_orders,
                        customer.total_spent || 0,
                        customer.last_order_date,
                        'website'
                    ]
                );
            } catch (err) {
                console.log(`Skipped duplicate: ${customer.email}`);
            }
        }

        console.log('Customer migration completed!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

createCustomersTable();
