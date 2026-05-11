// frontend/js/config.js

(function () {
  "use strict";

  const CONFIG = {
    API_BASE: window.location.hostname.includes("localhost")
      ? "http://localhost:5000/api"
      : "/api"
  };

  window.APP_CONFIG = CONFIG;
})();
