const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      amount,
      currency,
      payment_method,
      payment_for,
      transaction_code,
      status
    } = req.body;

    if (
      !full_name ||
      !email ||
      !phone ||
      !amount ||
      !currency ||
      !payment_method ||
      !payment_for
    ) {
      return res.status(400).json({
        success: false,
        message: "All required payment fields must be provided"
      });
    }

    const finalStatus = status || "pending";

    const [result] = await pool.query(
      `INSERT INTO payments
      (full_name, email, phone, amount, currency, payment_method, payment_for, transaction_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone,
        amount,
        currency,
        payment_method,
        payment_for,
        transaction_code || null,
        finalStatus
      ]
    );

    res.json({
      success: true,
      message: "Payment saved successfully",
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
router.put("/:id/status", async (req, res) => {
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
      "UPDATE payments SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
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

module.exports = router;
