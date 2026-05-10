(function () {
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
    const pathname = window.location.pathname || "/";

    if (pathname === "/index.html") return "/";
    if (pathname.length > 1 && pathname.endsWith("/")) {
      return pathname.slice(0, -1);
    }

    return pathname;
  }

  function getPublicNav() {
    if (typeof UI_CONFIG === "undefined") {
      console.error("UI_CONFIG is missing");
      return [];
    }

    const flags = UI_CONFIG.flags || {};

    return (UI_CONFIG.publicNav || [])
      .filter(item => item && item.enabled)
      .filter(item => flags.enableRegister || item.href !== "/signup.html")
      .filter(item => flags.enablePostJob || item.href !== "/post-job.html");
  }

  function renderNavLinks(navItems, currentPath) {
    return navItems.map(item => {
      const isActive = item.href === currentPath;

      return `
        <a
          href="${escapeHTML(item.href)}"
          class="${isActive ? "active" : ""}"
          ${isActive ? 'aria-current="page"' : ""}
        >
          ${escapeHTML(item.label)}
        </a>
      `;
    }).join("");
  }

  function renderPublicNav(containerSelector = "#navbar") {
    const container = document.querySelector(containerSelector);

    if (!container) {
      console.error("Navbar container not found:", containerSelector);
      return;
    }

    if (typeof UI_CONFIG === "undefined") {
      console.error("UI_CONFIG is missing");
      return;
    }

    const branding = UI_CONFIG.branding || {};
    const navItems = getPublicNav();
    const currentPath = getCurrentPath();

    container.innerHTML = `
      <header class="topbar">
        <div class="topbar-inner">
          <div class="logo-area">
            <a href="/" class="logo-link">
              <img
                src="${escapeHTML(branding.logoPath || "/assets/logo.Jobscoutphoto.jpg")}"
                alt="${escapeHTML(branding.appName || "Job Scout Pro")} Logo"
                class="logo"
              />
            </a>

            <div class="brand-text">
              <h1>${escapeHTML(branding.appName || "Job Scout Pro")}</h1>
              <p>${escapeHTML(branding.publicTagline || "Find jobs. Grow faster. Hire smarter.")}</p>
            </div>
          </div>

          <nav class="nav-links" aria-label="Main Navigation">
            ${renderNavLinks(navItems, currentPath)}
          </nav>
        </div>
      </header>
    `;
  }

  window.renderPublicNav = renderPublicNav;

  document.addEventListener("DOMContentLoaded", function () {
    renderPublicNav("#navbar");
  });
})();