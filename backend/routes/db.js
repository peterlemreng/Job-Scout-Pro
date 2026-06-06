const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

router.get("/test", async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    const [rows] = await connection.execute("SELECT 1 AS result");

    await connection.end();

    res.json({
      success: true,
      message: "DB CONNECTED",
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "DB ERROR",
      error: err.message
    });
  }
});

module.exports = router;
