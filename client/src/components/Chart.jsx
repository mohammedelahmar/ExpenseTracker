import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import expenseService from '../services/expenseService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Chart = ({ chartType, period, customFilters }) => {
  const { user } = useContext(AuthContext);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // chart.jsx - Update fetchChartData
const fetchChartData = useCallback(async () => {
  setLoading(true);
  setError('');

  try {
    const data = await expenseService.getChartData(period, customFilters);
    console.log('Chart Data Response:', data); // Add logging
    setChartData(data);
    setLoading(false);
  } catch (err) {
    console.error('Chart Error Details:', err.message, err.response?.data);
    setError(err.message || 'Failed to load chart data');
    setLoading(false);
  }
}, [period, customFilters]);

  useEffect(() => {
    if (user) {
      fetchChartData();
    }
  }, [user, fetchChartData]);

  if (loading) {
    return <div className="chart-loading">Loading chart...</div>;
  }

  if (error) {
    return <div className="chart-error">{error}</div>;
  }

  if (!chartData || !chartData.labels || !chartData.data) {
    return <div className="chart-no-data">No data available for the selected period</div>;
  }

  // For demonstration purposes - creating sample chart data structure
  const colors = [
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)'
  ];

  // Format data for the chart
  const formattedChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: period === 'monthly' ? 'Monthly Expenses' : 'Expenses by Category',
        data: chartData.data,
        backgroundColor: colors.slice(0, chartData.data.length),
        borderColor: colors.map(color => color.replace('0.6', '1')),
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: period === 'monthly' ? 'Monthly Expenses' : 'Expenses by Category',
        font: {
          size: 16
        }
      }
    }
  };

  return (
    <div className="chart-wrapper" style={{ height: '300px' }}>
      {chartType === 'bar' && <Bar data={formattedChartData} options={options} />}
      {chartType === 'pie' && <Pie data={formattedChartData} options={options} />}
    </div>
  );
};

export default Chart;