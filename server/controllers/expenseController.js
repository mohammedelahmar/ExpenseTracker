//Expense CRUD operations
import Expense from "../models/Expense.js"; // Added .js extension
import asyncHandler from "express-async-handler";
import User from "../models/User.js"; // Added .js extension

// @desc   Create new expense
// @route  POST /api/expenses
// @access Private
const createExpense = asyncHandler(async(req, res) => {
     // Get user ID from auth middleware instead of request body
     const user = req.user._id;
     const {date, amount, category, description, receipt} = req.body;
     
     const expense = await Expense.create({
        user,
        date,
        amount,
        category,
        description,
        receipt
     });
     
     if(expense) {
        res.status(201).json(expense);
     } else {
        res.status(400);
        throw new Error("Invalid expense data");
     }
});

// @desc   Get all expenses for logged in user with filtering and pagination
// @route  GET /api/expenses
// @access Private
const getAllExpenses = asyncHandler(async(req, res) => {
    // Build filter based on query params
    const filter = { user: req.user._id };
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
        filter.date = { 
            $gte: new Date(req.query.startDate), 
            $lte: new Date(req.query.endDate) 
        };
    } else if (req.query.startDate) {
        filter.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
        filter.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Filter by category
    if (req.query.category) {
        filter.category = req.query.category;
    }
    
    // Filter by min/max amount
    if (req.query.minAmount || req.query.maxAmount) {
        filter.amount = {};
        if (req.query.minAmount) filter.amount.$gte = Number(req.query.minAmount);
        if (req.query.maxAmount) filter.amount.$lte = Number(req.query.maxAmount);
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.date = -1; // Default sort by date, newest first
    }
    
    // Execute query with pagination
    const expenses = await Expense.find(filter)
        .sort(sort)
        .limit(limit)
        .skip(skip);
    
    // Get total count for pagination metadata
    const total = await Expense.countDocuments(filter);
    
    res.json({
        expenses,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc   Update expense
// @route  PUT /api/expenses/:id
// @access Private
const updateExpense = asyncHandler(async(req, res) => {
     const {date, amount, category, description, receipt} = req.body;
     const expense = await Expense.findById(req.params.id);
     
     if(!expense) {
          res.status(404);
          throw new Error("Expense not found");
     }
     
     // Check if expense belongs to logged in user
     if(expense.user.toString() !== req.user._id.toString()) {
          res.status(401);
          throw new Error("Not authorized to update this expense");
     }
     
     expense.date = date || expense.date;
     expense.amount = amount || expense.amount;
     expense.category = category || expense.category;
     expense.description = description || expense.description;
     expense.receipt = receipt || expense.receipt;

     const updatedExpense = await expense.save(); // Fixed: was using Expense.save()
     res.json(updatedExpense);
});


// @desc   Delete expense
// @route  DELETE /api/expenses/:id
// @access Private
const deleteExpense = asyncHandler(async(req, res) => {
     const expense = await Expense.findById(req.params.id);
     
     if(!expense) {
          res.status(404);
          throw new Error("Expense not found");
     }
     
     // Check if expense belongs to logged in user
     if(expense.user.toString() !== req.user._id.toString()) {
          res.status(401);
          throw new Error("Not authorized to delete this expense");
     }
     
     await Expense.deleteOne({ _id: req.params.id }); // Fixed: using deleteOne instead of deprecated remove()
     res.json({ message: "Expense removed" });
});

// @desc   Get expense statistics
// @route  GET /api/expenses/stats
// @access Private
const getExpenseStats = asyncHandler(async(req, res) => {
    // Get user ID from auth middleware
    const userId = req.user._id;
    
    // Build filter based on query params
    const filter = { user: userId };
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
        filter.date = { 
            $gte: new Date(req.query.startDate), 
            $lte: new Date(req.query.endDate) 
        };
    } else if (req.query.startDate) {
        filter.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
        filter.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Get all expenses for this filter
    const expenses = await Expense.find(filter);
    
    // Calculate statistics
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const expenseCount = expenses.length;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    
    // Calculate monthly average - using date range duration
    let monthlyExpenses = 0;
    if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                           endDate.getMonth() - startDate.getMonth() + 
                           (endDate.getDate() >= startDate.getDate() ? 0 : -1);
        const durationInMonths = Math.max(monthDiff, 1); // At least 1 month
        monthlyExpenses = totalExpenses / durationInMonths;
    } else {
        monthlyExpenses = totalExpenses; // Default to total if no date range
    }
    
    res.json({
        totalExpenses,
        expenseCount,
        averageExpense,
        monthlyExpenses
    });
});

// @desc   Get expense chart data
// @route  GET /api/expenses/chart
// @access Private
const getExpenseChart = asyncHandler(async(req, res) => {
    // Get user ID from auth middleware
    const userId = req.user._id;
    const { period, startDate, endDate } = req.query;
    
    // Build filter based on query params
    const filter = { user: userId };
    
    // Filter by date range
    if (startDate && endDate) {
        filter.date = { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
        };
    }
    
    let result = {};
    
    if (period === 'monthly') {
        // Group expenses by month
        const expenses = await Expense.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { 
                        year: { $year: "$date" }, 
                        month: { $month: "$date" } 
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        
        // Format the data for chart.js
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        result.labels = expenses.map(item => `${months[item._id.month-1]} ${item._id.year}`);
        result.data = expenses.map(item => item.total);
    }
    else if (period === 'category') {
        // Group expenses by category
        const expenses = await Expense.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { total: -1 } }
        ]);
        
        result.labels = expenses.map(item => item._id || 'Uncategorized');
        result.data = expenses.map(item => item.total);
    }
    
    res.json(result);
});

export { 
    createExpense, 
    getAllExpenses, 
    updateExpense, 
    deleteExpense, 
    getExpenseStats,
    getExpenseChart  // Add this
};