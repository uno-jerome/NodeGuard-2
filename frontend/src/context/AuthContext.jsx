import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('nodeguard_token') || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('nodeguard_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem('nodeguard_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('nodeguard_token');
    localStorage.removeItem('nodeguard_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('nodeguard:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('nodeguard:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('nodeguard_token', receivedToken);
      localStorage.setItem('nodeguard_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Authentication failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
