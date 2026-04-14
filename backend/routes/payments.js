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

module.exports = router;
