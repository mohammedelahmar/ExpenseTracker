import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import expenseService from '../services/expenseService';
import { Bar, Pie } from 'react-chartjs-2';
import Lottie from 'lottie-react';
import GoalsSummary from '../components/goals/GoalsSummary.jsx';
import SubscriptionsSummary from '../components/subscriptions/SubscriptionsSummary';
import '../styles/Dashboard.css'; // Add this import for custom styles
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    averageExpense: 0,
    expenseCount: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [monthlyChartData, setMonthlyChartData] = useState({ labels: [], data: [] });
  const [categoryChartData, setCategoryChartData] = useState({ labels: [], data: [] });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch expense stats
      try {
        const statsData = await expenseService.getExpenseStats({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        setStats(statsData);
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        // Continue with other fetches even if stats fail
      }

      // Fetch recent expenses
      try {
        const expensesData = await expenseService.fetchExpenses({
          limit: 5,
          sortBy: 'date:desc'
        });
        setRecentExpenses(expensesData.expenses || []);
      } catch (expensesError) {
        console.error('Error fetching recent expenses:', expensesError);
        // Continue with other fetches
      }

      // Fetch monthly chart data
      try {
        const monthlyData = await expenseService.getChartData('monthly', {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        
        // Make sure we have valid data structure with explicit checking
        if (monthlyData && Array.isArray(monthlyData.labels) && Array.isArray(monthlyData.data)) {
          setMonthlyChartData(monthlyData);
        } else {
          console.error('Invalid monthly chart data format:', monthlyData);
          // Set default empty structure with proper types
          setMonthlyChartData({ labels: [], data: [] });
        }
      } catch (monthlyError) {
        console.error('Error fetching monthly chart data:', monthlyError);
        // Reset to empty data on error
        setMonthlyChartData({ labels: [], data: [] });
      }

      // Fetch category chart data
      try {
        const categoryData = await expenseService.getChartData('category', {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        
        // Make sure we have valid data structure with explicit checking
        if (categoryData && Array.isArray(categoryData.labels) && Array.isArray(categoryData.data)) {
          setCategoryChartData(categoryData);
        } else {
          console.error('Invalid category chart data format:', categoryData);
          // Set default empty structure with proper types
          setCategoryChartData({ labels: [], data: [] });
        }
      } catch (categoryError) {
        console.error('Error fetching category chart data:', categoryError);
        // Reset to empty data on error
        setCategoryChartData({ labels: [], data: [] });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  // Add this function to handle preset date ranges
  const handlePresetRange = (preset) => {
    const today = new Date();
    let startDate, endDate;
    
    switch(preset) {
      case 'week':
        // Start of current week (Sunday)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(today);
        break;
      case 'month':
        // Start of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case 'year':
        // Start of current year
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today);
        break;
      default:
        startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        endDate = new Date();
    }
    
    const newDateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    setDateRange(newDateRange);
    // Fetch data with new date range
    setTimeout(() => fetchDashboardData(), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare bar chart data
  const barChartData = {
    labels: monthlyChartData.labels || [],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlyChartData.data || [],
        backgroundColor: 'rgba(67, 97, 238, 0.6)',
        borderColor: 'rgba(67, 97, 238, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(67, 97, 238, 0.8)',
      },
    ],
  };

  // Prepare pie chart data with more attractive colors
  const pieChartData = {
    labels: categoryChartData.labels || [],
    datasets: [
      {
        data: categoryChartData.data || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(231, 76, 60, 0.7)',
          'rgba(142, 68, 173, 0.7)',
          'rgba(241, 196, 15, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(142, 68, 173, 1)',
          'rgba(241, 196, 15, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <Lottie 
            animationData={require('../assets/dashboard-loading.json')} 
            loop={true} 
            style={{ width: 180, height: 180 }}
          />
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600',
            color: '#4361ee',
            margin: '1rem 0 0.5rem' 
          }}>
            Preparing your financial insights
          </h2>
          <p style={{ color: '#586069', fontSize: '1rem' }}>
            Just a moment while we analyze your data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Dashboard Header */}
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Showing data from {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
        </p>
        
        {/* Modern Date Range Picker */}
        <div className="date-range-container">
          <div className="date-range-header">
            <h3>Date Range</h3>
            <div className="date-range-presets">
              <button type="button" onClick={() => handlePresetRange('week')} className="preset-btn">This Week</button>
              <button type="button" onClick={() => handlePresetRange('month')} className="preset-btn">This Month</button>
              <button type="button" onClick={() => handlePresetRange('year')} className="preset-btn">This Year</button>
            </div>
          </div>
          <div className="date-range-inputs">
            <div className="date-input-group">
              <label className="date-label" htmlFor="startDate">
                <i className="fas fa-calendar-alt"></i> From
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="date-input"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="date-divider">
              <span className="date-to">to</span>
            </div>
            <div className="date-input-group">
              <label className="date-label" htmlFor="endDate">
                <i className="fas fa-calendar-alt"></i> To
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="date-input"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
            <button type="button" className="date-apply-btn" onClick={fetchDashboardData}>
              <i className="fas fa-search"></i> Apply
            </button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="stats-container">
          <div className="stats-card primary">
            <h3 className="stats-card-title">Total Expenses</h3>
            <p className="stats-card-value danger">{formatCurrency(stats.totalExpenses)}</p>
          </div>
          
          <div className="stats-card secondary">
            <h3 className="stats-card-title">Monthly Average</h3>
            <p className="stats-card-value primary">{formatCurrency(stats.monthlyExpenses)}</p>
          </div>
          
          <div className="stats-card warning">
            <h3 className="stats-card-title">Average Expense</h3>
            <p className="stats-card-value warning">{formatCurrency(stats.averageExpense)}</p>
          </div>
          
          <div className="stats-card success">
            <h3 className="stats-card-title">Transaction Count</h3>
            <p className="stats-card-value success">{stats.expenseCount}</p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-container">
            <h3>Monthly Expenses</h3>
            <div className="chart-wrapper">
              <Bar 
                data={barChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  layout: {
                    padding: {
                      bottom: 10
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true
                      },
                      ticks: {
                        callback: function(value) {
                          return '$' + value;
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="chart-container">
            <h3>Expenses by Category</h3>
            <div className="chart-wrapper">
              <Pie 
                data={pieChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  layout: {
                    padding: 20
                  },
                  plugins: {
                    legend: {
                      position: 'right',
                      display: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
        
        {/* Add clear separator to ensure proper spacing */}
        <div style={{ clear: 'both', margin: '3rem 0' }}></div>
        
        {/* Financial Goals Section with dedicated class */}
        <div className="dashboard-section financial-goals-section">
          <h3 className="section-title">Financial Goals</h3>
          <GoalsSummary />
        </div>
        
        {/* Subscriptions */}
        <div className="dashboard-section">
          <h3 className="section-title">Upcoming Subscriptions</h3>
          <SubscriptionsSummary />
        </div>
        
        {/* Recent Expenses Table */}
        <div className="recent-expenses">
          <div className="recent-expenses-header">
            <h3 className="recent-expenses-title">Recent Expenses</h3>
            <Link to="/expenses" className="btn btn-primary">
              View All
            </Link>
          </div>
          
          {recentExpenses.length === 0 ? (
            <p className="no-data-message">No expenses recorded yet.</p>
          ) : (
            <div className="expenses-table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map(expense => (
                    <tr key={expense._id}>
                      <td>{expense.description}</td>
                      <td>{expense.category}</td>
                      <td>{formatDate(expense.date)}</td>
                      <td style={{ textAlign: 'right', color: '#d32f2f', fontWeight: 500 }}>{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Connect Bank CTA */}
        <div className="bank-connections-link">
          <Link to="/bank-connections" className="btn btn-primary">
            <span className="bank-icon">🏦</span> Connect Bank Accounts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;