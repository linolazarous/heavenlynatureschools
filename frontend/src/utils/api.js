const BASE_URL = process.env.REACT_APP_API_URL;

// ─────────────────────────────────────────────
// 🔐 TOKEN HELPERS
// ─────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const setAccessToken = (token) => {
  localStorage.setItem('access_token', token);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ─────────────────────────────────────────────
// 🔄 REFRESH TOKEN
// ─────────────────────────────────────────────
async function refreshToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return false;

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
  }

  return false;
}

// ─────────────────────────────────────────────
// 🌐 MAIN API FETCH
// ─────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  let token = getAccessToken();

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // 🔄 Handle expired token
  if (res.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      token = getAccessToken();

      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
    } else {
      clearTokens();
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }

  return res.json();
}

export default BASE_URL;
