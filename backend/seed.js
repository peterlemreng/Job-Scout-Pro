const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedDatabase() {
  let connection;

  try {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error("Missing required database environment variables");
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "job_scout_pro",
    });

    const adminPassword = await bcrypt.hash("Peter@2026Secure", 10);

    await connection.query("DELETE FROM users");

    await connection.query(
      `INSERT INTO users 
      (full_name, email, phone, password, role, premium_status, ad_post_credits) 
      VALUES (?, ?, ?, ?, 'admin', 'active', 100)`,
      [
        "Peter Lemreng",
        "peterlemreng1987@gmail.com",
        "0723479577",
        adminPassword,
      ]
    );

    console.log("Database seeded successfully");
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();