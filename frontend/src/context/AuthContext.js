// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const BASE_URL = process.env.REACT_APP_API_URL || 'https://heavenlynatureschools-l9e8.onrender.com';

// ─────────────────────────────────────────────
// 🔧 TOKEN HELPERS (Synchronized with api.js)
// ─────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const setTokens = (access, refresh) => {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// 🔄 Refresh token function
let refreshPromise = null;

export const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  // Prevent multiple concurrent refresh requests
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });

      const data = await res.json();

      if (data.access_token) {
        setTokens(data.access_token, null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// 🔐 Main API function (syncs with api.js)
async function apiFetch(path, options = {}) {
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

  // 🔄 Auto refresh if expired
  if (res.status === 401) {
    const refreshed = await refreshToken();

    if (refreshed) {
      token = getAccessToken();
      res = await makeRequest(token);
    } else {
      clearTokens();
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
// 🔐 AUTH PROVIDER
// ─────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Initialize user from token
  const checkAuth = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Decode JWT payload (basic client-side check)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        const exp = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= exp) {
          console.warn('Token expired');
          clearTokens();
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        setUser({
          id: payload.sub || payload.id,
          email: payload.email,
          role: payload.role || 'admin',
          name: payload.name,
        });
        setIsAuthenticated(true);
      } catch (decodeError) {
        console.error('Token decode failed:', decodeError);
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🔐 LOGIN
  const login = useCallback(async (email, password) => {
    try {
      // Use the existing login endpoint
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      // Store tokens
      setTokens(data.access_token, data.refresh_token);

      // Store user info
      const userData = {
        email: data.email || email,
        role: data.role || 'admin',
        name: data.name || email.split('@')[0],
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user state
      setUser(userData);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []); // No dependencies needed as it only uses BASE_URL which is constant

  // 🔓 LOGOUT
  const logout = useCallback(async () => {
    try {
      // Optional: Call logout endpoint if exists
      const token = getAccessToken();
      if (token) {
        try {
          await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.warn('Logout endpoint failed:', err);
        }
      }
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/admin/login';
    }
  }, []); // No dependencies needed

  // ✅ Update user profile (if needed)
  const updateUser = useCallback((updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []); // No dependencies needed

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
      isLoading,
      isAuthenticated,
      apiFetch, // 🔥 expose for global use
      getAccessToken,
      refreshToken,
    }),
    [user, isLoading, isAuthenticated, login, logout, updateUser] // Added missing dependencies
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─────────────────────────────────────────────
// 🎣 CUSTOM HOOKS
// ─────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Role-based access hook
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};

// ✅ Admin check hook
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

export default AuthContext;
