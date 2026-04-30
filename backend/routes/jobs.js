const express = require("express");
const router = express.Router();
const pool = require("../db");
const fraudCheck = require("../middleware/fraudCheck");

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
      WHERE status = 'active'          AND (expires_at IS NULL OR expires_at >= NOW())
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

    await pool.query(
      "UPDATE jobs SET views_count = views_count + 1 WHERE id = ?",
      [id]
    );

    const [rows] = await pool.query(
      "SELECT views_count FROM jobs WHERE id = ? LIMIT 1",
      [id]
    );

    res.json({
      success: true,
      message: "View tracked successfully",
      views_count: rows[0]?.views_count || 0
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

    await pool.query(
      "UPDATE jobs SET likes_count = likes_count + 1 WHERE id = ?",
      [id]
    );

    const [rows] = await pool.query(
      "SELECT likes_count FROM jobs WHERE id = ? LIMIT 1",
      [id]
    );

    res.json({
      success: true,
      message: "Job liked successfully",
      likes_count: rows[0]?.likes_count || 0
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

    await pool.query(
      "UPDATE jobs SET clicks_count = clicks_count + 1 WHERE id = ?",
      [id]
    );

    const [rows] = await pool.query(
      "SELECT clicks_count FROM jobs WHERE id = ? LIMIT 1",
      [id]
    );

    res.json({
      success: true,
      message: "Job click tracked successfully",
      clicks_count: rows[0]?.clicks_count || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to track click",
      error: error.message
    });
  }
});

router.post("/", fraudCheck, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      job_type,
      description,
      category,
      apply_url,
      posted_by
    } = req.body;

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
module.exports = router;
