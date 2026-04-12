const express = require("express");
const router = express.Router();

router.post("/login", async (req, res) => {
  res.json({ success: true, message: "login route ready" });
});

 module.exports = router;
