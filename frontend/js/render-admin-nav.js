(function () {
console.log("ADMIN NAV SCRIPT LOADED");
  "use strict";

  function escapeHTML(str = "") {
    return String(str).replace(/[&<>"']/g, match => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[match]);
  }

  function getCurrentPath() {
    let pathname = window.location.pathname || "";

    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    return pathname;
  }

  function getAdminNav() {
    if (!window.UI_CONFIG || !Array.isArray(window.UI_CONFIG.adminNav)) {
      console.warn("Admin nav missing or UI_CONFIG not ready");
      return [];
    }

    return window.UI_CONFIG.adminNav.filter(item => item && item.enabled);
  }

  function renderNavLinks(navItems, currentPath) {
    return navItems.map(item => {
      const isActive = item.href === currentPath;

      return `
        <a href="${escapeHTML(item.href)}"
           class="${isActive ? "active" : ""}"
           ${isActive ? 'aria-current="page"' : ""}>
          ${escapeHTML(item.label)}
        </a>
      `;
    }).join("");
  }

  function renderAdminNav(containerSelector = "#admin-navbar") {
    const container = document.querySelector(containerSelector);

    if (!container) {
      console.error("Admin navbar container not found:", containerSelector);
      return;
    }

    const branding = (window.UI_CONFIG && window.UI_CONFIG.branding) || {};
    const navItems = getAdminNav();
    const currentPath = getCurrentPath();

    container.innerHTML = `
      <header class="topbar">
        <div class="topbar-inner">
          <div class="logo-area">
            <a href="/admin/dashboard.html" class="logo-link">
              <img
                src="${escapeHTML(branding.logoPath || "/assets/logo.Jobscoutphoto.jpg")}"
                alt="${escapeHTML(branding.appName || "Job Scout Pro")}"
                class="logo"
              />
            </a>

            <div class="brand-text">
              <h1>${escapeHTML(branding.appName || "Job Scout Pro")}</h1>
              <p>${escapeHTML(branding.adminTagline || "Admin Control Panel")}</p>
            </div>
          </div>

          <nav class="nav-links" aria-label="Admin Navigation">
            ${renderNavLinks(navItems, currentPath)}
          </nav>
        </div>
      </header>
    `;
  }

  window.renderAdminNav = renderAdminNav;

  function initAdminNav() {
    renderAdminNav("#admin-navbar");
  }

  if (true) {
    document.addEventListener("DOMContentLoaded", initAdminNav);
  } else {
    initAdminNav();
  }

})();
