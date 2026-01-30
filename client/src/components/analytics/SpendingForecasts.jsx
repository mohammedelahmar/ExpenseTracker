import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AnalyticsLoading from './AnalyticsLoading';
import forecastAnimation from '../../assets/dashboard-loading.json';

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
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">No forecast data available. Continue tracking expenses to improve predictions.</div>;
  }
  
  // Prepare chart data
  const prepareChartData = () => {
    const labels = forecasts.map(forecast => forecast.displayMonth);
    const datasets = [
      {
        label: 'Forecasted Total Spending',
        data: forecasts.map(forecast => forecast.total),
        backgroundColor: 'rgba(56, 189, 248, 0.6)', // sky-400
        borderColor: 'rgba(14, 165, 233, 1)', // sky-500
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(14, 165, 233, 0.8)',
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Expense Forecasts for the Next {forecasts.length} Months</h3>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Based on your historical spending patterns, here's what we predict for your future expenses:</p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] relative">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 20 }
              },
              title: {
                display: true,
                text: 'Monthly Spending Forecast',
                font: { size: 16, weight: 'bold' },
                padding: { bottom: 20 },
                color: '#1f2937'
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
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
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Category Forecasts</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 first:rounded-tl-lg">Category</th>
                {forecasts.map((forecast, i) => (
                  <th key={i} className="p-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 last:rounded-tr-lg">
                    {forecast.displayMonth}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topCategories.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-gray-700">{category}</td>
                  {forecasts.map((forecast, i) => (
                    <td key={i} 
                        className={`p-4 text-right text-sm font-medium ${forecast.categories[category] > 100 ? "text-rose-500 font-bold" : "text-gray-600"}`}>
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
              <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold">
                <td className="p-4 rounded-bl-lg">Total</td>
                {forecasts.map((forecast, i) => (
                  <td key={i} className={`p-4 text-right ${i === forecasts.length - 1 ? 'rounded-br-lg' : ''}`}>
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(forecast.total)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-6 bg-sky-50 rounded-xl border-l-4 border-sky-500">
          <p className="text-sky-800 text-sm font-medium">Note: These forecasts are based on your historical spending patterns and may vary based on actual spending behavior.</p>
        </div>
      </div>
    </div>
  );
};

export default SpendingForecasts;