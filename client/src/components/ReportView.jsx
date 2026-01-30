import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Filter, 
  DollarSign, 
  Tags, 
  Receipt, 
  PieChart, 
  List, 
  Loader2, 
  ArrowLeft,
  AlertCircle,
  Info
} from 'lucide-react';
// import '../styles/ReportView.css'; // Removed

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportView = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/reports/${id}`;
      let params = {};
      
      if (id === 'by-category' && dateRange.startDate && dateRange.endDate) {
        params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
      } else if (id === 'monthly') {
        params = { year };
      }
      
      const response = await api.get(url, { params });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [id, dateRange.startDate, dateRange.endDate, year]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary-500" size={48} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={24} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      );
    }

    switch (id) {
      case 'by-category':
        return renderCategoryReport();
      case 'monthly':
        return renderMonthlyReport();
      case 'trends':
        return renderTrendsReport();
      default:
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-500 mr-2" size={24} />
              <p className="text-yellow-700">Unknown report type</p>
            </div>
          </div>
        );
    }
  };

  const renderCategoryReport = () => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <Info className="text-blue-500 mr-2" size={24} />
            <p className="text-blue-700">No expense data available for the selected period</p>
          </div>
        </div>
      );
    }

    // Calculate total amount for percentage calculations
    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

    // Prepare chart data
    const chartData = {
      labels: data.map(item => item._id || 'Uncategorized'),
      datasets: [
        {
          data: data.map(item => item.total),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'
          ],
          borderWidth: 0,
          hoverBorderWidth: 3,
          hoverBorderColor: '#ffffff',
        },
      ],
    };

    return (
      <>
        <form onSubmit={handleFilter} className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>
            <div>
              <button 
                type="submit" 
                className="w-full py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Filter size={18} />
                Apply Filter
              </button>
            </div>
          </div>
        </form>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg shadow-blue-500/10 border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">${totalAmount.toFixed(2)}</h3>
              <p className="text-gray-500 text-sm">Total Expenses</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg shadow-purple-500/10 border border-purple-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Tags size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{data.length}</h3>
              <p className="text-gray-500 text-sm">Categories</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg shadow-emerald-500/10 border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{data.reduce((sum, item) => sum + item.count, 0)}</h3>
              <p className="text-gray-500 text-sm">Total Transactions</p>
            </div>
          </div>
        </div>
        
        {/* Chart and Table Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <PieChart size={20} className="text-primary-500" />
                <h5 className="font-semibold text-gray-800">Expense Distribution</h5>
              </div>
              <div className="p-4 h-[350px]">
                <Pie 
                  data={chartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          usePointStyle: true,
                          font: {
                            size: 11,
                            family: "inherit"
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <List size={20} className="text-emerald-500" />
                <h5 className="font-semibold text-gray-800">Expense Breakdown by Category</h5>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-right">%</th>
                      <th className="px-6 py-3 text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data
                      .sort((a, b) => b.total - a.total)
                      .map((item, index) => {
                        const percentage = ((item.total / totalAmount) * 100).toFixed(1);
                        const colors = [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                          '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'
                        ];
                        const color = colors[index % colors.length];
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-3 shrink-0"
                                  style={{ backgroundColor: color }}
                                ></div>
                                <div>
                                  <span className="font-medium text-gray-900 block">{item._id || 'Uncategorized'}</span>
                                  <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full"
                                      style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: color
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-800">
                              ${item.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600">
                                {percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-600">
                              {item.count}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderMonthlyReport = () => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <Info className="text-blue-500 mr-2" size={24} />
            <p className="text-blue-700">No expense data available for the selected year</p>
          </div>
        </div>
      );
    }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Prepare chart data
    const chartData = {
      labels: months,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: data.map(item => item.total),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    return (
      <>
        <form onSubmit={handleFilter} className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>
            <div>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </form>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 h-[400px]">
          <Bar data={chartData} options={{ 
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Amount ($)'
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true
                }
              }
            }
          }} />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-800">
            Monthly Expense Summary for {year}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Month</th>
                  <th className="px-6 py-3 text-right">Total Expenses</th>
                  <th className="px-6 py-3 text-right">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{months[item.month - 1]}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">${item.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderTrendsReport = () => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <Info className="text-blue-500 mr-2" size={24} />
            <p className="text-blue-700">No trend data available</p>
          </div>
        </div>
      );
    }

    const categories = [...new Set(data.map(item => item._id.category || 'Uncategorized'))];
    const months = [...new Set(data.map(item => `${item._id.year}-${item._id.month}`))].sort();
    
    const datasets = categories.map((category, index) => {
      const categoryData = months.map(month => {
        const [year, monthNum] = month.split('-');
        const dataPoint = data.find(item => 
          item._id.category === category && 
          item._id.year === parseInt(year) && 
          item._id.month === parseInt(monthNum)
        );
        return dataPoint ? dataPoint.total : 0;
      });
      
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC249', '#EA5545', '#C5B0D5', '#7DB8A4'
      ];
      const color = colors[index % colors.length];
      
      return {
        label: category,
        data: categoryData,
        borderColor: color,
        backgroundColor: color + '33',
        tension: 0.1
      };
    });
    
    const chartData = {
      labels: months.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets
    };

    return (
      <>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[500px] mb-6">
          <Line data={chartData} options={{ 
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Value'
                }
              }
            }
          }} />
        </div>
        
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800">
          <strong className="font-semibold block mb-2">About this report:</strong> 
          This chart shows how your spending across different categories has changed over the past 6 months, helping you identify trends in your financial habits.
        </div>
      </>
    );
  };

  const getReportTitle = () => {
    switch (id) {
      case 'by-category': return 'Expenses by Category';
      case 'monthly': return 'Monthly Expenses Summary';
      case 'trends': return 'Expense Trends Analysis';
      default: return 'Report';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{getReportTitle()}</h1>
        <Link 
          to="/reports" 
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:text-primary-600 border border-gray-200 hover:border-primary-200 rounded-lg shadow-sm transition-all text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </Link>
      </div>
      
      {renderReportContent()}
    </div>
  );
};

export default ReportView;