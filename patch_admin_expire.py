from pathlib import Path

p = Path("backend/routes/admin.js")
s = p.read_text()

helper = """
const requireAdmin = require("../middleware/requireAdmin");

async function expirePublishedJobs() {
  await pool.query(`
    UPDATE jobs
    SET
      post_status = 'expired',
      visibility_status = 'expired',
      updated_at = NOW()
    WHERE deleted_at IS NULL
      AND payment_status = 'paid'
      AND (visibility_status = 'published' OR post_status = 'published')
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
  `);
}
"""

s = s.replace('const requireAdmin = require("../middleware/requireAdmin");
', helper, 1)
s = s.replace('router.get("/jobs", requireAdmin, async (req, res) => {
  try {
', 'router.get("/jobs", requireAdmin, async (req, res) => {
  try {
    await expirePublishedJobs();
', 1)

p.write_text(s)
print("UPDATED")
