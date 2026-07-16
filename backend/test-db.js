require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    console.log("Connecting...");

    
const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});
    console.log("Connected successfully!");

    const [rows] = await conn.query("SELECT NOW() AS time");
    console.log(rows);

    await conn.end();
    console.log("Done");

  } catch (err) {
    console.error("ERROR CODE:", err.code);
    console.error("ERROR MESSAGE:", err.message);
  }
})();
