function renderAdminNav(containerSelector = "#navbar") {
  const container = document.querySelector(containerSelector);
  if (!container || typeof UI_CONFIG === "undefined") return;

  const navItems = UI_CONFIG.adminNav.filter(item => item.enabled);

  container.innerHTML = `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="logo-area">
          <img src="../assets/logo.Jobscoutphoto.jpg" alt="${UI_CONFIG.branding.appName} Logo" class="logo" />
          <div>
            <h1>${UI_CONFIG.branding.appName}</h1>
            <p>${UI_CONFIG.branding.adminTagline}</p>
          </div>
        </div>

        <nav class="nav-links">
          ${navItems.map(item => `<a href="${item.href}">${item.label}</a>`).join("")}
        </nav>
      </div>
    </header>
  `;
}
