import express from 'express';
import { getExpensesByCategory, getMonthlyExpenses, getExpenseTrends } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.get('/by-category', protect, getExpensesByCategory);
router.get('/monthly', protect, getMonthlyExpenses);
router.get('/trends', protect, getExpenseTrends);

export default router;