import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { formatApiError } from '@/lib/api';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncGoogleUser = useCallback(async (firebaseUser) => {
    try {
      const { data } = await api.post('/auth/google', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || '',
        photo_url: firebaseUser.photoURL || '',
      });
      if (data.token) localStorage.setItem('discuss_token', data.token);
      setUser(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiError(e.response?.data?.detail) || 'Failed to sync Google account' };
    }
  }, []);

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
    // Check for Google redirect result first
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await syncGoogleUser(result.user);
        setLoading(false);
        return;
      }
      // Then check JWT token
      const token = localStorage.getItem('discuss_token');
      if (token) {
        await checkAuth();
      } else {
        setLoading(false);
      }
    }).catch(() => {
      const token = localStorage.getItem('discuss_token');
      if (token) {
        checkAuth();
      } else {
        setLoading(false);
      }
    });
  }, [checkAuth, syncGoogleUser]);

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

  const loginWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      // Try popup first
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return await syncGoogleUser(result.user);
      } catch (popupError) {
        const code = popupError.code || '';
        
        // If popup blocked or unauthorized domain, try redirect
        if (code === 'auth/popup-blocked' || code === 'auth/unauthorized-domain') {
          if (code === 'auth/unauthorized-domain') {
            return { 
              success: false, 
              error: `Google sign-in requires this domain to be authorized in Firebase. Please add "${window.location.hostname}" to Firebase Console > Authentication > Settings > Authorized domains.` 
            };
          }
          // Fallback to redirect
          await signInWithRedirect(auth, googleProvider);
          return { success: false, error: '' }; // Will redirect, handle result on reload
        }
        
        if (code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Sign-in popup was closed. Please try again.' };
        }
        if (code === 'auth/cancelled-popup-request') {
          return { success: false, error: '' };
        }
        if (code === 'auth/network-request-failed') {
          return { success: false, error: 'Network error. Please check your connection.' };
        }
        
        throw popupError;
      }
    } catch (e) {
      if (e.response?.data?.detail) {
        return { success: false, error: formatApiError(e.response.data.detail) };
      }
      return { success: false, error: e.message || 'Google sign-in failed. Please try again.' };
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    try { await auth.signOut(); } catch {}
    localStorage.removeItem('discuss_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
