const jobsContainer = document.getElementById("jobsContainer");
const statJobs = document.getElementById("statJobs");
const statUsers = document.getElementById("statUsers");
const statFeatured = document.getElementById("statFeatured");async function loadJobs() {
  try {
    const response = await fetch(${API_BASE}/jobs);
    const jobs = await response.json();    if (!Array.isArray(jobs) || jobs.length === 0) {
      jobsContainer.innerHTML = <div class="job-card">No jobs available yet.</div>;
      statJobs.textContent = "0";
      return;
    }    statJobs.textContent = jobs.length;
    const featuredCount = jobs.filter(job => Number(job.is_featured) === 1).length;
    statFeatured.textContent = featuredCount;    jobsContainer.innerHTML = jobs.map(job => 
      <div class="job-card">
        <h3>${job.title || "Untitled Job"}</h3>
        <p><strong>Company:</strong> ${job.company || "N/A"}</p>
        <p><strong>Location:</strong> ${job.location || "N/A"}</p>
        <p><strong>Category:</strong> ${job.category || "General"}</p>
        <p><strong>Type:</strong> ${job.job_type || "N/A"}</p>
        <p>${job.description ? job.description.slice(0, 120) + "..." : "No description available."}</p>
        <a href="job-detail.html?id=${job.id || ""}" class="btn btn-primary">View Details</a>
      </div>
    ).join("");
  } catch (error) {
    jobsContainer.innerHTML = <div class="job-card">Failed to load jobs.</div>;
    console.error("Error loading jobs:", error);
  }
}async function loadStats() {
  try {
    const response = await fetch(${API_BASE}/admin/stats);
    const data = await response.json();    if (data && data.success) {
      statUsers.textContent = data.totalUsers ?? 0;
      statFeatured.textContent = data.featuredJobs ?? 0;
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}document.addEventListener("DOMContentLoaded", () => {
  loadJobs();
  loadStats();
});

