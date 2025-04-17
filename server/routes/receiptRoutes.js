import express from 'express';
import { upload, processReceipt } from '../controllers/receiptController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route for uploading and processing receipts
router.post('/upload', protect, upload.single('receipt'), processReceipt);

export default router;