import express from 'express';
import { 
    createExpense, 
    getAllExpenses, 
    updateExpense, 
    deleteExpense, 
    getExpenseStats, 
    getExpenseChart 
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Stats route - add this before the ID route to prevent conflict
router.get('/stats', getExpenseStats);

// Add chart route - place it before the ID route to prevent conflict
router.get('/chart', getExpenseChart);

// Regular CRUD routes
router.route('/')
    .post(createExpense)
    .get(getAllExpenses);

router.route('/:id')
    .put(updateExpense)
    .delete(deleteExpense);

export default router;