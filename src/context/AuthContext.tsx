import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/services';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The only account allowed to sign in to the admin suite.
// Mirrors the server-side rule so the client never even attempts
// to render the CMS for any other "user".
const MASTER_ADMIN_EMAIL = 'admin@muhammadahmad.com';

const clearSession = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          const me = res.user;
          // Defense in depth: even if a stale token for a non-owner account
          // exists, never restore it as a valid admin session.
          if (me?.email?.toLowerCase() !== MASTER_ADMIN_EMAIL || me?.role !== 'superadmin') {
            throw new Error('Not the admin owner');
          }
          setUser(me);
          localStorage.setItem('admin_user', JSON.stringify(me));
        } catch (error) {
          clearSession();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const me = res.user;
    if (me?.email?.toLowerCase() !== MASTER_ADMIN_EMAIL || me?.role !== 'superadmin') {
      clearSession();
      throw new Error('Access restricted to the site owner only.');
    }
    setToken(res.token);
    setUser(me);
    localStorage.setItem('admin_token', res.token);
    localStorage.setItem('admin_user', JSON.stringify(me));
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    // Never let the stored user drift away from the owner email.
    if (updated.email?.toLowerCase() !== MASTER_ADMIN_EMAIL || updated.role !== 'superadmin') {
      clearSession();
      setToken(null);
      setUser(null);
      return;
    }
    setUser(updated);
    localStorage.setItem('admin_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
