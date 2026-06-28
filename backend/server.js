const db = require("./db");

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
    conn.release();
  } catch (err) {
    console.error("❌ DATABASE CONNECTION FAILED:", err.message);
  }
})();

require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(express.static(path.join(__dirname, "../frontend")));
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(apiLimiter);

// Routes
const authRoutes = require("./routes/auth");
const jobsRoutes = require("./routes/jobs");
const paymentsRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");
const applicationsRoutes = require("./routes/applications");
const employerRoutes = require("./routes/employer");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/employer", employerRoutes);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Root check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Job Scout Pro API running"
  });
});

// Health check - NOW TESTS DATABASE
app.get("/health", async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as test, NOW() as time');
    res.json({
      success: true,
      status: "healthy",
      db: "connected",
      server_time: rows[0].time
    });
  } catch (err) {
    res.json({
      success: false,
      status: "unhealthy",
      db: "disconnected",
      error: err.code,
      message: err.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
// trigger deploy
