import authService from './authService';
import api from './api';

// Set up base URL
const BASE = '/goals';

// Configure axios with auth token before each request
const configureRequest = () => {
  authService.configureAxiosHeader();
};

// Fetch all goals
const fetchGoals = async () => {
  try {
    configureRequest();
  const response = await api.get(BASE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch goals' };
  }
};

// Get goal by ID
const getGoalById = async (id) => {
  try {
    configureRequest();
  const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch goal details' };
  }
};

// Create new goal
const createGoal = async (goalData) => {
  try {
    configureRequest();
  const response = await api.post(BASE, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create goal' };
  }
};

// Update goal
const updateGoal = async (id, goalData) => {
  try {
    configureRequest();
  const response = await api.put(`${BASE}/${id}`, goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update goal' };
  }
};

// Delete goal
const deleteGoal = async (id) => {
  try {
    configureRequest();
  const response = await api.delete(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete goal' };
  }
};

// Contribute to goal
const contributeToGoal = async (id, amount) => {
  try {
    configureRequest();
  const response = await api.post(`${BASE}/${id}/contribute`, { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add contribution' };
  }
};

const goalService = {
  fetchGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal
};

export default goalService;