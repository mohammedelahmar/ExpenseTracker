import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import AnalyticsLoading from './AnalyticsLoading';
import trendsAnimation from '../../assets/dashboard-loading.json';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SpendingTrends = ({ trends, loading }) => {
  const [period, setPeriod] = useState('month');
  const [limit, setLimit] = useState(6);
  
  if (loading) {
    return <AnalyticsLoading 
      animationData={trendsAnimation}
      title="Analyzing Your Spending Patterns"
      description="We're crunching your transaction data to reveal meaningful trends..."
    />;
  }
  
  if (!trends) {
    return <div>No trend data available</div>;
  }
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!trends.periodData) return null;
    
    const periods = Object.keys(trends.periodData).sort();
    const categories = trends.categories || [];
    
    // Generate random pastel colors for categories
    const generatePastelColor = (index) => {
      const hue = index * 137.5 % 360;
      return `hsla(${hue}, 70%, 80%, 0.7)`;
    };
    
    // Prepare datasets
    const datasets = categories.map((category, index) => {
      return {
        label: category,
        data: periods.map(period => trends.periodData[period][category] || 0),
        fill: false,
        backgroundColor: generatePastelColor(index),
        borderColor: generatePastelColor(index).replace('0.7', '1'),
        tension: 0.1
      };
    });
    
    return {
      labels: periods.map(p => {
        if (period === 'month') {
          const [year, month] = p.split('-');
          return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1]} ${year}`;
        }
        return p;
      }),
      datasets
    };
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
          <select value={limit} onChange={(e) => setLimit(e.target.value)}>
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
              plugins: {
                title: {
                  display: true,
                  text: `Spending Trends by Category (Last ${limit} ${period}s)`
                },
                legend: {
                  position: 'bottom'
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: 'USD' 
                        }).format(context.parsed.y);
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
                    callback: function(value) {
                      return '$' + value;
                    }
                  }
                }
              }
            }}
          />
        ) : (
          <p>Not enough data to display trends</p>
        )}
      </div>
      
      {trends.topSpendingCategories && trends.topSpendingCategories.length > 0 && (
        <div className="insights-section">
          <h3>Top Spending Categories</h3>
          <div className="insights-cards">
            {trends.topSpendingCategories.map((category, index) => (
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