import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AnalyticsLoading from './AnalyticsLoading';
import forecastAnimation from '../../assets/forecast-loading.json';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SpendingForecasts = ({ forecasts, loading }) => {
  if (loading) {
    return <AnalyticsLoading 
      animationData={forecastAnimation}
      title="Predicting Future Expenses"
      description="Our AI is creating financial forecasts based on your spending history..."
    />;
  }
  
  if (!forecasts || forecasts.length === 0) {
    return <div>No forecast data available. Continue tracking expenses to improve predictions.</div>;
  }
  
  // Prepare chart data
  const prepareChartData = () => {
    const labels = forecasts.map(forecast => forecast.displayMonth);
    const datasets = [
      {
        label: 'Forecasted Total Spending',
        data: forecasts.map(forecast => forecast.total),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ];
    
    return { labels, datasets };
  };
  
  const chartData = prepareChartData();
  
  // Find categories to display in the detailed forecast
  const getCategoriesToShow = () => {
    if (!forecasts || forecasts.length === 0) return [];
    
    // Get all categories from the first forecast
    const allCategories = Object.keys(forecasts[0].categories);
    
    // Sort categories by forecasted amount in the first month
    return allCategories
      .sort((a, b) => forecasts[0].categories[b] - forecasts[0].categories[a])
      .slice(0, 5); // Show top 5 categories
  };
  
  const topCategories = getCategoriesToShow();
  
  return (
    <div className="spending-forecasts">
      <div className="forecast-header">
        <h3>Expense Forecasts for the Next {forecasts.length} Months</h3>
        <p>Based on your historical spending patterns, here's what we predict for your future expenses:</p>
      </div>
      
      <div className="chart-container">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Monthly Spending Forecast'
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
      </div>
      
      <div className="detailed-forecasts">
        <h3>Category Forecasts</h3>
        <table className="forecast-table">
          <thead>
            <tr>
              <th>Category</th>
              {forecasts.map((forecast, i) => (
                <th key={i}>{forecast.displayMonth}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topCategories.map((category, index) => (
              <tr key={index}>
                <td>{category}</td>
                {forecasts.map((forecast, i) => (
                  <td key={i} className={forecast.categories[category] > 100 ? "high-amount" : ""}>
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(forecast.categories[category])}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Total</strong></td>
              {forecasts.map((forecast, i) => (
                <td key={i}><strong>
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(forecast.total)}
                </strong></td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="forecast-note">
          <p>Note: These forecasts are based on your historical spending patterns and may vary based on actual spending behavior.</p>
        </div>
      </div>
    </div>
  );
};

export default SpendingForecasts;