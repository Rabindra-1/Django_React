import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For RAG-only backend, skip authentication
    setLoading(false);
    // Optionally set a mock user for demo purposes
    // setUser({ username: 'Demo User', id: 1 });
  }, []);


  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/auth/login/', {
        username_or_email: usernameOrEmail,
        password,
      });

      const { access, refresh, user } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};










