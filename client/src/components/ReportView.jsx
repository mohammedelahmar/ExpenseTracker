import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
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
import '../styles/ReportView.css'; // Import the new CSS file

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

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/reports/${id}`;
      let params = {};
      
      if (id === 'by-category' && dateRange.startDate && dateRange.endDate) {
        params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
      } else if (id === 'monthly') {
        params = { year };
      }
      
      const response = await axios.get(url, { params });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report data');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const renderReportContent = () => {
    if (loading) {
      return <div className="text-center my-5"><Spinner animation="border" /></div>;
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    switch (id) {
      case 'by-category':
        return renderCategoryReport();
      case 'monthly':
        return renderMonthlyReport();
      case 'trends':
        return renderTrendsReport();
      default:
        return <Alert variant="warning">Unknown report type</Alert>;
    }
  };

  const renderCategoryReport = () => {
    if (!data || data.length === 0) {
      return <Alert variant="info">No expense data available for the selected period</Alert>;
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
        <Form onSubmit={handleFilter} className="filter-form mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="form-control-modern"
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="form-control-modern"
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="filter-button w-100"
                size="lg"
              >
                <i className="fas fa-filter me-2"></i>
                Apply Filter
              </Button>
            </div>
          </div>
        </Form>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="summary-card-content">
                <h3 className="summary-amount">${totalAmount.toFixed(2)}</h3>
                <p className="summary-label">Total Expenses</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="fas fa-tags"></i>
              </div>
              <div className="summary-card-content">
                <h3 className="summary-amount">{data.length}</h3>
                <p className="summary-label">Categories</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="summary-card">
              <div className="summary-card-icon">
                <i className="fas fa-receipt"></i>
              </div>
              <div className="summary-card-content">
                <h3 className="summary-amount">{data.reduce((sum, item) => sum + item.count, 0)}</h3>
                <p className="summary-label">Total Transactions</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart and Table Section */}
        <div className="row g-4 reports-row">
          <div className="col-lg-5">
            <Card className="chart-card">
              <Card.Header className="chart-header">
                <h5 className="mb-0 fw-semibold">
                  <i className="fas fa-chart-pie me-2 text-primary"></i>
                  Expense Distribution
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ width: '100%', height: '350px', position: 'relative' }}>
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
                              size: 10,
                              family: "'Inter', sans-serif"
                            },
                            generateLabels: function(chart) {
                              const data = chart.data;
                              if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                  const value = data.datasets[0].data[i];
                                  const percentage = ((value / totalAmount) * 100).toFixed(1);
                                  return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].backgroundColor[i],
                                    lineWidth: 0,
                                    pointStyle: 'circle',
                                    hidden: false,
                                    index: i
                                  };
                                });
                              }
                              return [];
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const percentage = ((value / totalAmount) * 100).toFixed(1);
                              return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </div>
          
          <div className="col-lg-7">
            <Card className="table-card">
              <Card.Header className="table-header">
                <h5 className="mb-0 fw-semibold">
                  <i className="fas fa-list me-2 text-success"></i>
                  Expense Breakdown by Category
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover mb-0 modern-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Category</th>
                        <th style={{ width: '20%' }} className="text-end">Amount</th>
                        <th style={{ width: '20%' }} className="text-end">%</th>
                        <th style={{ width: '20%' }} className="text-end">Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
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
                            <tr key={index} className="table-row-hover">
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="category-color-indicator me-3"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                  <div className="category-info">
                                    <span className="fw-semibold category-name">{item._id || 'Uncategorized'}</span>
                                    <div className="percentage-bar-container mt-1">
                                      <div 
                                        className="percentage-bar"
                                        style={{ 
                                          width: `${percentage}%`,
                                          backgroundColor: color
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-end">
                                <span className="amount-text fw-bold">${item.total.toFixed(2)}</span>
                              </td>
                              <td className="py-3 text-end">
                                <span className="percentage-badge">{percentage}%</span>
                              </td>
                              <td className="py-3 text-end">
                                <span className="count-text fw-semibold">{item.count}</span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </>
    );
  };

  const renderMonthlyReport = () => {
    if (!data || data.length === 0) {
      return <Alert variant="info">No expense data available for the selected year</Alert>;
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
        <Form onSubmit={handleFilter} className="filter-form">
          <div className="d-flex gap-3">
            <Form.Group className="flex-grow-1">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex align-items-end">
              <Button type="submit" variant="primary" className="filter-button mb-3">Apply Filter</Button>
            </div>
          </div>
        </Form>
        
        <div className="chart-container" style={{ height: '400px' }}>
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
        
        <Card className="report-card mt-4">
          <Card.Header className="bg-white">Monthly Expense Summary for {year}</Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-striped mb-0 report-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="text-end">Total Expenses</th>
                    <th className="text-end">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td>{months[item.month - 1]}</td>
                      <td className="text-end category-amount">${item.total.toFixed(2)}</td>
                      <td className="text-end">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </>
    );
  };

  const renderTrendsReport = () => {
    if (!data || data.length === 0) {
      return <Alert variant="info">No trend data available</Alert>;
    }

    // Process data for trend chart
    const categories = [...new Set(data.map(item => item._id.category || 'Uncategorized'))];
    const months = [...new Set(data.map(item => `${item._id.year}-${item._id.month}`))].sort();
    
    // Create datasets for each category
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
      
      // Generate a color based on index
      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC249', '#EA5545', '#C5B0D5', '#7DB8A4'
      ];
      const color = colors[index % colors.length];
      
      return {
        label: category,
        data: categoryData,
        borderColor: color,
        backgroundColor: color + '33', // Add transparency
        tension: 0.1
      };
    });
    
    // Prepare chart data
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
        <div className="chart-container" style={{ height: '500px' }}>
          <Line data={chartData} options={{ 
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Value'  // Replace with your axis label
                }
              }
            }
          }} />
        </div>
        
        <div className="info-panel">
          <strong>About this report:</strong> This chart shows how your spending across different categories 
          has changed over the past 6 months, helping you identify trends in your financial habits.
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
    <div className="report-container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 report-header">
        <h1 className="report-title">{getReportTitle()}</h1>
        <Link to="/reports" className="btn btn-outline-secondary back-button">
          Back to Reports
        </Link>
      </div>
      
      {renderReportContent()}
    </div>
  );
};

export default ReportView;