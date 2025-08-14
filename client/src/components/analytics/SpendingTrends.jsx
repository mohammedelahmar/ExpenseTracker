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
  // Only depend on period/limit to avoid re-running when function identity changes
  }, [period, limit]);

  if (isLoading) {
    return <AnalyticsLoading 
      animationData={trendsAnimation}
      title="Analyzing Your Spending Patterns"
      description="We're crunching your transaction data to reveal meaningful trends..."
    />;
  }

  if (!data) {
    return <div>No trend data available</div>;
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
    <div className="spending-trends">
      <div className="controls">
        <div className="form-group">
          <label>Time Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label>Limit:</label>
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))}>
            <option value="3">Last 3 {period}s</option>
            <option value="6">Last 6 {period}s</option>
            <option value="12">Last 12 {period}s</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: `Spending Trends by Category (Last ${limit} ${period}s)`
                },
                legend: { position: 'bottom' },
                tooltip: {
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
                  ticks: {
                    callback: function(value) { return '$' + value; }
                  }
                }
              }
            }}
          />
        ) : (
          <p>Not enough data to display trends</p>
        )}
      </div>

      {data.topSpendingCategories && data.topSpendingCategories.length > 0 && (
        <div className="insights-section">
          <h3>Top Spending Categories</h3>
          <div className="insights-cards">
            {data.topSpendingCategories.map((category, index) => (
              <div className="insight-card" key={index}>
                <h4>{category.name}</h4>
                <p className="amount">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(category.average)}</p>
                <p>Average per {period}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingTrends;