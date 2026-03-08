import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

const sql = `
CREATE TABLE IF NOT EXISTS \`variant_types\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`name\` varchar(100) NOT NULL,
    \`is_active\` boolean DEFAULT true,
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`variant_types_id\` PRIMARY KEY(\`id\`)
);

CREATE TABLE IF NOT EXISTS \`variant_options\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`type_id\` int NOT NULL,
    \`value\` varchar(100) NOT NULL,
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`variant_options_id\` PRIMARY KEY(\`id\`),
    FOREIGN KEY (\`type_id\`) REFERENCES \`variant_types\`(\`id\`)
);

CREATE TABLE IF NOT EXISTS \`product_variants\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`product_id\` int NOT NULL,
    \`name\` varchar(255),
    \`sku\` varchar(100),
    \`price\` decimal(10, 2),
    \`compare_price\` decimal(10, 2),
    \`stock\` int DEFAULT 0,
    \`image_url\` varchar(255),
    \`is_active\` boolean DEFAULT true,
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`product_variants_id\` PRIMARY KEY(\`id\`),
    FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`)
);

CREATE TABLE IF NOT EXISTS \`product_variant_options\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`variant_id\` int NOT NULL,
    \`option_id\` int NOT NULL,
    CONSTRAINT \`product_variant_options_id\` PRIMARY KEY(\`id\`),
    FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`),
    FOREIGN KEY (\`option_id\`) REFERENCES \`variant_options\`(\`id\`)
);
`;

// Note: If columns already exist/are dropped, these might fail, so we handle them individually.
try {
    console.log('Applying schema updates...');

    // Split by semicolon but watch out for internal semicolons (none here)
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
    }

    // Individual Alter table statements (safe check)
    const alters = [
        "ALTER TABLE `product_variants` ADD COLUMN IF NOT EXISTS `name` varchar(255)",
        "ALTER TABLE `product_variants` ADD COLUMN IF NOT EXISTS `image_url` varchar(255)",
        "ALTER TABLE `product_variants` DROP COLUMN IF EXISTS `color` CASCADE",
        "ALTER TABLE `product_variants` DROP COLUMN IF EXISTS `storage` CASCADE"
    ];

    for (const alter of alters) {
        try {
            console.log(`Executing: ${alter}`);
            await connection.query(alter);
        } catch (e) {
            console.log(`Notice: ${e.message}`);
        }
    }

    console.log('Database updated successfully!');
} catch (error) {
    console.error('Error updating database:', error);
} finally {
    await connection.end();
}
