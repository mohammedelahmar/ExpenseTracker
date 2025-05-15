import axios from 'axios';
import authService from './authService';

const API_URL = '/api/subscriptions';

// Configure axios with auth token before each request
const configureRequest = () => {
  authService.configureAxiosHeader();
};

// Fetch all subscriptions
const fetchSubscriptions = async () => {
  try {
    configureRequest();
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error.response?.data || { message: 'Failed to fetch subscriptions' };
  }
};

// Get upcoming subscription payments
const getUpcomingPayments = async (days = 30) => {
  try {
    configureRequest();
    const response = await axios.get(`${API_URL}/upcoming?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming payments:', error);
    throw error.response?.data || { message: 'Failed to fetch upcoming payments' };
  }
};

// Add a new subscription
const addSubscription = async (subscriptionData) => {
  try {
    configureRequest();
    const response = await axios.post(API_URL, subscriptionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add subscription' };
  }
};

// Update an existing subscription
const updateSubscription = async (id, subscriptionData) => {
  try {
    configureRequest();
    const response = await axios.put(`${API_URL}/${id}`, subscriptionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update subscription' };
  }
};

// Delete a subscription
const deleteSubscription = async (id) => {
  try {
    configureRequest();
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete subscription' };
  }
};

// Record a payment for a subscription
const recordPayment = async (id) => {
  try {
    configureRequest();
    const response = await axios.post(`${API_URL}/${id}/payment`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record payment' };
  }
};

export default {
  fetchSubscriptions,
  getUpcomingPayments,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  recordPayment
};