const express = require("express");
const router = express.Router();
const pool = require("../db");
const fraudCheck = require("../middleware/fraudCheck");
const requireAuth = require("../middleware/requireAuth");
const writeAuditLog = require("../utils/auditLog");

async function expirePublishedJobs() {
  await pool.query(`
    UPDATE jobs
    SET
      post_status = 'expired',
      visibility_status = 'expired',
      updated_at = NOW()
    WHERE deleted_at IS NULL
      AND payment_status = 'paid'
      AND (visibility_status = 'published' OR post_status = 'published')
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
  `);
}

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
    await expirePublishedJobs();
    const [rows] = await pool.query(`
      SELECT
        j.id,
        j.job_id,
        j.title,
        j.company,
        j.location,
        j.category,
        j.job_type,
        j.description,
        j.apply_url,
        j.application_method,
        j.status,
        j.post_status,
        j.payment_status,
        j.moderation_status,
        j.visibility_status,
        j.plan_type,
        j.plan_price,
        j.plan_duration_days,
        j.paid_at,
        j.expires_at,
        j.views_count,
        j.clicks_count,
        j.likes_count,
        j.is_featured,
        j.featured_expires_at,
        j.created_at,
        j.updated_at,
        CASE
          WHEN ev.verification_status = 'verified' THEN 1
          ELSE 0
        END AS is_employer_verified
      FROM jobs j
      LEFT JOIN (
        SELECT ev1.user_id, ev1.verification_status
        FROM employer_verifications ev1
        INNER JOIN (
          SELECT user_id, MAX(id) AS max_id
          FROM employer_verifications
          GROUP BY user_id
        ) latest
          ON ev1.user_id = latest.user_id
         AND ev1.id = latest.max_id
      ) ev ON ev.user_id = j.posted_by
        WHERE j.deleted_at IS NULL
          AND j.status = 'active'
          AND j.payment_status = 'paid'
          AND (j.visibility_status = 'published' OR j.post_status = 'published')
          AND (j.expires_at IS NULL OR j.expires_at >= NOW())
      ORDER BY j.created_at DESC
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
        j.id,
        j.job_id,
        j.title,
        j.company,
        j.location,
        j.category,
        j.job_type,
        j.description,
        j.apply_url,
        j.application_method,
        j.status,
        j.post_status,
        j.payment_status,
        j.plan_type,
        j.plan_price,
        j.plan_duration_days,
        j.paid_at,
        j.expires_at,
        j.views_count,
        j.clicks_count,
        j.likes_count,
        j.is_featured,
        j.featured_expires_at,
        j.created_at,
        j.updated_at,
        CASE
          WHEN ev.verification_status = 'verified' THEN 1
          ELSE 0
        END AS is_employer_verified
      FROM jobs j
      LEFT JOIN (
        SELECT ev1.user_id, ev1.verification_status
        FROM employer_verifications ev1
        INNER JOIN (
          SELECT user_id, MAX(id) AS max_id
          FROM employer_verifications
          GROUP BY user_id
        ) latest
          ON ev1.user_id = latest.user_id
         AND ev1.id = latest.max_id
      ) ev ON ev.user_id = j.posted_by
      WHERE j.id = ? LIMIT 1`,
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
      apply_url,
      application_method
    } = req.body;

    const posted_by = Number(req.user?.id || 0);
    const normalizedApplicationMethod = String(application_method || "").toLowerCase() === "external" ? "external" : "internal";

    if (!title || !company || !location || !job_type || !description) {
      return res.status(400).json({
        success: false,
        message: "All job fields are required"
      });
    }

    if (normalizedApplicationMethod === "external" && !String(apply_url || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Apply URL is required for external applications"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (
        title, company, location, job_type, description, category, apply_url, application_method, posted_by,
        status, plan_type, plan_price, plan_duration_days, payment_status, post_status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'inactive', 'basic', 799.00, 30, 'pending', 'draft', NOW(), NOW())`,
      [
        title,
        company,
        location,
        job_type,
        description,
        category || null,
        normalizedApplicationMethod === "external" ? (apply_url || null) : null,
        normalizedApplicationMethod,
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

    await pool.query("UPDATE jobs SET deleted_at = NOW() WHERE id = ?", [id]);

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
            visibility_status = 'archived',
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
router.put("/:id/approve", require("../middleware/requireAdmin"), async (req, res) => {
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

    if (postStatus !== "pending_review" || paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid jobs pending review can be approved"
      });
    }

    await pool.query(
      `UPDATE jobs
       SET status = 'active',
           post_status = 'published',
            moderation_status = 'approved',
            visibility_status = 'published',
           rejection_reason = NULL,
           approved_at = NOW(),
           approved_by = ?,
           expires_at = CASE
             WHEN expires_at IS NULL THEN DATE_ADD(NOW(), INTERVAL plan_duration_days DAY)
             ELSE expires_at
           END,
           updated_at = NOW()
       WHERE id = ?`,
      [req.adminUser?.id || null, id]
    );

    await writeAuditLog({
      adminId: req.adminUser?.id || null,
      adminEmail: req.adminUser?.email || null,
      actionType: "job_approved",
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
      message: "Job approved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve job",
      error: error.message
    });
  }
});

router.put("/:id/reject", require("../middleware/requireAdmin"), async (req, res) => {
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

    if (postStatus !== "pending_review" || paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid jobs pending review can be rejected"
      });
    }

    await pool.query(
      `UPDATE jobs
       SET status = 'inactive',
            moderation_status = 'rejected',
            visibility_status = 'archived',
           post_status = 'rejected',
           rejection_reason = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [rejection_reason || "Rejected by admin", id]
    );

    await writeAuditLog({
      adminId: req.adminUser?.id || null,
      adminEmail: req.adminUser?.email || null,
      actionType: "job_rejected",
      targetType: "job",
      targetId: Number(id),
      details: JSON.stringify({
        job_id: Number(id),
        title: job.title || null,
        company: job.company || null,
        previous_post_status: job.post_status || null,
        previous_payment_status: job.payment_status || null,
        rejection_reason: rejection_reason || "Rejected by admin"
      })
    });

    res.json({
      success: true,
      message: "Job rejected successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject job",
      error: error.message
    });
  }
});

module.exports = router;
