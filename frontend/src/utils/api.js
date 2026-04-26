// frontend/src/utils/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'https://heavenlynatureschools-l9e8.onrender.com';

// ─────────────────────────────────────────────
// 🔐 TOKEN HELPERS
// ─────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const setAccessToken = (token) => {
  if (token) localStorage.setItem('access_token', token);
};

const setRefreshToken = (token) => {
  if (token) localStorage.setItem('refresh_token', token);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// ─────────────────────────────────────────────
// 🔄 REFRESH TOKEN
// ─────────────────────────────────────────────
let refreshPromise = null;

async function refreshTokenFunction() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });

      const data = await res.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Refresh token failed:', err);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─────────────────────────────────────────────
// 🌐 MAIN API FETCH
// ─────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  let token = getAccessToken();

  const makeRequest = async (customToken) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    
    if (customToken) {
      headers.Authorization = `Bearer ${customToken}`;
    }

    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  };

  let res = await makeRequest(token);

  // 🔄 Handle expired token (401 Unauthorized)
  if (res.status === 401) {
    const refreshed = await refreshTokenFunction();

    if (refreshed) {
      token = getAccessToken();
      res = await makeRequest(token);
    } else {
      clearTokens();
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
      throw new Error('Session expired. Please login again.');
    }
  }

  // Handle other error responses
  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || `Request failed with status ${res.status}`;
    } catch {
      errorMessage = `Request failed with status ${res.status}`;
    }
    throw new Error(errorMessage);
  }

  // Return empty object for 204 No Content responses
  if (res.status === 204) {
    return {};
  }

  return res.json();
}

// ─────────────────────────────────────────────
// 📡 SPECIFIC API CALLS
// ─────────────────────────────────────────────

// 🔓 Public endpoints
export const publicApi = {
  // Blog
  getBlogs: () => apiFetch('/api/blog'),
  getBlog: (id) => apiFetch(`/api/blog/${id}`),
  
  // Events
  getEvents: () => apiFetch('/api/events'),
  getEvent: (id) => apiFetch(`/api/events/${id}`),
  
  // Contact
  submitContact: (data) => apiFetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Health
  healthCheck: () => apiFetch('/api/health'),
};

// 🔐 Admin endpoints (require authentication)
export const adminApi = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Login failed');
    }

    if (data.access_token) {
      setAccessToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      
      // Store user info
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
      }
    }
    
    return data;
  },
  
  logout: async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      clearTokens();
      window.location.href = '/admin/login';
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
  
  // Contacts
  getContacts: () => apiFetch('/api/admin/contacts'),
  getContact: (id) => apiFetch(`/api/admin/contacts/${id}`),
  deleteContact: (id) => apiFetch(`/api/admin/contacts/${id}`, {
    method: 'DELETE',
  }),
  toggleContactRead: (id, read) => apiFetch(`/api/admin/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ read }),
  }),
  
  // Blog (Admin)
  createBlog: (blogData) => apiFetch('/api/admin/blog', {
    method: 'POST',
    body: JSON.stringify(blogData),
  }),
  updateBlog: (id, blogData) => apiFetch(`/api/admin/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(blogData),
  }),
  deleteBlog: (id) => apiFetch(`/api/admin/blog/${id}`, {
    method: 'DELETE',
  }),
  
  // Events (Admin)
  createEvent: (eventData) => apiFetch('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  updateEvent: (id, eventData) => apiFetch(`/api/admin/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),
  deleteEvent: (id) => apiFetch(`/api/admin/events/${id}`, {
    method: 'DELETE',
  }),
};

// ─────────────────────────────────────────────
// 📤 FILE UPLOAD HELPER
// ─────────────────────────────────────────────
export async function uploadFile(path, file, fieldName = 'file') {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || 'Upload failed';
    } catch {
      errorMessage = 'Upload failed';
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

// ─────────────────────────────────────────────
// 🔧 UTILITY FUNCTIONS
// ─────────────────────────────────────────────

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;
  
  // Optional: Check token expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch {
    return !!token;
  }
};

// Get auth headers for external use
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─────────────────────────────────────────────
// 📦 EXPORTS
// ─────────────────────────────────────────────
export default BASE_URL;
export { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens };
