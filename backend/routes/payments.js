const express = require("express");
const router = express.Router();
router.post("/submit", async (req, res) => {
  res.json({ success: true, message: "payment route ready" });
});
module.exports = router;
