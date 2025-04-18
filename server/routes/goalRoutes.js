import express from 'express';
import { 
  createGoal, 
  getGoals, 
  getGoalById, 
  updateGoal, 
  deleteGoal, 
  contributeToGoal 
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes for /api/goals
router.route('/')
  .post(createGoal)
  .get(getGoals);

// Routes for /api/goals/:id
router.route('/:id')
  .get(getGoalById)
  .put(updateGoal)
  .delete(deleteGoal);

// Route for contributing to a goal
router.route('/:id/contribute')
  .post(contributeToGoal);

export default router;