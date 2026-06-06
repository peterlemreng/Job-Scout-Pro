require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(apiLimiter);

// Routes
const authRoutes = require("./routes/auth");
const jobsRoutes = require("./routes/jobs");
const paymentsRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");
const applicationsRoutes = require("./routes/applications");
const employerRoutes = require("./routes/employer");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health checks
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Scout Pro API root OK"
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Job Scout Pro API is running",
    env: {
      hasUsername: !!process.env.AFRICASTALKING_USERNAME,
      hasApiKey: !!process.env.AFRICASTALKING_API_KEY
    }
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/employer", employerRoutes);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("AFRICASTALKING_USERNAME:", !!process.env.AFRICASTALKING_USERNAME);
  console.log("AFRICASTALKING_API_KEY:", !!process.env.AFRICASTALKING_API_KEY);
});
