require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const jobsRoutes = require("./routes/jobs");
const paymentsRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");
const applicationsRoutes = require("./routes/applications");
const employerRoutes = require("./routes/employer");

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employer", employerRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
