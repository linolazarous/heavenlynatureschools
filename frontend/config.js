// frontend/src/config.js
// Use Vite's import.meta.env (recommended) with fallback for CRA/old builds
export const API_BASE =
  import.meta.env.VITE_API_URL ||           // Vite (set in .env or Netlify env vars)
  process.env.REACT_APP_API_URL ||          // CRA fallback (if still used temporarily)
  "https://heavenlynatureschools-qpvf.onrender.com/api";

// Optional: export other constants
export const APP_NAME = "Heavenly Nature Schools";
export const IS_DEV = import.meta.env.DEV || process.env.NODE_ENV !== "production";
