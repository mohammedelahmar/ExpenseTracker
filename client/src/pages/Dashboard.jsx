import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import expenseService from '../services/expenseService';
import { Bar, Pie } from 'react-chartjs-2';
import Lottie from 'lottie-react';
import GoalsSummary from '../components/goals/GoalsSummary.jsx';
import SubscriptionsSummary from '../components/subscriptions/SubscriptionsSummary';
// import '../styles/Dashboard.css'; // Removed
import { 
  Calendar, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  CreditCard, 
  Wallet, 
  PieChart, 
  Activity,
  DollarSign,
  ChevronRight,
  Landmark
} from 'lucide-react';
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
        // Continue with other fetches
      }

      // Fetch monthly chart data
      try {
        const monthlyData = await expenseService.getChartData('monthly', {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        
        if (monthlyData && Array.isArray(monthlyData.labels) && Array.isArray(monthlyData.data)) {
          setMonthlyChartData(monthlyData);
        } else {
          setMonthlyChartData({ labels: [], data: [] });
        }
      } catch (monthlyError) {
        setMonthlyChartData({ labels: [], data: [] });
      }

      // Fetch category chart data
      try {
        const categoryData = await expenseService.getChartData('category', {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        
        if (categoryData && Array.isArray(categoryData.labels) && Array.isArray(categoryData.data)) {
          setCategoryChartData(categoryData);
        } else {
          setCategoryChartData({ labels: [], data: [] });
        }
      } catch (categoryError) {
        setCategoryChartData({ labels: [], data: [] });
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Track viewport size to adjust chart options responsively
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  const handlePresetRange = (preset) => {
    const today = new Date();
    let startDate, endDate;
    
    switch(preset) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(today);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case 'year':
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
    // Fetch data is triggered by effect, but specific logic might need manual trigger if effect dep is only dateRange object ref
    // Here fetchDashboardData is in dependency array of useEffect watching dateRange, so it should trigger.
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
  const barChartData = useMemo(() => ({
    labels: monthlyChartData.labels || [],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlyChartData.data || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500 equivalent
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  }), [monthlyChartData.labels, monthlyChartData.data]);

  // Chart options
  const barChartOptions = useMemo(() => ({
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    layout: {
      padding: { top: 10, bottom: 10, left: 10, right: 10 }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          },
          font: { size: isMobile ? 10 : 12 }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: isMobile ? 10 : 12 },
          maxRotation: isMobile ? 45 : 0
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: isMobile ? 11 : 13 },
          padding: 15,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return 'Amount: $' + context.parsed.y.toLocaleString();
          }
        }
      }
    }
  }), [isMobile]);

  // Prepare pie chart data
  const pieChartData = useMemo(() => ({
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
  }), [categoryChartData.labels, categoryChartData.data]);

  // Pie chart options
  const pieChartOptions = useMemo(() => ({
    maintainAspectRatio: false,
    responsive: true,
    interaction: { intersect: false },
    layout: { padding: { top: 10, bottom: 10, left: 10, right: 10 } },
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        display: true,
        labels: {
          font: { size: isMobile ? 10 : 12 },
          padding: isMobile ? 10 : 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const dataArr = Array.isArray(context?.dataset?.data) ? context.dataset.data : [];
            const total = dataArr.reduce((a, b) => a + (Number(b) || 0), 0);
            const value = Number(context.parsed) || 0;
            const percentage = total ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  }), [isMobile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Lottie 
          animationData={require('../assets/dashboard-loading.json')} 
          loop={true} 
          style={{ width: 180, height: 180 }}
        />
        <h2 className="text-2xl font-bold text-primary-600 mt-4">
          Preparing your financial insights
        </h2>
        <p className="text-gray-500 mt-2">
          Just a moment while we analyze your data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Dashboard Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 relative inline-block">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-sky-500">
            Dashboard
          </span>
        </h1>
        <p className="text-gray-500 font-medium">
          Showing data for <span className="text-gray-800 font-semibold">{formatDate(dateRange.startDate)}</span> to <span className="text-gray-800 font-semibold">{formatDate(dateRange.endDate)}</span>
        </p>
      </div>
      
      {/* Date Range Picker */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-shadow hover:shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-primary-500" size={20} />
              Date Range
            </h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handlePresetRange('week')} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">This Week</button>
              <button onClick={() => handlePresetRange('month')} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">This Month</button>
              <button onClick={() => handlePresetRange('year')} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">This Year</button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">From</span>
                <input
                  type="date"
                  name="startDate"
                  className="w-full sm:w-40 pl-12 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <span className="text-gray-400 font-medium">to</span>
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">To</span>
                <input
                  type="date"
                  name="endDate"
                  className="w-full sm:w-40 pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-sky-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Search size={16} /> Apply
            </button>
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wallet size={16} className="text-blue-500" /> Total Expenses
          </p>
          <p className={`text-3xl font-black ${stats.totalExpenses > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
            {formatCurrency(stats.totalExpenses)}
          </p>
          <div className="mt-4 text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md">
             Total for period
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-500"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
             <Activity size={16} className="text-cyan-500" /> Monthly Avg
          </p>
          <p className="text-3xl font-black text-gray-900">
            {formatCurrency(stats.monthlyExpenses)}
          </p>
          <div className="mt-4 text-xs font-medium text-cyan-600 bg-cyan-50 inline-block px-2 py-1 rounded-md">
             Based on history
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
             <TrendingDown size={16} className="text-amber-500" /> Avg Transaction
          </p>
          <p className="text-3xl font-black text-gray-900">
            {formatCurrency(stats.averageExpense)}
          </p>
          <div className="mt-4 text-xs font-medium text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded-md">
             Per expense
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
             <TrendingUp size={16} className="text-emerald-500" /> Count
          </p>
          <p className="text-3xl font-black text-gray-900">
            {stats.expenseCount}
          </p>
          <div className="mt-4 text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md">
             Transactions
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-50">Monthly Expenses</h3>
          <div className="flex-1 relative w-full h-full min-h-[300px]">
             <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-50">Expenses by Category</h3>
          <div className="flex-1 relative w-full h-full min-h-[300px]">
             <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Financial Goals Section */}
        <div className="h-full">
          <GoalsSummary />
        </div>
        
        {/* Subscriptions */}
        <div className="h-full">
          <SubscriptionsSummary />
        </div>
      </div>
      
      {/* Recent Expenses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12" data-testid="recent-expenses">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Expenses</h3>
          <Link to="/expenses" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {recentExpenses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No recent expenses recorded.</p>
            <Link to="/expenses/add" className="inline-flex items-center gap-2 px-6 py-2 bg-primary-50 text-primary-600 font-medium rounded-full hover:bg-primary-100 transition-colors">
              Add Your First Expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentExpenses.map(expense => (
                  <tr key={expense._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-500">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Connect Bank CTA */}
      <div className="flex justify-center mb-12">
        <Link 
          to="/bank-connections" 
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Landmark size={20} className="text-emerald-400" />
          <span>Connect Bank Accounts</span>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
