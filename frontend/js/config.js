(function () {
  "use strict";

  const CONFIG = {
    API_BASE: window.location.hostname.includes("localhost")
      ? "https://job-scout-pro-backend.onrender.com/api"
      : "https://job-scout-pro-backend.onrender.com/api"
  };

  window.APP_CONFIG = CONFIG;
})();
