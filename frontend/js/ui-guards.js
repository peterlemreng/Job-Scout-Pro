function hideIfFlagOff(selector, flagName) {
  if (typeof UI_CONFIG === "undefined") return;
  if (UI_CONFIG.flags[flagName] !== false) return;

  document.querySelectorAll(selector).forEach(el => {
    el.style.display = "none";
  });
}

function disableIfFlagOff(selector, flagName) {
  if (typeof UI_CONFIG === "undefined") return;
  if (UI_CONFIG.flags[flagName] !== false) return;

  document.querySelectorAll(selector).forEach(el => {
    el.setAttribute("disabled", "disabled");
    el.classList.add("is-disabled");
  });
}

function applyDashboardVisibility() {
  if (typeof UI_CONFIG === "undefined" || !UI_CONFIG.dashboard) return;

  const map = [
    { key: "showStats", selector: ".summary-grid" },
    { key: "showRecentPayments", selector: '[data-section="recent-payments"]' },
    { key: "showRecentApplications", selector: '[data-section="recent-applications"]' },
    { key: "showRecentJobs", selector: '[data-section="recent-jobs"]' },
    { key: "showVerificationCards", selector: '[data-section="verification-cards"]' }
  ];

  map.forEach(item => {
    if (UI_CONFIG.dashboard[item.key] === false) {
      document.querySelectorAll(item.selector).forEach(el => {
        el.style.display = "none";
      });
    }
  });
}
