import axios from 'axios';
import authService from './authService';

// Use the same base URL format as your other components
const API_URL = '/api/expenses';

// Configure axios with auth token before each request
const configureRequest = () => {
  authService.configureAxiosHeader();
};

// Fetch all expenses
const fetchExpenses = async (params = {}) => {
  try {
    configureRequest();
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await axios.get(`${API_URL}${queryString}`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error.response?.data || { message: 'Failed to fetch expenses' };
  }
};

// Add a new expense
const addExpense = async (expenseData) => {
  try {
    configureRequest();
    const response = await axios.post(API_URL, expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add expense' };
  }
};

// Update an existing expense
const updateExpense = async (id, expenseData) => {
  try {
    configureRequest();
    const response = await axios.put(`${API_URL}/${id}`, expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update expense' };
  }
};

// Delete an expense
const deleteExpense = async (id) => {
  try {
    configureRequest();
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete expense' };
  }
};

// Get expense by ID with enhanced error handling and authentication
const getExpenseById = async (id) => {
  try {
    // Get the token directly from localStorage for this critical request
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Fetching expense with ID: ${id} with token: ${token.substring(0, 10)}...`);
    
    // Using absolute URL instead of relative URL
    const response = await axios.get(`http://localhost:5000/api/expenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('API response:', response);
    return response.data;
  } catch (error) {
    console.error('Full error object:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      return Promise.reject(error.response.data || { message: `Server error: ${error.response.status}` });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      return Promise.reject({ message: 'No response from server. Check your network connection.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      return Promise.reject({ message: error.message || 'Unknown error occurred' });
    }
  }
};

// Get expense statistics 
const getExpenseStats = async (params = {}) => {
  try {
    configureRequest();
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await axios.get(`${API_URL}/stats${queryString}`);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch expense statistics' };
  }
};

// Get chart data
const getChartData = async (period, customFilters = {}) => {
  try {
    configureRequest();
    const { startDate, endDate, ...additionalFilters } = customFilters;
    
    let endpoint;
    let params = { ...additionalFilters };
    
    // Map period to appropriate report endpoint
    if (period === 'monthly') {
      endpoint = 'http://localhost:5000/api/reports/monthly';
      // For monthly chart, we need year parameter
      const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
      params = { ...params, year };
    } else if (period === 'category') {
      endpoint = 'http://localhost:5000/api/reports/by-category';
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    } else if (period === 'trends') {
      endpoint = 'http://localhost:5000/api/reports/trends';
    } else {
      throw new Error('Invalid chart period specified');
    }
    
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(`${endpoint}?${queryParams.toString()}`);
    
    // Transform data to format expected by charts
    if (period === 'monthly') {
      // Monthly data needs to be transformed to labels and data arrays
      return {
        labels: response.data.map(item => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months[item.month - 1];
        }),
        data: response.data.map(item => item.total)
      };
    } else if (period === 'category') {
      // Category data needs to be transformed to labels and data arrays
      return {
        labels: response.data.map(item => item._id || 'Uncategorized'),
        data: response.data.map(item => item.total)
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Chart data fetch error:', error);
    throw error.response?.data || { message: 'Failed to fetch chart data' };
  }
};

export default {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseById,
  getExpenseStats,
  getChartData
};