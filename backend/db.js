require('dotenv').config();
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
pool.getConnection()
  .then(c => { console.log('✅ DB OK'); c.release(); })
  .catch(err => console.error('❌', err.code, err.message));
module.exports = pool;
