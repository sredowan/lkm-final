import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createBrandsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king',
    });

    try {
        console.log('Connected to database.');

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS \`brands\` (
                \`id\` int AUTO_INCREMENT NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`slug\` varchar(100) NOT NULL,
                \`logo\` varchar(512),
                \`is_popular\` boolean DEFAULT false,
                \`is_active\` boolean DEFAULT true,
                \`sort_order\` int DEFAULT 0,
                \`created_at\` timestamp DEFAULT (now()),
                \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT \`brands_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`brands_slug_unique\` UNIQUE(\`slug\`)
            );
        `;

        await connection.execute(createTableSQL);
        console.log('Brands table created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await connection.end();
    }
}

createBrandsTable();
