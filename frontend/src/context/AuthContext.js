import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use consistent API base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://todo-app-kappa-green-45.vercel.app/api'
  : 'http://localhost:5000/api';
  
  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem('todoapp_token');
        const savedUser = localStorage.getItem('todoapp_user');
        
        console.log('Initializing auth...'); // Debug log
        console.log('Saved token exists:', !!savedToken); // Debug log
        console.log('API Base URL:', API_BASE_URL); // Debug log
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          console.log('Auth initialized from localStorage'); // Debug log
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('todoapp_token');
        localStorage.removeItem('todoapp_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [API_BASE_URL]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`); // Debug log

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status); // Debug log

      const data = await response.json();
      console.log('Login response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save to state and localStorage
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('todoapp_token', data.token);
      localStorage.setItem('todoapp_user', JSON.stringify(data.user));

      console.log('Login successful'); // Debug log
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting registration to:', `${API_BASE_URL}/auth/register`); // Debug log

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('Register response status:', response.status); // Debug log

      const data = await response.json();
      console.log('Register response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Auto-login after successful registration
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('todoapp_token', data.token);
      localStorage.setItem('todoapp_user', JSON.stringify(data.user));

      console.log('Registration successful'); // Debug log
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Optional: Call logout endpoint
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (logoutError) {
          console.error('Logout API call failed:', logoutError);
          // Continue with client-side logout even if API call fails
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage regardless of API call result
      setToken(null);
      setUser(null);
      setError(null);
      localStorage.removeItem('todoapp_token');
      localStorage.removeItem('todoapp_user');
      console.log('Logout completed'); // Debug log
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      setUser(data.user);
      localStorage.setItem('todoapp_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (name) => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data.user);
      localStorage.setItem('todoapp_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Get authentication headers for API calls
  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    getUserProfile,
    updateProfile,
    isAuthenticated,
    getAuthHeaders,
    setError, // Allow manual error clearing
    API_BASE_URL, // Expose API base URL for debugging
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};