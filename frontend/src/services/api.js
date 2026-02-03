// frontend/src/services/api.js
import axios from "axios";

// Determine base URL: prioritize env var, fallback to production Render URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||          // Vite (recommended 2026)
  process.env.REACT_APP_API_URL ||         // CRA fallback
  "https://heavenlynatureschools-qpvf.onrender.com/api";  // your actual backend

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,  // optional: prevent hanging requests (30s)
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional: only log in development
    if (import.meta.env.DEV || process.env.NODE_ENV === "development") {
      console.log(
        `[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`,
        // Avoid logging full body if sensitive (e.g. passwords)
        config.data && !config.url.includes("/login") ? config.data : "[hidden]"
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
api.interceptors.response.use(
  (response) => {
    // Optional dev logging
    if (import.meta.env.DEV || process.env.NODE_ENV === "development") {
      console.log(
        `[API RESPONSE] ${response.config.url}`,
        response.status,
        response.data
      );
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.error("[API ERROR]", status, data);

      // Handle 401 Unauthorized → clear token & redirect (admin-specific)
      if (status === 401) {
        localStorage.removeItem("access_token");
        // If using react-router v6+, prefer: navigate("/admin/login")
        // For now, window.location is simple and works
        window.location.href = "/admin/login";
      }

      // Optional: handle other common statuses
      if (status === 403) {
        // Forbidden – maybe show "Access denied" toast
      }
      if (status >= 500) {
        // Server error – notify user "Something went wrong, try later"
      }
    } else if (error.request) {
      console.error("[API NETWORK ERROR]", error.message);
      // e.g., no internet, timeout → show offline toast
    } else {
      console.error("[API SETUP ERROR]", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
