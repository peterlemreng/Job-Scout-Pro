const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const https = require("https");
const querystring = require("querystring");
const atUsername = process.env.AFRICASTALKING_USERNAME || process.env.AT_USERNAME;
const atApiKey = process.env.AFRICASTALKING_API_KEY || process.env.AT_API_KEY;
const router = express.Router();
const pool = require("../db");
const otpStore = new Map();
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;



router.post("/signup", async (req, res) => {
  try {
    const {
      full_name, email, phone, password
    } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "INSERT INTO users (full_name, email, phone, password, role, email_verified, email_verification_code, email_verification_expires_at) VALUES (?, ?, ?, ?, 'user', 0, ?, ?)",
      [full_name, email, phone, hashedPassword, verificationCode, verificationExpiresAt]
    );

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Job Scout Pro <onboarding@resend.dev>",
        to: email,
        subject: "Verify your Job Scout Pro email",
        html: `<p>Your Job Scout Pro verification code is <strong>${verificationCode}</strong>.</p><p>This code expires in 15 minutes.</p>`
      });
    }

    res.json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      email_verification_required: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup failed",
      error: error.message
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password).catch(() => false);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (Number(user.email_verified || 0) !== 1) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        email_verification_required: true
      });
    }


    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const {
      email,
      otp_method
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const [users] = await pool.query(
      "SELECT id, email, phone FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    const user = users[0];
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const deliveryMethod = otp_method === "sms" ? "sms" : "email";

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 2 * 60 * 1000,
      otp_method: deliveryMethod
    });

    console.log("OTP for", email, "is", otp);

    if (deliveryMethod === "sms") {
      if (!user.phone) {
        return res.status(400).json({
          success: false,
          message: "No registered phone number found for this account"
        });
      }

      if (!atUsername || !atApiKey) {
        return res.status(503).json({
          success: false,
          message: "SMS service is not configured"
        });
      }

const normalizedPhone = user.phone.startsWith("+")
        ? user.phone
        : user.phone.startsWith("0")
          ? "+254" + user.phone.slice(1)
          : user.phone.startsWith("254")
            ? "+" + user.phone
            : user.phone;

      const postData = querystring.stringify({
        username: atUsername,
        to: normalizedPhone,
        message: `Your Job Scout Pro password reset OTP is ${otp}. It expires in 2 minutes.`
      });

      await new Promise((resolve, reject) => {
     const request = https.request(
  "https://api.sandbox.africastalking.com/version1/messaging",
  {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
      apiKey: atApiKey
    }
  },
  (response) => {
    let body = "";

    response.on("data", (chunk) => {
      body += chunk;
    });

    response.on("end", () => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve(body);
      } else {
        reject(new Error(body || `SMS request failed with status ${response.statusCode}`));
      }
    });
  }
);

request.on("error", (err) => {
  reject(err);
});

request.write(postData);
request.end();        




;
      });

      return res.json({
        success: true,
        message: "OTP sent by SMS successfully."
      });
    }

    if (!resend) {
      return res.status(503).json({
        success: false,
        message: "Email service is not configured"
      });
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Job Scout Pro Password Reset OTP",
      html: `<p>Your Job Scout Pro OTP is <b>${otp}</b>.</p><p>It expires in 2 minutes.</p>`
    });

    return res.json({
      success: true,
      message: "OTP sent by email successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process forgot password",
      error: error.message
    });
  }
});


router.post("/verify-otp",
  async (req, res) => {
    try {
      const {
        email,
        otp
      } = req.body;
      const record = otpStore.get(email);

      if (!record) {
        return res.status(400).json({
          success: false,
          message: "No OTP request found"
        });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP expired"
        });
      }

      if (record.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP"
        });
      }

      res.json({
        success: true,
        message: "OTP verified successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP",
        error: error.message
      });
    }
  });

router.post("/reset-password",
  async (req, res) => {
    try {
      const {
        email,
        otp,
        new_password
      } = req.body;
      const record = otpStore.get(email);

      if (!record) {
        return res.status(400).json({
          success: false,
          message: "No OTP request found"
        });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP expired"
        });
      }

      if (record.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP"
        });
      }

      if (!new_password) {
        return res.status(400).json({
          success: false,
          message: "New password is required"
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);

      await pool.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, email]
      );

      otpStore.delete(email);

      res.json({
        success: true,
        message: "Password reset successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to reset password",
        error: error.message
      });
    }
  });

module.exports = router;
