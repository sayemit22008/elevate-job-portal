const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Provide a promise-based API
const promisePool = pool.promise();

// Check connection
promisePool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`Database '${process.env.DB_NAME || 'job_portal'}' does not exist. Please run setup.sql.`);
        } else {
            console.error('Database connection failed:', err.message);
        }
    });

module.exports = promisePool;
