from pathlib import Path

p = Path("frontend/admin/dashboard.html")
s = p.read_text()

old = """          <td>${(String(job.post_status || "").toLowerCase() === "pending_review" && String(job.payment_status || "").toLowerCase() === "paid") ? `<button class="action-btn action-complete" onclick="approveJob('${job.id || ""}')">Approve</button> <button class="action-btn action-fail" onclick="rejectJob('${job.id || ""}')">Reject</button>` : (["draft", "rejected"].includes(String(job.post_status || "").toLowerCase()) || ["pending", "failed", "rejected"].includes(String(job.payment_status || "").toLowerCase())) ? `<button class="action-btn action-delete" onclick="deleteJob('${job.id || ""}')">Delete</button>` : (String(job.post_status || "").toLowerCase() === "published" && String(job.payment_status || "").toLowerCase() === "paid") ? `<button class="action-btn action-unpublish" onclick="unpublishJob('${job.id || ""}')">Unpublish</button>` : ""}</td>"""

new = """          <td>${((String(job.moderation_status || "").toLowerCase() === "pending_review" || String(job.post_status || "").toLowerCase() === "pending_review") && String(job.payment_status || "").toLowerCase() === "paid") ? `<button class="action-btn action-complete" onclick="approveJob('${job.id || ""}')">Approve</button> <button class="action-btn action-fail" onclick="rejectJob('${job.id || ""}')">Reject</button>` : ((String(job.visibility_status || "").toLowerCase() === "published" || String(job.post_status || "").toLowerCase() === "published") && String(job.payment_status || "").toLowerCase() === "paid") ? `<button class="action-btn action-unpublish" onclick="unpublishJob('${job.id || ""}')">Unpublish</button>` : (["draft", "archived", "rejected", "expired"].includes(String(job.visibility_status || "").toLowerCase()) || ["draft", "rejected", "archived", "expired"].includes(String(job.post_status || "").toLowerCase()) || ["pending", "failed", "rejected"].includes(String(job.payment_status || "").toLowerCase())) ? `<button class="action-btn action-delete" onclick="deleteJob('${job.id || ""}')">Delete</button>` : ""}</td>"""

if old not in s:
    print("TARGET NOT FOUND")
else:
    p.write_text(s.replace(old, new, 1))
    print("UPDATED")
