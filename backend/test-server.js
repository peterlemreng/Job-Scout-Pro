require("dotenv").config();

const express = require("express");
const app = express();

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    env: {
      DB_HOST: !!process.env.DB_HOST,
      DB_USER: !!process.env.DB_USER,
      DB_PASSWORD: !!process.env.DB_PASSWORD,
      DB_NAME: !!process.env.DB_NAME,
      AFRICASTALKING_USERNAME: !!process.env.AFRICASTALKING_USERNAME,
      AFRICASTALKING_API_KEY: !!process.env.AFRICASTALKING_API_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SERVER RUNNING ON PORT:", PORT);
});

app.get("/db-test", async (req, res) => {
  try {
    const mysql = require("mysql2/promise");

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
      status: "DB CONNECTED",
      result: rows
    });

  } catch (err) {
    res.status(500).json({
      status: "DB ERROR",
      error: err.message
    });
  }
});

