const pool = require("../db");

async function writeAuditLog({
  adminId = null,
  adminEmail = null,
  actionType,
  targetType,
  targetId = null,
  details = null
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_email, action_type, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, adminEmail, actionType, targetType, targetId, details]
    );
  } catch (error) {
    console.error("Failed to write audit log:", error.message);
  }
}

module.exports = writeAuditLog;
