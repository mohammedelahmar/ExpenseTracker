//Express server setup 
// This file sets up an Express server that serves static files from a 'public' directory.
// It uses middleware for parsing JSON and URL-encoded data, and it defines a route for the root URL.
// It also handles errors and starts the server on a specified port.
// Importing required modules
import express from 'express';
import connectDB from './config/db.js'; // Added .js extension
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// Import routes
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';  
import goalRoutes from './routes/goalRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js'; 
import bankRoutes from './routes/bankRoutes.js'; 
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database only when not running tests
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// If behind a proxy (optional but recommended for correct protocol)
app.set('trust proxy', 1);

// Serve the uploads directory (ensure path is the same location used by multer)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Note: dev-only test routes have been removed for production

// Mount route files
app.use('/api/users', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/analytics', analyticsRoutes);  
app.use('/api/goals', goalRoutes);
app.use('/api/subscriptions', subscriptionRoutes); 
app.use('/api/bank', bankRoutes); 

// Error handling middleware
app.use(errorHandler);

// Start server only when not running tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    }
  });
}

export default app;