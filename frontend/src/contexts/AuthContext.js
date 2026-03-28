import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { formatApiError } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem('discuss_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('discuss_token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) localStorage.setItem('discuss_token', data.token);
      setUser(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e.response?.data?.detail) };
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      if (data.token) localStorage.setItem('discuss_token', data.token);
      setUser(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e.response?.data?.detail) };
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('discuss_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
