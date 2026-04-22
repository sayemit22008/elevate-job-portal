const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function runSetup() {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true,
            ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com') 
                ? { rejectUnauthorized: false } 
                : false
        });

        console.log('Connected. Executing setup.sql...');

        const sqlPath = path.join(__dirname, '../config/setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon to avoid issues with some drivers/servers even with multipleStatements
        // But for Aiven MySQL, multipleStatements should work.
        await connection.query(sql);
        
        console.log('Database tables initialized successfully!');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error.message);
        process.exit(1);
    }
}

runSetup();
