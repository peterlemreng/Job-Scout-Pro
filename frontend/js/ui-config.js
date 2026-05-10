const UI_CONFIG = {
  branding: {
    appName: "Job Scout Pro",
    publicTagline: "Find jobs. Grow faster. Hire smarter.",
    adminTagline: "Admin Control Panel",
    logoPath: "/assets/logo.Jobscoutphoto.jpg"
  },

  flags: {
    enableRegister: true,
    enablePostJob: true,
    enableAdminPanel: true
  },

  publicNav: [
    { label: "Home", href: "/", enabled: true },
    { label: "Jobs", href: "/jobs.html", enabled: true },
    { label: "About", href: "/about.html", enabled: true },
    { label: "Contact", href: "/contact.html", enabled: true },
    { label: "Post Job", href: "/post-job.html", enabled: true },
    { label: "Login", href: "/login.html", enabled: true },
    { label: "Register", href: "/signup.html", enabled: true }
  ],

  adminNav: [
    { label: "Dashboard", href: "/admin/dashboard.html", enabled: true },
    { label: "Jobs", href: "/admin/jobs.html", enabled: true },
    { label: "Payments", href: "/admin/payments.html", enabled: true },
    { label: "Applications", href: "/admin/applications.html", enabled: true },
    { label: "Audit Logs", href: "/admin/audit-logs.html", enabled: true },
    { label: "Employer Verification", href: "/admin/employer-verifications.html", enabled: true }
  ]
};