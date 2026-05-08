const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [jobsResult] = await pool.query("SELECT COUNT(*) AS totalJobs FROM jobs WHERE deleted_at IS NULL");
    const [usersResult] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [paymentsResult] = await pool.query(
      "SELECT COUNT(*) AS pendingPayments FROM payments WHERE status = 'pending'"
    );
    const [featuredResult] = await pool.query(
      "SELECT COUNT(*) AS featuredJobs FROM jobs WHERE is_featured = 1 AND deleted_at IS NULL"
    );
    const [verificationRequestsResult] = await pool.query(
      "SELECT COUNT(*) AS verificationRequests FROM employer_verifications"
    );
    const [pendingVerificationsResult] = await pool.query(
      "SELECT COUNT(*) AS pendingVerifications FROM employer_verifications WHERE verification_status = 'pending'"
    );
    const [verifiedEmployersResult] = await pool.query(
      "SELECT COUNT(*) AS verifiedEmployers FROM employer_verifications WHERE verification_status = 'verified'"
    );

    res.json({
      success: true,
      totalJobs: jobsResult[0].totalJobs || 0,
      totalUsers: usersResult[0].totalUsers || 0,
      pendingPayments: paymentsResult[0].pendingPayments || 0,
      featuredJobs: featuredResult[0].featuredJobs || 0,
      verificationRequests: verificationRequestsResult[0].verificationRequests || 0,
      pendingVerifications: pendingVerificationsResult[0].pendingVerifications || 0,
      verifiedEmployers: verifiedEmployersResult[0].verifiedEmployers || 0
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
        moderation_status,
        visibility_status,
        is_featured,
        paid_at,
        expires_at,
        rejection_reason,
        deleted_at,
        created_at,
        updated_at
       FROM jobs
       WHERE deleted_at IS NULL
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

router.get("/employer-verifications", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         ev.id,
         ev.user_id,
         ev.company_name,
         ev.company_email,
         ev.company_phone,
         ev.business_registration_number,
         ev.verification_status,
         ev.review_notes,
         ev.reviewed_by,
         ev.reviewed_at,
         ev.created_at,
         ev.updated_at,
         u.full_name AS user_full_name,
         u.email AS user_email
       FROM employer_verifications ev
       LEFT JOIN users u ON ev.user_id = u.id
       ORDER BY ev.created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load employer verifications",
      error: error.message
    });
  }
});

router.put("/employer-verifications/:id/review", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status, review_notes } = req.body;

    if (!verification_status || !["verified", "rejected", "pending"].includes(String(verification_status).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "verification_status must be verified, rejected, or pending"
      });
    }

    const [rows] = await pool.query(
      `SELECT id
       FROM employer_verifications
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employer verification record not found"
      });
    }

    await pool.query(
      `UPDATE employer_verifications
       SET verification_status = ?,
           review_notes = ?,
           reviewed_by = ?,
           reviewed_at = NOW()
       WHERE id = ?`,
      [
        String(verification_status).toLowerCase(),
        review_notes || null,
        req.adminUser?.id || null,
        id
      ]
    );

    res.json({
      success: true,
      message: "Employer verification review updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to review employer verification",
      error: error.message
    });
  }
});

module.exports = router;
