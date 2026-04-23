const pool = require("../db");

async function fraudCheck(req, res, next) {
  try {
    const user = req.user || {};
    const ip = req.ip;
    const action = req.path;
    let risk = 0;

    if ((user.failed_logins || 0) > 5) risk += 30;
    if ((user.posts_today || 0) > 10) risk += 40;
    if (ip === "suspicious_ip") risk += 50;

    if (user.id) {
      await pool.query("INSERT INTO fraud_events (user_id, event_type, risk_score) VALUES (?, ?, ?)", [user.id, action, risk]);
      if (risk > 80) {
        await pool.query("UPDATE users SET status = ? WHERE id = ?", ["blocked", user.id]);
      }
    }

    if (risk > 70) {
      return res.status(403).json({ error: "Blocked due to suspicious activity" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = fraudCheck;
