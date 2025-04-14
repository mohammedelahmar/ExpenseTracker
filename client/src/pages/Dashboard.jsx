import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import expenseService from '../services/expenseService';
import { Bar, Pie } from 'react-chartjs-2';
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
import '../styles/Dashboard.css';

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
        
        // Make sure we have valid data structure even if API returns incomplete data
        setMonthlyChartData({
          labels: monthlyData?.labels || [],
          data: monthlyData?.data || []
        });
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
        
        // Make sure we have valid data structure even if API returns incomplete data
        setCategoryChartData({
          labels: categoryData?.labels || [],
          data: categoryData?.data || []
        });
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
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare pie chart data
  const pieChartData = {
    labels: categoryChartData.labels || [],
    datasets: [
      {
        data: categoryChartData.data || [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC249', '#EA5545', '#C5B0D5', '#7DB8A4'
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="container">
        <div className="dashboard">
          <div className="loading">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="dashboard">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-date">
            Showing data from {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
          </p>
        </div>

        <div className="dashboard-filters card">
          <div className="filter-row">
            <div className="filter-item">
              <label className="filter-label" htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="filter-item">
              <label className="filter-label" htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>

        <div className="stats-container">
          <div className="stats-card primary">
            <h3 className="stats-card-title">Total Expenses</h3>
            <div className="stats-card-value">{formatCurrency(stats.totalExpenses)}</div>
            <div className="stats-card-info">For selected period</div>
          </div>
          
          <div className="stats-card success">
            <h3 className="stats-card-title">Monthly Average</h3>
            <div className="stats-card-value">{formatCurrency(stats.monthlyExpenses)}</div>
            <div className="stats-card-info">Per month</div>
          </div>
          
          <div className="stats-card warning">
            <h3 className="stats-card-title">Average Expense</h3>
            <div className="stats-card-value">{formatCurrency(stats.averageExpense)}</div>
            <div className="stats-card-info">Per transaction</div>
          </div>
          
          <div className="stats-card danger">
            <h3 className="stats-card-title">Transaction Count</h3>
            <div className="stats-card-value">{stats.expenseCount}</div>
            <div className="stats-card-info">Total transactions</div>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-container card">
            <h3>Monthly Expenses</h3>
            <div style={{ height: '300px' }}>
              <Bar 
                data={barChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount ($)'
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="chart-container card">
            <h3>Expenses by Category</h3>
            <div style={{ height: '300px' }}>
              <Pie 
                data={pieChartData} 
                options={{ 
                  maintainAspectRatio: false 
                }} 
              />
            </div>
          </div>
        </div>

        <div className="recent-expenses card">
          <div className="recent-expenses-header">
            <h2 className="recent-expenses-title">Recent Expenses</h2>
            <Link to="/expenses" className="btn btn-primary">View All</Link>
          </div>
          
          <div className="expenses-table-container">
            {recentExpenses.length === 0 ? (
              <p>No expenses recorded yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map(expense => (
                    <tr key={expense._id}>
                      <td>{expense.description}</td>
                      <td>
                        <span className="expense-category">{expense.category}</span>
                      </td>
                      <td className="expense-date">{formatDate(expense.date)}</td>
                      <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;