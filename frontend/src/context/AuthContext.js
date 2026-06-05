// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const BASE_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureschools.com';

// ─────────────────────────────────────────────
// 🔧 TOKEN HELPERS
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
  localStorage.removeItem('admin_info');
};

// 🔄 Refresh token function
let refreshPromise = null;

export const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return false;

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

// 🔐 Main API function
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

  // ✅ Initialize user from localStorage
  const checkAuth = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        // Check localStorage for user info even without token (for public pages)
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Decode JWT payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        
        if (Date.now() >= exp) {
          console.warn('Token expired');
          clearTokens();
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const userData = {
          id: payload.sub || payload.id,
          email: payload.email,
          role: payload.role || 'user',
          name: payload.name || payload.email?.split('@')[0],
          full_name: payload.name || payload.email?.split('@')[0],
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (decodeError) {
        console.error('Token decode failed:', decodeError);
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
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

      setTokens(data.access_token, data.refresh_token);

      const userData = {
        email: data.user?.email || email,
        role: data.user?.role || 'admin',
        name: data.user?.name || email.split('@')[0],
        full_name: data.user?.name || email.split('@')[0],
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // 🔓 LOGOUT
  const logout = useCallback(async () => {
    try {
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
  }, []);

  // ✅ Update user profile
  const updateUser = useCallback((updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
      isLoading,
      isAuthenticated,
      apiFetch,
      getAccessToken,
      refreshToken,
    }),
    [user, isLoading, isAuthenticated, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─────────────────────────────────────────────
// 🎣 CUSTOM HOOKS
// ─────────────────────────────────────────────

// ✅ SAFE useAuth - returns null instead of throwing error
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return default guest state if used outside AuthProvider
  if (!context) {
    console.warn('useAuth used outside AuthProvider - returning guest user');
    return {
      user: null,
      login: () => Promise.reject(new Error('Auth not available')),
      logout: () => {},
      updateUser: () => {},
      isLoading: false,
      isAuthenticated: false,
      apiFetch: async (path, options) => {
        const res = await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
          },
        });
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      },
      getAccessToken: () => null,
      refreshToken: () => Promise.resolve(false),
    };
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
  return user?.role === 'admin' || user?.role === 'super_admin';
};

export default AuthContext;
