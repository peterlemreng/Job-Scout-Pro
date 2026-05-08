from pathlib import Path

p = Path("frontend/admin/jobs.html")
s = p.read_text()

old = """      function getActionButtons(job) {
        const postStatus = String(job.post_status || "").toLowerCase();
        const paymentStatus = String(job.payment_status || "").toLowerCase();

        if (postStatus === "pending_review" && paymentStatus === "paid") {
          return `
            <button class="action-btn action-approve" onclick="approveJob('${job.id || ""}')">Approve</button>
            <button class="action-btn action-reject" onclick="rejectJob('${job.id || ""}')">Reject</button>
          `;
        }

        if (postStatus === "published" && paymentStatus === "paid") {
          return `<button class="action-btn action-unpublish" onclick="unpublishJob('${job.id || ""}')">Unpublish</button>`;
        }

        if (["draft", "rejected"].includes(postStatus) || ["pending", "failed", "rejected"].includes(paymentStatus)) {
          return `<button class="action-btn action-delete" onclick="deleteJob('${job.id || ""}')">Delete</button>`;
        }

        return "";
      }"""

new = """      function getActionButtons(job) {
        const postStatus = String(job.post_status || "").toLowerCase();
        const paymentStatus = String(job.payment_status || "").toLowerCase();
        const moderationStatus = String(job.moderation_status || "").toLowerCase();
        const visibilityStatus = String(job.visibility_status || "").toLowerCase();

        if ((moderationStatus === "pending_review" || postStatus === "pending_review") && paymentStatus === "paid") {
          return `
            <button class="action-btn action-approve" onclick="approveJob('${job.id || ""}')">Approve</button>
            <button class="action-btn action-reject" onclick="rejectJob('${job.id || ""}')">Reject</button>
          `;
        }

        if ((visibilityStatus === "published" || postStatus === "published") && paymentStatus === "paid") {
          return `<button class="action-btn action-unpublish" onclick="unpublishJob('${job.id || ""}')">Unpublish</button>`;
        }

        if (["draft", "archived", "rejected", "expired"].includes(visibilityStatus) || ["draft", "rejected", "archived", "expired"].includes(postStatus) || ["pending", "failed", "rejected"].includes(paymentStatus)) {
          return `<button class="action-btn action-delete" onclick="deleteJob('${job.id || ""}')">Delete</button>`;
        }

        return "";
      }"""

if old not in s:
    print("TARGET NOT FOUND")
else:
    p.write_text(s.replace(old, new, 1))
    print("UPDATED")
