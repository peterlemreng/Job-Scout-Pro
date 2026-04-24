const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  try {
    const { job_id, user_id, full_name, email, phone, cv_url, cover_letter } = req.body;

    if (!job_id || !full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "job_id, full_name, and email are required"
      });
    }

    const [result] = await pool.query(
      "INSERT INTO applications (job_id, user_id, full_name, email, phone, cv_url, cover_letter, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')",
      [job_id, user_id || null, full_name, email, phone || null, cv_url || null, cover_letter || null]
    );

    res.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM applications ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load applications",
      error: error.message
    });
  }
});

module.exports = router;
