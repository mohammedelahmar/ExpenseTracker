import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

// @desc   Get expenses summary by category
// @route  GET /api/reports/by-category
// @access Private
const getExpensesByCategory = asyncHandler(async (req, res) => {
    // Optional date range
    const dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
        dateFilter.date = { 
            $gte: new Date(req.query.startDate), 
            $lte: new Date(req.query.endDate) 
        };
    }

    const categoryData = await Expense.aggregate([
        { 
            $match: { 
                user: new mongoose.Types.ObjectId(req.user._id),
                ...dateFilter
            } 
        },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);
    
    res.json(categoryData);
});

// @desc   Get monthly expense summary
// @route  GET /api/reports/monthly
// @access Private
const getMonthlyExpenses = asyncHandler(async (req, res) => {
    // Allow filtering by year
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    const monthlyData = await Expense.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
                date: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { month: { $month: '$date' } },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.month': 1 } }
    ]);
    
    // Fill in missing months with zero values
    const result = Array(12).fill().map((_, i) => {
        const month = i + 1;
        const found = monthlyData.find(item => item._id.month === month);
        return {
            month,
            total: found ? found.total : 0,
            count: found ? found.count : 0
        };
    });
    
    res.json(result);
});

// @desc   Get expense trends over time
// @route  GET /api/reports/trends
// @access Private
const getExpenseTrends = asyncHandler(async (req, res) => {
    // Get last 6 months by default
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    const trendData = await Expense.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    category: '$category'
                },
                total: { $sum: '$amount' }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);
    
    res.json(trendData);
});

export { getExpensesByCategory, getMonthlyExpenses, getExpenseTrends };