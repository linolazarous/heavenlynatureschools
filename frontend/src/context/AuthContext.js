import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const AuthProvider = ({ children }) => {
  // undefined = still checking, null = not authenticated, object = authenticated user
  const [user, setUser] = useState(undefined);

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      setUser(data);
    } catch {
      // /api/auth/me returning non-200 means no active session — set to null (unauthenticated)
      setUser(null);
    }
    // apiFetch is module-level stable; setUser is a stable React state setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Logout errors are non-critical; session is cleared locally regardless.
      // Log only in development so failures are visible during debugging
      // without leaking internals to production users.
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Logout request failed (clearing local session anyway):', error);
      }
    }
    setUser(null);
  };

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({ user, login, logout, isLoading: user === undefined }),
    // login and logout are defined in the provider scope; re-created on user change is acceptable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
