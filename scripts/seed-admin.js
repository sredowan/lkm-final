const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const seed = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    try {
        await connection.execute(
            'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin User', 'lakembamobileking@gmail.com', hashedPassword, 'admin']
        );
        console.log('Admin user created successfully');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('Admin user already exists');
        } else {
            console.error('Error seeding admin:', error);
        }
    } finally {
        await connection.end();
    }
};

seed();
