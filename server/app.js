//Express server setup 
// This file sets up an Express server that serves static files from a 'public' directory.
// It uses middleware for parsing JSON and URL-encoded data, and it defines a route for the root URL.
// It also handles errors and starts the server on a specified port.
// Importing required modules
import express from 'express';
import connectDB from './config/db.js'; // Added .js extension
import dotenv from 'dotenv';
import cors from 'cors';

// Import routes
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount route files
app.use('/api/users', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});