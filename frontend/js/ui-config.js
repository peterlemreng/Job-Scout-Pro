window.APP_CONFIG = {
  API_BASE: "/api"
};
(function () {
  "use strict";

  const UI_CONFIG = {

    adminNav: [
      {
        label: "Dashboard",
        enabled: true,
        href: "/admin/dashboard.html"
      },
      {
        label: "Jobs",
        enabled: true,
        href: "/admin/jobs.html"
      },
      {
        label: "Payments",
        enabled: true,
        href: "/admin/payments.html"
      },
      {
        label: "Applications",
        enabled: true,
        href: "/admin/applications.html"
      },
      {
        label: "Audit Logs",
        enabled: true,
        href: "/admin/audit-logs.html"
      },
      {
        label: "Employer Verification",
        enabled: true,
        href: "/admin/employer-verifications.html"
      }
    ]

  };

  window.UI_CONFIG = UI_CONFIG;
})();
