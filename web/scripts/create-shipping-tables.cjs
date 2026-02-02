// Script to create shipping tables
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createShippingTables() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    console.log('Connected to database');

    try {
        // Create shipping_providers table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS shipping_providers (
                id int AUTO_INCREMENT NOT NULL,
                name varchar(100) NOT NULL,
                code varchar(50) NOT NULL,
                api_key varchar(512),
                api_secret varchar(512),
                account_number varchar(100),
                test_mode boolean DEFAULT true,
                is_active boolean DEFAULT false,
                settings text,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT shipping_providers_id PRIMARY KEY(id),
                CONSTRAINT shipping_providers_code_unique UNIQUE(code)
            )
        `);
        console.log('✓ Created shipping_providers table');

        // Create shipping_zones table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS shipping_zones (
                id int AUTO_INCREMENT NOT NULL,
                name varchar(100) NOT NULL,
                postcodes text,
                flat_rate decimal(10,2),
                free_shipping_threshold decimal(10,2),
                weight_rate decimal(10,2),
                is_active boolean DEFAULT true,
                sort_order int DEFAULT 0,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT shipping_zones_id PRIMARY KEY(id)
            )
        `);
        console.log('✓ Created shipping_zones table');

        console.log('Shipping tables created successfully!');
    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        await connection.end();
    }
}

createShippingTables();
