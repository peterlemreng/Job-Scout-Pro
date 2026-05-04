const pool = require("../db");
const requireAuth = require("./requireAuth");

async function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const userEmail = req.user?.email;

      if (!userEmail) {
        return res.status(401).json({
          success: false,
          message: "Admin authentication required"
        });
      }

      const [rows] = await pool.query(
        "SELECT id, email, role FROM users WHERE email = ? LIMIT 1",
        [userEmail]
      );

      if (rows.length === 0 || rows[0].role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access denied"
        });
      }

      req.adminUser = rows[0];
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify admin access",
        error: error.message
      });
    }
  });
}

module.exports = requireAdmin;
