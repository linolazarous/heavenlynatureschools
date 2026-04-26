// frontend/src/utils/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'https://heavenlynatureschools-l9e8.onrender.com';

// ─────────────────────────────────────────────
// 🔐 TOKEN HELPERS
// ─────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const setAccessToken = (token) => {
  localStorage.setItem('access_token', token);
};

const setRefreshToken = (token) => {
  if (token) localStorage.setItem('refresh_token', token);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ─────────────────────────────────────────────
// 🔄 REFRESH TOKEN
// ─────────────────────────────────────────────
let refreshPromise = null; // Prevent multiple refresh calls

async function refreshToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return false;

  // If already refreshing, wait for that promise
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
    } catch (err) {
      console.error('Refresh token failed:', err);
    } finally {
      refreshPromise = null;
    }
    return false;
  })();

  return refreshPromise;
}

// ─────────────────────────────────────────────
// 🌐 MAIN API FETCH
// ─────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  let token = getAccessToken();

  const makeRequest = async (customToken) => {
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(customToken ? { Authorization: `Bearer ${customToken}` } : {}),
        ...(options.headers || {}),
      },
    });
  };

  let res = await makeRequest(token);

  // 🔄 Handle expired token
  if (res.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      token = getAccessToken();
      res = await makeRequest(token);
    } else {
      clearTokens();
      // Redirect to login page
      window.location.href = '/admin/login';
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
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
  login: (email, password) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then(data => {
    if (data.access_token) {
      setAccessToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
    }
    return data;
  }),
  
  logout: () => {
    clearTokens();
    window.location.href = '/admin/login';
  },
  
  // Contacts
  getContacts: () => apiFetch('/api/admin/contacts'),
  getContact: (id) => apiFetch(`/api/admin/contacts/${id}`),
  
  // Add these to your adminApi object
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
// 📤 FILE UPLOAD HELPER (if needed)
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
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }

  return res.json();
}

export default BASE_URL;
