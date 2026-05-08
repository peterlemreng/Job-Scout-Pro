const UI_CONFIG = {
  branding: {
    appName: "Job Scout Pro",
    publicTagline: "Find jobs. Grow faster. Hire smarter.",
    adminTagline: "Admin Control Panel"
  },

  publicNav: [
    { label: "Home", href: "index.html", enabled: true },
    { label: "Jobs", href: "jobs.html", enabled: true },
    { label: "About", href: "about.html", enabled: true },
    { label: "Contact", href: "contact.html", enabled: true },
    { label: "Post Job", href: "post-job.html", enabled: true },
    { label: "Login", href: "login.html", enabled: true },
    { label: "Register", href: "signup.html", enabled: true }
  ],

  adminNav: [
    { label: "Dashboard", href: "dashboard.html", enabled: true },
    { label: "Jobs", href: "jobs.html", enabled: true },
    { label: "Payments", href: "payments.html", enabled: true },
    { label: "Applications", href: "applications.html", enabled: true },
    { label: "Audit Logs", href: "audit-logs.html", enabled: true },
    { label: "Employer Verification", href: "employer-verifications.html", enabled: true },
    { label: "Logout", href: "../logout.html", enabled: true }
  ],

  flags: {
    showHelpPage: false,
    enableSMS: false,
    enableOTP: false,
    enableEmployerDashboard: true,
    enableRegister: true,
    enablePostJob: true
  },

  dashboard: {
    showStats: true,
    showRecentPayments: true,
    showRecentApplications: true,
    showRecentJobs: true,
    showVerificationCards: true
  }
};
