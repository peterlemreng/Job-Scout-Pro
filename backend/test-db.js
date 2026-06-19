require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    console.log("Connecting...");

    const url = new URL(process.env.DATABASE_URL);

    const conn = await mysql.createConnection({
      host: url.hostname,
      port: url.port,
      user: url.username,
      password: url.password,
      database: url.pathname.replace("/", ""),
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
