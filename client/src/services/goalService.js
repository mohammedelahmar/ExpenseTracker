import axios from 'axios';
import authService from './authService';

// Set up base URL
const API_URL = '/api/goals';

// Configure axios with auth token before each request
const configureRequest = () => {
  authService.configureAxiosHeader();
};

// Fetch all goals
const fetchGoals = async () => {
  try {
    configureRequest();
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch goals' };
  }
};

// Get goal by ID
const getGoalById = async (id) => {
  try {
    configureRequest();
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch goal details' };
  }
};

// Create new goal
const createGoal = async (goalData) => {
  try {
    configureRequest();
    const response = await axios.post(API_URL, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create goal' };
  }
};

// Update goal
const updateGoal = async (id, goalData) => {
  try {
    configureRequest();
    const response = await axios.put(`${API_URL}/${id}`, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update goal' };
  }
};

// Delete goal
const deleteGoal = async (id) => {
  try {
    configureRequest();
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete goal' };
  }
};

// Contribute to goal
const contributeToGoal = async (id, amount) => {
  try {
    configureRequest();
    const response = await axios.post(`${API_URL}/${id}/contribute`, { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add contribution' };
  }
};

export default {
  fetchGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal
};