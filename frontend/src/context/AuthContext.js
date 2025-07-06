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

  // Use relative URL for production to avoid CORS issues
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api'  // Relative URL - let Vercel handle routing
    : 'http://localhost:5000/api';
  
  // Utility function to make API calls with timeout
  const makeApiCall = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw error;
    }
  };
  
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
      console.log('Request payload:', { email, password }); // Debug log

      const response = await makeApiCall(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status); // Debug log

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login response data:', data); // Debug log

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

      const response = await makeApiCall(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('Register response status:', response.status); // Debug log

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Register response data:', data); // Debug log

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
          await makeApiCall(`${API_BASE_URL}/auth/logout`, {
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

      const response = await makeApiCall(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
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

      const response = await makeApiCall(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        let errorMessage = 'Profile update failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
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