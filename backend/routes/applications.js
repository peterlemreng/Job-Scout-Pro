const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");
const requireAuth = require("../middleware/requireAuth");
const writeAuditLog = require("../utils/auditLog");

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

router.get("/", requireAdmin, async (req, res) => {
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

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT a.*, j.posted_by
       FROM applications a
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    const application = rows[0];
    const currentUserId = Number(req.user?.id || 0);
    const currentUserRole = String(req.user?.role || "").toLowerCase();
    const applicantUserId = Number(application.user_id || 0);
    const employerUserId = Number(application.posted_by || 0);

    const canView =
      currentUserRole === "admin" ||
      applicantUserId === currentUserId ||
      employerUserId === currentUserId;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    delete application.posted_by;

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load application",
      error: error.message
    });
  }
});

router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    const [result] = await pool.query(
      "UPDATE applications SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    await writeAuditLog({
      adminId: req.adminUser?.id || null,
      adminEmail: req.adminUser?.email || null,
      actionType: "application_status_updated",
      targetType: "application",
      targetId: Number(id),
      details: JSON.stringify({
        application_id: Number(id),
        new_status: status
      })
    });

    res.json({
      success: true,
      message: "Application status updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message
    });
  }
});

module.exports = router;
