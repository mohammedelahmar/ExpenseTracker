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
import analyticsRoutes from './routes/analyticsRoutes.js';  // Add this line
import goalRoutes from './routes/goalRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test route to verify routing is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

// Mount route files
app.use('/api/users', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/analytics', analyticsRoutes);  // Add this line
app.use('/api/goals', goalRoutes);

// Error handling middleware
app.use(errorHandler);

// Log available routes for debugging - moved here
console.log('Available routes:');
if (app._router) {
  const routes = [...app._router.stack]
    .filter(r => r.route)
    .map(r => r.route.path)
    .concat(
      [...app._router.stack]
        .filter(r => r.name === 'router' && r.handle)
        .flatMap(r => {
          if (!r.handle || !r.handle.stack) return [];
          
          return r.handle.stack
            .filter(s => s && s.route)
            .map(s => {
              if (r.regexp && r.regexp.toString().includes('api\\\\([^\\\\/]*)')) {
                const match = r.regexp.toString().match(/api\\\\([^\\\\/]*)/);
                if (match && match[1]) {
                  return `/api/${match[1]}${s.route.path}`;
                }
              }
              return s.route.path;
            });
        })
    );
  console.log(routes);
} else {
  console.log('Router not initialized yet');
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});