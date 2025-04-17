import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getSpendingTrends, 
  getSpendingForecasts, 
  getAnomalyDetection, 
  getPersonalizedTips 
} from '../controllers/analyticsController.js';

const router = express.Router();

// Add a test route that doesn't require authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics routes are working!' });
});

// All routes are protected
router.get('/trends', protect, getSpendingTrends);
router.get('/forecasts', protect, getSpendingForecasts);
router.get('/anomalies', protect, getAnomalyDetection);
router.get('/recommendations', protect, getPersonalizedTips);

console.log('Analytics routes registered:', router.stack.map(r => r.route?.path).filter(Boolean));

export default router;