import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

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

const authService = {
  login,
  signup,
  logout,
  getToken,
  isAuthenticated,
  getCurrentUser,
  configureAxiosHeader
};

export default authService;
