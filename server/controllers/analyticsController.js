import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import { analyzeSpendingPatterns, detectAnomalies, forecastExpenses, generateRecommendations } from '../services/analyticsService.js';

// @desc    Get spending trends by category over time
// @route   GET /api/analytics/trends
// @access  Private
export const getSpendingTrends = asyncHandler(async (req, res) => {
  console.log('getSpendingTrends called, user ID:', req.user?._id);
  const userId = req.user._id;
  const { period = 'month', limit = 6 } = req.query;
  
  // Get expenses for the user WITH populated category
  const expenses = await Expense.find({ user: userId })
                              .populate('category')
                              .sort({ date: -1 });
  
  console.log(`Found ${expenses.length} expenses for trend analysis`);
  const trends = analyzeSpendingPatterns(expenses, period, parseInt(limit));
  
  res.json({
    success: true,
    data: trends
  });
});

// @desc    Get spending forecasts for upcoming months
// @route   GET /api/analytics/forecasts
// @access  Private
export const getSpendingForecasts = asyncHandler(async (req, res) => {
  console.log('getSpendingForecasts called, user:', req.user?._id);
  const userId = req.user._id;
  const { months = 3 } = req.query;
  
  // Get historical expenses WITH populated category
  const expenses = await Expense.find({ user: userId })
                              .populate('category')
                              .sort({ date: -1 });
  
  console.log(`Found ${expenses.length} expenses for forecasting`);
  const forecasts = forecastExpenses(expenses, parseInt(months));
  
  res.json({
    success: true,
    data: forecasts
  });
});

// @desc    Get anomaly detection in spending patterns
// @route   GET /api/analytics/anomalies
// @access  Private
export const getAnomalyDetection = asyncHandler(async (req, res) => {
  console.log('getAnomalyDetection called, user:', req.user?._id);
  const userId = req.user._id;
  
  // Get expenses WITH populated category
  const expenses = await Expense.find({ user: userId })
                              .populate('category')
                              .sort({ date: -1 });
  
  console.log(`Found ${expenses.length} expenses for anomaly detection`);
  const anomalies = detectAnomalies(expenses);
  
  res.json({
    success: true,
    data: anomalies
  });
});

// @desc    Get personalized expense reduction recommendations
// @route   GET /api/analytics/recommendations
// @access  Private
export const getPersonalizedTips = asyncHandler(async (req, res) => {
  console.log('getPersonalizedTips called, user:', req.user?._id);
  const userId = req.user._id;
  
  // Get expenses WITH populated category
  const expenses = await Expense.find({ user: userId })
                              .populate('category')
                              .sort({ date: -1 });
  
  console.log(`Found ${expenses.length} expenses for generating recommendations`);
  const recommendations = generateRecommendations(expenses);
  
  res.json({
    success: true,
    data: recommendations
  });
});