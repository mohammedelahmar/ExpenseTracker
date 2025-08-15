import api from './api';

// Use axios baseURL '/api' and relative endpoints here
const BASE = '/users';

// Store the token in localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Get the token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Add token to authorization header
const configureAxiosHeader = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Login user
const login = async (email, password) => {
  try {
  const response = await api.post(`${BASE}/login`, { email, password });
    if (response.data.token) {
      setToken(response.data.token);
      configureAxiosHeader();
      return response.data;
    }
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Register a new user
const signup = async (userData) => {
  try {
    // Changed from /signup to /register to match your backend route
  const response = await api.post(`${BASE}/register`, userData);
    if (response.data.token) {
      setToken(response.data.token);
      configureAxiosHeader();
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Signup failed' };
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Get current user info
const getCurrentUser = async () => {
  if (!isAuthenticated()) return null;
  
  try {
    configureAxiosHeader();
  const response = await api.get(`${BASE}/me`);
    return response.data;
  } catch (error) {
    logout();
    throw error.response?.data || { message: 'Failed to get user' };
  }
};

// Google login
const googleLogin = async (credential) => {
  try {
  const response = await api.post(`${BASE}/google-login`, 
      { token: credential },
      { withCredentials: true }
    );
    
    if (response.data.token) {
      setToken(response.data.token);
      configureAxiosHeader();
      return response.data;
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    throw error.response?.data || { message: `Google login failed: ${error.message}` };
  }
};

// Google signup
const googleSignup = async (credential) => {
  try {
  const response = await api.post(`${BASE}/google-signup`, { token: credential });
    if (response.data.token) {
      setToken(response.data.token);
      configureAxiosHeader();
      return response.data;
    }
  } catch (error) {
    throw error.response?.data || { message: 'Google signup failed' };
  }
};

// Request password reset
const forgotPassword = async (email) => {
  try {
  const response = await api.post(`${BASE}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to request password reset' };
  }
};

// Reset password with token
const resetPassword = async (token, password) => {
  try {
  const response = await api.put(`${BASE}/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

const authService = {
  login,
  signup,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken,
  setToken,
  configureAxiosHeader,
  googleLogin,
  googleSignup,
  forgotPassword,
  resetPassword
};

export default authService;
