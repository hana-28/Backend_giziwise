const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database'); // eslint-disable-line no-console
    connection.release();
  } catch (err) {
    console.error('Unable to connect to the database:', err.message); // eslint-disable-line no-console
  }
}

testConnection();

module.exports = pool;
