from pathlib import Path

p = Path("backend/routes/jobs.js")
s = p.read_text()

old = """const writeAuditLog = require("../utils/auditLog");
"""
new = """const writeAuditLog = require("../utils/auditLog");

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

if old not in s:
    print("TARGET NOT FOUND")
else:
    p.write_text(s.replace(old, new, 1))
    print("UPDATED")
