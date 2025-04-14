import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/expenses';

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

// Get expense by ID
const getExpenseById = async (id) => {
  try {
    configureRequest();
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch expense' };
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