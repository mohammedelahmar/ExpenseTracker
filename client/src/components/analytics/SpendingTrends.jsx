import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import AnalyticsLoading from './AnalyticsLoading';
import trendsAnimation from '../../assets/dashboard-loading.json';
import { useAnalytics } from '../../context/AnalyticsContext.jsx';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SpendingTrends = ({ trends, loading }) => {
  const [period, setPeriod] = useState('month');
  const [limit, setLimit] = useState(6);

  const analytics = useAnalytics?.();
  const fetchTrends = analytics?.fetchTrends;
  const ctxTrends = analytics?.trends;
  const ctxLoading = analytics?.loading?.trends;

  // Prefer props if provided, else fallback to context
  const data = trends ?? ctxTrends;
  const isLoading = loading ?? ctxLoading;

  // Refetch when filters change
  useEffect(() => {
    if (typeof fetchTrends === 'function') {
      fetchTrends(period, Number(limit)).catch(() => {});
    }
  }, [period, limit, fetchTrends]);

  if (isLoading) {
    return <AnalyticsLoading 
      animationData={trendsAnimation}
      title="Analyzing Your Spending Patterns"
      description="We're crunching your transaction data to reveal meaningful trends..."
    />;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">No trend data available</div>;
  }

  // Prepare chart data using API-provided keys/labels to preserve order
  const prepareChartData = () => {
    if (!data.periodData) return null;

    const periods = (data.periodKeys && data.periodKeys.length > 0)
      ? data.periodKeys
      : Object.keys(data.periodData).sort();

    const labels = (data.periodLabels && data.periodLabels.length === periods.length)
      ? data.periodLabels
      : periods.map(p => {
          if (period === 'month') {
            const [year, month] = p.split('-');
            return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1]} ${year}`;
          }
          return p;
        });

    const categories = data.categories || [];
    const generatePastelColor = (index) => {
      const hue = index * 137.5 % 360;
      return `hsla(${hue}, 70%, 80%, 0.7)`;
    };

    const datasets = categories.map((category, index) => {
      const bg = generatePastelColor(index);
      return {
        label: category,
        data: periods.map(periodKey => data.periodData[periodKey][category] || 0),
        fill: false,
        backgroundColor: bg,
        borderColor: bg.replace('0.7', '1'),
        tension: 0.1
      };
    });

    return { labels, datasets };
  };

  const chartData = prepareChartData();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-2 min-w-[160px] flex-1 sm:flex-none">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Time Period</label>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer hover:bg-white"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[160px] flex-1 sm:flex-none">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Limit</label>
          <select 
            value={limit} 
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer hover:bg-white"
          >
            <option value="3">Last 3 {period}s</option>
            <option value="6">Last 6 {period}s</option>
            <option value="12">Last 12 {period}s</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[500px] relative">
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: `Spending Trends by Category (Last ${limit} ${period}s)`,
                  font: { size: 16, weight: 'bold' },
                  color: '#1f2937',
                  padding: { bottom: 20 }
                },
                legend: { 
                  position: 'bottom',
                  labels: { usePointStyle: true, padding: 20 }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  cornerRadius: 8,
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) label += ': ';
                      if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                      }
                      return label;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.05)' },
                  ticks: {
                    callback: function(value) { return '$' + value; },
                    font: { size: 11 }
                  }
                },
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 11 } }
                }
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Not enough data to display trends</div>
        )}
      </div>

      {data.topSpendingCategories && data.topSpendingCategories.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Top Spending Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.topSpendingCategories.map((category, index) => (
              <div 
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group" 
                key={index}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wide mb-2">{category.name}</h4>
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500 my-3">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(category.average)}
                </p>
                <p className="text-gray-500 font-medium">Average per {period}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingTrends;