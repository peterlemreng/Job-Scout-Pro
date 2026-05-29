require("dotenv").config();
const mysql = require("mysql2/promise");

const rawUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL || process.env.DATABASE_URL;
const url = new URL(rawUrl);

const pool = mysql.createPool({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;

pool.query("SELECT 1 AS ok")
  .then(() => console.log("DB startup test: OK"))
  .catch((err) => console.error("DB startup test failed:", err.message));
