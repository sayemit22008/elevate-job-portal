const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function runSetup() {
    try {
        // Connect without database first to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true // Allows multiple statements in one query
        });

        console.log('Connected to MySQL server.');

        const sql = fs.readFileSync(path.join(__dirname, '../config/setup.sql'), 'utf8');

        console.log('Executing setup.sql...');
        await connection.query(sql);
        console.log('Database and tables created successfully!');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

runSetup();
