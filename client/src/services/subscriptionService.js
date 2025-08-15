import authService from './authService';
import api from './api';

const BASE = '/subscriptions';

// Configure axios with auth token before each request
const configureRequest = () => {
  authService.configureAxiosHeader();
};

// Fetch all subscriptions
const fetchSubscriptions = async () => {
  try {
    configureRequest();
  const response = await api.get(BASE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch subscriptions' };
  }
};

// Get upcoming subscription payments
const getUpcomingPayments = async (days = 30) => {
  try {
    configureRequest();
  const response = await api.get(`${BASE}/upcoming?days=${days}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch upcoming payments' };
  }
};

// Get a subscription by ID
const getSubscriptionById = async (id) => {
  try {
    configureRequest();
  const response = await api.get(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch subscription' };
  }
};

// Add a new subscription
const addSubscription = async (subscriptionData) => {
  try {
    configureRequest();
  const response = await api.post(BASE, subscriptionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add subscription' };
  }
};

// Update an existing subscription
const updateSubscription = async (id, subscriptionData) => {
  try {
    configureRequest();
  const response = await api.put(`${BASE}/${id}`, subscriptionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update subscription' };
  }
};

// Delete a subscription
const deleteSubscription = async (id) => {
  try {
    configureRequest();
  const response = await api.delete(`${BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete subscription' };
  }
};

// Record a payment for a subscription
const recordPayment = async (id) => {
  try {
    configureRequest();
  const response = await api.post(`${BASE}/${id}/payment`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record payment' };
  }
};

const subscriptionService = {
  fetchSubscriptions,
  getUpcomingPayments,
  getSubscriptionById,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  recordPayment
};

export default subscriptionService;