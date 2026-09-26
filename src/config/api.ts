// ─── API Configuration ────────────────────────────────────────
// After deploying your Google Apps Script Web App, paste the URL below.
// See google-apps-script/README.md for setup instructions.

export const API_CONFIG = {
  // STEP: Replace this with your Apps Script Web App URL after deployment
  APPS_SCRIPT_URL: import.meta.env.VITE_APPS_SCRIPT_URL || '',

  // Set to true once your Apps Script is deployed and tested
  BACKEND_ENABLED: import.meta.env.VITE_BACKEND_ENABLED === 'true' || false,
};

export const isBackendEnabled = (): boolean => {
  return API_CONFIG.BACKEND_ENABLED && API_CONFIG.APPS_SCRIPT_URL.length > 0;
};
