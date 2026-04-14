const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/stats", async (req, res) => {
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

module.exports = router;
