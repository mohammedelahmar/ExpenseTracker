import authService from './authService';
import api from './api';

// Use the same base URL format as your other components
const BASE = '/expenses';

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
  const response = await api.get(`${BASE}${queryString}`);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch expenses' };
  }
};

// Add a new expense
const addExpense = async (expenseData) => {
  try {
    configureRequest();
  const response = await api.post(BASE, expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add expense' };
  }
};

// Update an existing expense
const updateExpense = async (id, expenseData) => {
  try {
    configureRequest();
  const response = await api.put(`${BASE}/${id}`, expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update expense' };
  }
};

// Delete an expense
const deleteExpense = async (id) => {
  try {
    configureRequest();
  const response = await api.delete(`${BASE}/${id}`);
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
    if (!token) throw new Error('Authentication token not found');
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return Promise.reject(error.response.data || { message: `Server error: ${error.response.status}` });
    } else if (error.request) {
      return Promise.reject({ message: 'No response from server. Check your network connection.' });
    } else {
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
  const response = await api.get(`${BASE}/stats${queryString}`);
    
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

    if (period === 'monthly' || period === 'category') {
      // Use expenses/chart endpoint which supports startDate/endDate filtering
  endpoint = '/expenses/chart';
      params = {
        ...params,
        period: period, // 'monthly' | 'category'
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    } else if (period === 'trends') {
      // Keep existing behavior for trends, if used elsewhere
  endpoint = '/reports/trends';
    } else {
      throw new Error('Invalid chart period specified');
    }

    const queryParams = new URLSearchParams(params);
  const response = await api.get(`${endpoint}?${queryParams.toString()}`);

    // Prefer server-provided labels/data (from /api/expenses/chart)
    if (response?.data?.labels && response?.data?.data) {
      return response.data;
    }

    // Fallback transformation for legacy report endpoints
    if (period === 'monthly') {
      return {
        labels: response.data.map(item => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months[item.month - 1];
        }),
        data: response.data.map(item => item.total)
      };
    } else if (period === 'category') {
      return {
        labels: response.data.map(item => item._id || 'Uncategorized'),
        data: response.data.map(item => item.total)
      };
    }

    return response.data;
  } catch (error) {
    
    throw error.response?.data || { message: 'Failed to fetch chart data' };
  }
};

const service = {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseById,
  getExpenseStats,
  getChartData
};

export default service;