const db = require("./db");

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
    conn.release();
  } catch (err) {
    console.error("❌ DATABASE CONNECTION FAILED:", err.message);
  }
})();
