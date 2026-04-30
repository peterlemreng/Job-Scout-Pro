const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/", async (req, res) => {
  try {
    const {
      job_db_id,
      full_name,
      email,
      phone,
      amount,
      currency,
      payment_method,
      payment_for,
      transaction_code
    } = req.body;

    if (
      !job_db_id ||
      !full_name ||
      !email ||
      !phone ||
      !amount ||
      !currency ||
      !payment_method ||
      !payment_for ||
      !transaction_code
    ) {
      return res.status(400).json({
        success: false,
        message: "All required payment fields must be provided"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO payments
      (job_db_id, full_name, email, phone, amount, currency, payment_method, payment_for, transaction_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        job_db_id,
        full_name,
        email,
        phone,
        amount,
        currency,
        payment_method,
        payment_for,
        transaction_code
      ]
    );

    await pool.query(
      `UPDATE jobs
       SET payment_reference = ?, payer_name = ?, payer_phone = ?, amount_paid = ?,
           payment_status = 'pending', post_status = 'pending_review', updated_at = NOW()
       WHERE id = ?`,
      [transaction_code, full_name, phone, amount, job_db_id]
    );

    res.json({
      success: true,
      message: "Payment submitted successfully. Your post is now pending admin review.",
      paymentId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save payment",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load payments",
      error: error.message
    });
  }
});

router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_id, failure_reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE id = ? LIMIT 1",
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const payment = payments[0];

    await pool.query(
      "UPDATE payments SET status = ?, reviewed_at = NOW(), reviewed_by = ?, failure_reason = ? WHERE id = ?",
      [status, admin_id || null, (status === "failed" || status === "rejected") ? (failure_reason || "No reason provided") : null, id]
    );

    if (payment.job_db_id) {
      if (status === "completed") {
        await pool.query(
          `UPDATE jobs
           SET payment_status = 'paid',
               post_status = 'published',
               status = 'active',
               paid_at = NOW(),
               approved_at = NOW(),
               approved_by = ?,
               expires_at = DATE_ADD(NOW(), INTERVAL plan_duration_days DAY),
               updated_at = NOW()
           WHERE id = ?`,
          [admin_id || null, payment.job_db_id]
        );
      } else if (status === "failed" || status === "rejected") {
        await pool.query(
          `UPDATE jobs
           SET payment_status = 'rejected',
               post_status = 'pending_review',
               status = 'inactive',
               updated_at = NOW()
           WHERE id = ?`,
          [payment.job_db_id]
        );
      }
    }

    res.json({
      success: true,
      message: "Payment status updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message
    });
  }
});


router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE id = ? LIMIT 1",
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const payment = payments[0];
    const paymentStatus = String(payment.status || "").toLowerCase();

    if (!["pending", "failed", "rejected"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Only pending, failed, or rejected payments can be deleted"
      });
    }

    await pool.query("DELETE FROM payments WHERE id = ?", [id]);

    if (payment.job_db_id) {
      await pool.query(
        `UPDATE jobs
         SET payment_status = 'pending',
             post_status = 'draft',
             status = 'inactive',
             payment_reference = NULL,
             payer_name = NULL,
             payer_phone = NULL,
             amount_paid = NULL,
             paid_at = NULL,
             approved_at = NULL,
             approved_by = NULL,
             expires_at = NULL,
             updated_at = NOW()
         WHERE id = ?`,
        [payment.job_db_id]
      );
    }

    res.json({
      success: true,
      message: "Payment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message
    });
  }
});
module.exports = router;
