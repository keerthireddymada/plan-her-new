import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

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
  const [error, setError] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setError(null);
      
      // Check if user has a profile
      await checkProfileStatus();
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear any invalid tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setHasProfile(false);
      setError(null); // Clear any previous errors
    } finally {
      setLoading(false);
    }
  };

  const checkProfileStatus = async () => {
    try {
      await profileAPI.getProfile();
      setHasProfile(true);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false);
        return false;
      } else {
        console.error('Profile check failed:', error);
        setHasProfile(false);
        return false;
      }
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Check if user has a profile and return the result
      const profileExists = await checkProfileStatus();
      
      return { success: true, hasProfile: profileExists };
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 422) {
        errorMessage = 'Please check your email format';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, name) => {
    try {
      setError(null);
      const response = await authAPI.register({ email, password, name });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // New users don't have a profile yet
      setHasProfile(false);
      
      return { success: true, hasProfile: false };
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.status === 400) {
        errorMessage = 'Email already exists';
      } else if (error.response?.status === 422) {
        errorMessage = 'Please check your input (email format, password length)';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setHasProfile(false);
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    hasProfile,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
