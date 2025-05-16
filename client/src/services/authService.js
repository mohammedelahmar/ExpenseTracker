import axios from 'axios';

// Replace the hardcoded URL with environment variable
const API_URL = process.env.REACT_APP_API_URL ? 
  `${process.env.REACT_APP_API_URL}/users` : 
  '/api/users';

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
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Login user
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
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
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      setToken(response.data.token);
      configureAxiosHeader();
    }
    return response.data;
  } catch (error) {
    console.error('Signup error details:', error);
    throw error.response?.data || { message: 'Signup failed' };
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
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
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  } catch (error) {
    logout();
    throw error.response?.data || { message: 'Failed to get user' };
  }
};

// Google login
const googleLogin = async (credential) => {
  try {
    console.log('Google login initiated with credential', credential ? 'present' : 'missing');
    
    const response = await axios.post(`${API_URL}/google-login`, 
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
    console.error('Google login error details:', error);
    throw error.response?.data || { message: `Google login failed: ${error.message}` };
  }
};

// Google signup
const googleSignup = async (credential) => {
  try {
    const response = await axios.post(`${API_URL}/google-signup`, { token: credential });
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
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to request password reset' };
  }
};

// Reset password with token
const resetPassword = async (token, password) => {
  try {
    const response = await axios.put(`${API_URL}/reset-password/${token}`, { password });
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
