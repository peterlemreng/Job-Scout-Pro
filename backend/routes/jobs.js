const express = require("express");
const router = express.Router();
const pool = require("../db");

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
        views_count,
        clicks_count,
        likes_count,
        is_featured,
        featured_expires_at,
        created_at,
        updated_at
      FROM jobs
      WHERE status = 'active'
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

module.exports = router;
