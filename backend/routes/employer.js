const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

router.get("/posts", requireAuth, async (req, res) => {
  try {
    const email = String(req.user?.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
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
         j.rejection_reason,
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

router.get("/verification", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user?.id || 0);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const [rows] = await pool.query(
      `SELECT
         id,
         user_id,
         company_name,
         company_email,
         company_phone,
         business_registration_number,
         verification_status,
         review_notes,
         reviewed_by,
         reviewed_at,
         created_at,
         updated_at
       FROM employer_verifications
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    );

    res.json({
      success: true,
      verification: rows[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load employer verification",
      error: error.message
    });
  }
});

router.post("/verification", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user?.id || 0);
    const {
      company_name,
      company_email,
      company_phone,
      business_registration_number
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!company_name || !company_email) {
      return res.status(400).json({
        success: false,
        message: "company_name and company_email are required"
      });
    }

    const [existing] = await pool.query(
      `SELECT id
       FROM employer_verifications
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE employer_verifications
         SET company_name = ?,
             company_email = ?,
             company_phone = ?,
             business_registration_number = ?,
             verification_status = 'pending',
             review_notes = NULL,
             reviewed_by = NULL,
             reviewed_at = NULL
         WHERE id = ?`,
        [
          company_name,
          company_email,
          company_phone || null,
          business_registration_number || null,
          existing[0].id
        ]
      );

      return res.json({
        success: true,
        message: "Employer verification request updated successfully"
      });
    }

    await pool.query(
      `INSERT INTO employer_verifications
       (user_id, company_name, company_email, company_phone, business_registration_number, verification_status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        company_name,
        company_email,
        company_phone || null,
        business_registration_number || null
      ]
    );

    res.json({
      success: true,
      message: "Employer verification request submitted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit employer verification",
      error: error.message
    });
  }
});

module.exports = router;
