import axios from "axios";

// Base API URL (Render backend)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://assesslyplatform-pfm1.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(
  (config) => {
    // Add JWT token if exists (for admin protected routes)
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`,
      config.data || ""
    );

    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API RESPONSE] ${response.config.url}`,
      response.status,
      response.data || ""
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        "[API RESPONSE ERROR]",
        error.response.status,
        error.response.data
      );

      // Auto logout & redirect on 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/admin/login";
      }
    } else {
      console.error("[API NETWORK ERROR]", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
