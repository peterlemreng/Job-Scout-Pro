const express = require("express");
const router = express.Router();
router.get("/stats", async (req, res) => {
  res.json({ success: true, totalJobs: 0, totalUsers: 0, pendingPayments: 0, featuredJobs: 0 });
});
module.exports = router;
