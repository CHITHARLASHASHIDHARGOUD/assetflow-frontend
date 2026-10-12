import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, tokenStore, SESSION_EXPIRED_EVENT } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Roles always come from the server (/auth/me), never from local storage.
  useEffect(() => {
    if (!tokenStore.get()) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setUser(prev => {
        if (prev) toast.error('Your session has expired. Please sign in again.');
        return null;
      });
      qc.clear();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [qc]);

  const signIn = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStore.set(data.token);
    qc.clear();
    setUser(data.user);
  }, [qc]);

  const signUp = useCallback(async (email, password, name) => {
    const { data } = await api.post('/auth/register', { email, password, name: name || email.split('@')[0] });
    tokenStore.set(data.token);
    qc.clear();
    setUser(data.user);
  }, [qc]);

  const signOut = useCallback(async () => {
    await qc.cancelQueries();
    qc.clear();
    tokenStore.clear();
    setUser(null);
    window.history.replaceState(null, '', '/');
  }, [qc]);

  const hasRole = useCallback((...roles) => !!user && roles.some(r => user.roles.includes(r)), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** UI-only permission helpers; the server enforces the real rules. */
export function usePermissions() {
  const { hasRole } = useAuth();
  return {
    isAdmin: hasRole('ADMIN'),
    canManage: hasRole('ADMIN', 'IT_MANAGER'),
    canReadAll: hasRole('ADMIN', 'IT_MANAGER', 'AUDITOR'),
    isEmployeeOnly: !hasRole('ADMIN', 'IT_MANAGER', 'AUDITOR'),
    hasRole,
  };
}
