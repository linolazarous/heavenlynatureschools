import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const BASE_URL = process.env.REACT_APP_API_URL;

// ─────────────────────────────────────────────
// 🔧 API HELPER (JWT VERSION)
// ─────────────────────────────────────────────
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// 🔄 Refresh token function
const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      return true;
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
  }

  return false;
};

// 🔐 Main API function
async function apiFetch(path, options = {}) {
  let token = getAccessToken();

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // 🔄 Auto refresh if expired
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

// ─────────────────────────────────────────────
// 🔐 AUTH PROVIDER
// ─────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Initialize user from token
  const checkAuth = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }

      // decode payload (basic client-side check)
      const payload = JSON.parse(atob(token.split('.')[1]));

      setUser({
        email: payload.email,
        role: payload.role,
      });
    } catch (err) {
      console.error('Auth check failed:', err);
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🔐 LOGIN
  const login = async (email, password) => {
    const data = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(res => res.json());

    if (!data.access_token) {
      throw new Error('Login failed');
    }

    setTokens(data.access_token, data.refresh_token);

    setUser(data.user);
    return data;
  };

  // 🔓 LOGOUT
  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
      apiFetch, // 🔥 expose for global use
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
