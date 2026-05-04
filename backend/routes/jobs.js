const express = require("express");
const router = express.Router();
const pool = require("../db");
const fraudCheck = require("../middleware/fraudCheck");
const requireAuth = require("../middleware/requireAuth");
const writeAuditLog = require("../utils/auditLog");

async function trackUniqueJobAction(jobId, visitorId, actionType, counterField) {
  if (!visitorId) {
    return null;
  }

  const [existing] = await pool.query(
    "SELECT id FROM job_actions WHERE job_id = ? AND visitor_id = ? AND action_type = ? LIMIT 1",
    [jobId, visitorId, actionType]
  );

  if (existing.length > 0) {
    const [rows] = await pool.query(
      `SELECT ${counterField} FROM jobs WHERE id = ? LIMIT 1`,
      [jobId]
    );
    return { alreadyTracked: true, count: rows[0]?.[counterField] || 0 };
  }

  await pool.query(
    "INSERT INTO job_actions (job_id, visitor_id, action_type) VALUES (?, ?, ?)",
    [jobId, visitorId, actionType]
  );

  await pool.query(
    `UPDATE jobs SET ${counterField} = ${counterField} + 1 WHERE id = ?`,
    [jobId]
  );

  const [rows] = await pool.query(
    `SELECT ${counterField} FROM jobs WHERE id = ? LIMIT 1`,
    [jobId]
  );

  return { alreadyTracked: false, count: rows[0]?.[counterField] || 0 };
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        job_id,
        title,
        company,
        location,
        category,
        job_type,
        description,
        apply_url,
        status,
        post_status,
        payment_status,
        plan_type,
        plan_price,
        plan_duration_days,
        paid_at,
        expires_at,
        views_count,
        clicks_count,
        likes_count,
        is_featured,
        featured_expires_at,
        created_at,
        updated_at
      FROM jobs
      WHERE status = 'active'
        AND post_status = 'published'
        AND payment_status = 'paid'
        AND (expires_at IS NULL OR expires_at >= NOW())
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load jobs",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        id,
        job_id,
        title,
        company,
        location,
        category,
        job_type,
        description,
        apply_url,
        status,
        post_status,
        payment_status,
        plan_type,
        plan_price,
        plan_duration_days,
        paid_at,
        expires_at,
        views_count,
        clicks_count,
        likes_count,
        is_featured,
        featured_expires_at,
        created_at,
        updated_at
      FROM jobs
      WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.json({
      success: true,
      job: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load job details",
      error: error.message
    });
  }
});

router.post("/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorId } = req.body || {};

    const result = await trackUniqueJobAction(id, visitorId, "view", "views_count");

    res.json({
      success: true,
      message: result?.alreadyTracked ? "View already tracked" : "View tracked successfully",
      views_count: result?.count || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to track view",
      error: error.message
    });
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorId } = req.body || {};

    const result = await trackUniqueJobAction(id, visitorId, "like", "likes_count");

    res.json({
      success: true,
      message: result?.alreadyTracked ? "Job already liked" : "Job liked successfully",
      likes_count: result?.count || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to like job",
      error: error.message
    });
  }
});

router.post("/:id/click", async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorId } = req.body || {};

    const result = await trackUniqueJobAction(id, visitorId, "click", "clicks_count");

    res.json({
      success: true,
      message: result?.alreadyTracked ? "Job click already tracked" : "Job click tracked successfully",
      clicks_count: result?.count || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to track click",
      error: error.message
    });
  }
});

router.post("/", requireAuth, fraudCheck, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      job_type,
      description,
      category,
      apply_url
    } = req.body;

    const posted_by = Number(req.user?.id || 0);

    if (!title || !company || !location || !job_type || !description) {
      return res.status(400).json({
        success: false,
        message: "All job fields are required"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (
        title, company, location, job_type, description, category, apply_url, posted_by,
        status, plan_type, plan_price, plan_duration_days, payment_status, post_status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'inactive', 'basic', 799.00, 30, 'pending', 'draft', NOW(), NOW())`,
      [
        title,
        company,
        location,
        job_type,
        description,
        category || null,
        apply_url || null,
        posted_by || null
      ]
    );

    res.json({
      success: true,
      message: "Job draft created. Proceed to payment.",
      jobId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message
    });
  }
});


router.delete("/:id", require("../middleware/requireAdmin"), async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE id = ? LIMIT 1",
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const job = jobs[0];
    const postStatus = String(job.post_status || "").toLowerCase();
    const paymentStatus = String(job.payment_status || "").toLowerCase();

    if (
      !["draft", "pending_review"].includes(postStatus) &&
      !["pending", "failed", "rejected"].includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Only draft, pending review, failed, or rejected jobs can be deleted"
      });
    }

    await pool.query("DELETE FROM jobs WHERE id = ?", [id]);

    await writeAuditLog({
      adminId: req.adminUser?.id || null,
      adminEmail: req.adminUser?.email || null,
      actionType: "job_deleted",
      targetType: "job",
      targetId: Number(id),
      details: JSON.stringify({
        job_id: Number(id),
        title: job.title || null,
        company: job.company || null,
        previous_post_status: job.post_status || null,
        previous_payment_status: job.payment_status || null,
        rejection_reason: rejection_reason || null
      })
    });

    res.json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message
    });
  }
});

router.put("/:id/unpublish", require("../middleware/requireAdmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE id = ? LIMIT 1",
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const job = jobs[0];
    const postStatus = String(job.post_status || "").toLowerCase();
    const paymentStatus = String(job.payment_status || "").toLowerCase();

    if (postStatus !== "published" || paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only published paid jobs can be unpublished"
      });
    }

    await pool.query(
      `UPDATE jobs
       SET status = 'inactive',
           post_status = 'archived',
           rejection_reason = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [rejection_reason || null, id]
    );

    await writeAuditLog({
      adminId: req.adminUser?.id || null,
      adminEmail: req.adminUser?.email || null,
      actionType: "job_unpublished",
      targetType: "job",
      targetId: Number(id),
      details: JSON.stringify({
        job_id: Number(id),
        title: job.title || null,
        company: job.company || null,
        previous_post_status: job.post_status || null,
        previous_payment_status: job.payment_status || null
      })
    });

    res.json({
      success: true,
      message: "Job unpublished successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unpublish job",
      error: error.message
    });
  }
});
module.exports = router;
