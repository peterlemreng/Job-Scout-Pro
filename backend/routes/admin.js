const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [jobsResult] = await pool.query("SELECT COUNT(*) AS totalJobs FROM jobs");
    const [usersResult] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [paymentsResult] = await pool.query(
      "SELECT COUNT(*) AS pendingPayments FROM payments WHERE status = 'pending'"
    );
    const [featuredResult] = await pool.query(
      "SELECT COUNT(*) AS featuredJobs FROM jobs WHERE is_featured = 1"
    );

    res.json({
      success: true,
      totalJobs: jobsResult[0].totalJobs || 0,
      totalUsers: usersResult[0].totalUsers || 0,
      pendingPayments: paymentsResult[0].pendingPayments || 0,
      featuredJobs: featuredResult[0].featuredJobs || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load admin stats",
      error: error.message
    });
  }
});

router.get("/jobs", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        job_id,
        title,
        company,
        location,
        category,
        job_type,
        status,
        post_status,
        payment_status,
        is_featured,
        paid_at,
        expires_at,
        rejection_reason,
        created_at,
        updated_at
       FROM jobs
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load admin jobs",
      error: error.message
    });
  }
});

router.get("/audit-logs", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        admin_id,
        admin_email,
        action_type,
        target_type,
        target_id,
        details,
        created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 100`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load audit logs",
      error: error.message
    });
  }
});

module.exports = router;
