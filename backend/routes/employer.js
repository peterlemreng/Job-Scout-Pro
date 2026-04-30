const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/posts", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required"
      });
    }

    const [rows] = await pool.query(
      `SELECT
         p.id AS payment_id,
         p.job_db_id,
         p.full_name,
         p.email,
         p.phone,
         p.amount,
         p.currency,
         p.payment_method,
         p.payment_for,
         p.transaction_code,
         p.status AS payment_record_status,
         p.failure_reason,
         p.created_at AS payment_created_at,
         p.reviewed_at,
         j.id AS job_id,
         j.title,
         j.company,
         j.location,
         j.category,
         j.job_type,
         j.post_status,
         j.payment_status,
         j.paid_at,
         j.expires_at
       FROM payments p
       LEFT JOIN jobs j ON p.job_db_id = j.id
       WHERE LOWER(p.email) = ?
       ORDER BY p.created_at DESC`,
      [email]
    );

    res.json({
      success: true,
      posts: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load employer posts",
      error: error.message
    });
  }
});

module.exports = router;
