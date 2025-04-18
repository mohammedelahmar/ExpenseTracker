import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './components/NotFound';
import ReportList from './components/ReportList';
import ReportView from './components/ReportView';
import WelcomePage from './pages/WelcomePage';
import Analytics from './pages/Analytics'; // Add this import
import Goals from './pages/Goals'; // Add this import
import AddGoal from './pages/AddGoal'; // Add this import
import EditGoal from './pages/EditGoal'; // Add this import
import { useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext'; // Add this import
import EditExpense from './components/EditExpense';
import './styles/analytics.css';

function App() {
  const { user, isLoading } = useAuth();

  // Protected route component using AuthContext
  const ProtectedRoute = ({ children }) => {
    if (isLoading) return <div className="container">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <AnalyticsProvider> {/* Wrap routes that need analytics */}
          <Routes>
            {/* Public Route - Welcome page */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <WelcomePage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard"  element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
              } />
            
            {/* Expense Routes */}
            <Route path="/expenses" element={
              <ProtectedRoute>
                <ExpenseList />
              </ProtectedRoute>
            } />
            <Route path="/expenses/add" element={
              <ProtectedRoute>
                <ExpenseForm />
              </ProtectedRoute>
            } />
            <Route path="/expenses/edit/:id" element={
              <ProtectedRoute>
                <EditExpense />
              </ProtectedRoute>
            } />
            {/* Categories Routes */}
            <Route path="/categories" element={
              <ProtectedRoute>
                <CategoryList />
              </ProtectedRoute>
            } />
            <Route path="/categories/add" element={
              <ProtectedRoute>
                <CategoryForm />
              </ProtectedRoute>
            }/>
            <Route path="/categories/edit/:id" element={
              <ProtectedRoute>
                <CategoryForm />
              </ProtectedRoute>
            }/>
            {/* Reports Routes */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportList />
              </ProtectedRoute>
            } />
            <Route path="/reports/:id" element={
              <ProtectedRoute>
                <ReportView />
              </ProtectedRoute>
            } />
            
            {/* Analytics Route - New */}
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            
            {/* Goals Routes - New */}
            <Route path="/goals" element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            } />
            <Route path="/goals/add" element={
              <ProtectedRoute>
                <AddGoal />
              </ProtectedRoute>
            } />
            <Route path="/goals/edit/:id" element={
              <ProtectedRoute>
                <EditGoal />
              </ProtectedRoute>
            } />
            
            {/* Auth Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnalyticsProvider>
      </div>
    </>
  );
}

export default App;