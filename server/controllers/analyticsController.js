import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import {
  analyzeSpendingPatterns,
  detectAnomalies,
  forecastExpenses,
  generateRecommendations,
  summarizeAnalytics,
} from '../services/analyticsService.js';

// Helpers to parse/sanitize query params
const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

const toFloat = (v, def) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

const toBool = (v, def = false) => {
  if (v === undefined) return def;
  const s = String(v).toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
};

const sanitizePeriod = (p) => {
  const allowed = ['day', 'week', 'month', 'quarter', 'year'];
  return allowed.includes(p) ? p : 'month';
};

const buildAnalysisOptions = (query) => ({
  startDate: query.startDate,
  endDate: query.endDate,
  includeEmpty: toBool(query.includeEmpty, true),
  minAmount: toFloat(query.minAmount, 0),
  topN: toInt(query.topN, 3),
});

// @desc    Get spending trends by category over time
// @route   GET /api/analytics/trends
// @access  Private
export const getSpendingTrends = asyncHandler(async (req, res) => {
  console.log('getSpendingTrends called, user ID:', req.user?._id);
  const userId = req.user._id;
  const period = sanitizePeriod(req.query.period || 'month');
  const limit = toInt(req.query.limit, 6);
  const options = buildAnalysisOptions(req.query);

  // Get expenses for the user WITH populated category
  const expenses = await Expense.find({ user: userId }).populate('category').sort({ date: -1 });

  console.log(`Found ${expenses.length} expenses for trend analysis`);
  const trends = analyzeSpendingPatterns(expenses, period, limit, options);

  res.json({ success: true, data: trends });
});

// @desc    Get spending forecasts for upcoming months
// @route   GET /api/analytics/forecasts
// @access  Private
export const getSpendingForecasts = asyncHandler(async (req, res) => {
  console.log('getSpendingForecasts called, user:', req.user?._id);
  const userId = req.user._id;
  const months = toInt(req.query.months, 3);
  const alpha = req.query.alpha !== undefined ? toFloat(req.query.alpha, undefined) : undefined;

  // Get historical expenses WITH populated category
  const expenses = await Expense.find({ user: userId }).populate('category').sort({ date: -1 });

  console.log(`Found ${expenses.length} expenses for forecasting`);
  const forecasts = forecastExpenses(expenses, months, { alpha });

  res.json({ success: true, data: forecasts });
});

// @desc    Get anomaly detection in spending patterns
// @route   GET /api/analytics/anomalies
// @access  Private
export const getAnomalyDetection = asyncHandler(async (req, res) => {
  console.log('getAnomalyDetection called, user:', req.user?._id);
  const userId = req.user._id;
  const zThreshold = req.query.zThreshold !== undefined ? toFloat(req.query.zThreshold, undefined) : undefined;
  const minCategoryCount = req.query.minCategoryCount !== undefined ? toInt(req.query.minCategoryCount, undefined) : undefined;

  // Get expenses WITH populated category
  const expenses = await Expense.find({ user: userId }).populate('category').sort({ date: -1 });

  console.log(`Found ${expenses.length} expenses for anomaly detection`);
  const anomalies = detectAnomalies(expenses, { zThreshold, minCategoryCount });

  res.json({ success: true, data: anomalies });
});

// @desc    Get personalized expense reduction recommendations
// @route   GET /api/analytics/recommendations
// @access  Private
export const getPersonalizedTips = asyncHandler(async (req, res) => {
  console.log('getPersonalizedTips called, user:', req.user?._id);
  const userId = req.user._id;

  // Get expenses WITH populated category
  const expenses = await Expense.find({ user: userId }).populate('category').sort({ date: -1 });

  console.log(`Found ${expenses.length} expenses for generating recommendations`);
  const recommendations = generateRecommendations(expenses);

  res.json({ success: true, data: recommendations });
});

// @desc    Get combined analytics summary for dashboards
// @route   GET /api/analytics/summary
// @access  Private
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  console.log('getAnalyticsSummary called, user:', req.user?._id);
  const userId = req.user._id;

  const period = sanitizePeriod(req.query.period || 'month');
  const limit = toInt(req.query.limit, 6);
  const forecastMonths = toInt(req.query.forecastMonths, 3);

  const analysisOptions = buildAnalysisOptions(req.query);
  const alpha = req.query.alpha !== undefined ? toFloat(req.query.alpha, undefined) : undefined;
  const zThreshold = req.query.zThreshold !== undefined ? toFloat(req.query.zThreshold, undefined) : undefined;
  const minCategoryCount = req.query.minCategoryCount !== undefined ? toInt(req.query.minCategoryCount, undefined) : undefined;

  // Get expenses WITH populated category
  const expenses = await Expense.find({ user: userId }).populate('category').sort({ date: -1 });

  console.log(`Found ${expenses.length} expenses for analytics summary`);
  const summary = summarizeAnalytics(expenses, {
    ...analysisOptions,
    period,
    limit,
    forecastMonths,
    alpha,
    zThreshold,
    minCategoryCount,
  });

  res.json({ success: true, data: summary });
});
