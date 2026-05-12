#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "Running repo checks..."

node --check backend/routes/auth.js
node --check frontend/js/config.js
node --check frontend/js/ui-config.js
node --check frontend/js/render-public-nav.js
node --check frontend/js/render-admin-nav.js

if grep -Rni 'https://job-scout-pro-production.up.railway.app/api' frontend >/dev/null 2>&1; then
  echo "Error: found hardcoded production API URL in frontend"
  exit 1
fi

echo "All checks passed."
