import express from 'express';
import { 
    createSubscription, 
    getAllSubscriptions, 
    getSubscriptionById,
    updateSubscription, 
    deleteSubscription,
    recordPayment,
    getUpcomingPayments
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Get upcoming payments
router.get('/upcoming', getUpcomingPayments);

// Regular CRUD routes
router.route('/')
    .post(createSubscription)
    .get(getAllSubscriptions);

router.route('/:id')
    .get(getSubscriptionById)
    .put(updateSubscription)
    .delete(deleteSubscription);

// Record payment route
router.post('/:id/payment', recordPayment);

export default router;