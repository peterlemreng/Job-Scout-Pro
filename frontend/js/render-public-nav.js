function renderPublicNav(containerSelector = "#navbar") {
  const container = document.querySelector(containerSelector);
  if (!container || typeof UI_CONFIG === "undefined") return;

  const navItems = UI_CONFIG.publicNav
    .filter(item => item.enabled)
    .filter(item => UI_CONFIG.flags.enableRegister || item.href !== "signup.html")
    .filter(item => UI_CONFIG.flags.enablePostJob || item.href !== "post-job.html");

  container.innerHTML = `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="logo-area">
          <img src="assets/logo.Jobscoutphoto.jpg" alt="${UI_CONFIG.branding.appName} Logo" class="logo" />
          <div>
            <h1>${UI_CONFIG.branding.appName}</h1>
            <p>${UI_CONFIG.branding.publicTagline}</p>
          </div>
        </div>

        <nav class="nav-links">
          ${navItems.map(item => `<a href="${item.href}">${item.label}</a>`).join("")}
        </nav>
      </div>
    </header>
  `;
}
