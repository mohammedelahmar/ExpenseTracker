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

    // Prepare chart data
    const chartData = {
      labels: data.map(item => item._id || 'Uncategorized'),
      datasets: [
        {
          data: data.map(item => item.total),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8AC249', '#EA5545', '#C5B0D5', '#7DB8A4'
          ],
        },
      ],
    };

    return (
      <>
        <Form onSubmit={handleFilter} className="mb-4">
          <div className="d-flex gap-3">
            <Form.Group className="flex-grow-1">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </Form.Group>
            <div className="d-flex align-items-end">
              <Button type="submit" variant="primary" className="mb-3">Apply Filter</Button>
            </div>
          </div>
        </Form>
        
        <div className="row">
          <div className="col-md-6">
            <div style={{ height: '300px' }}>
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="col-md-6">
            <Card>
              <Card.Header>Expense Breakdown by Category</Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td>{item._id || 'Uncategorized'}</td>
                          <td className="text-end">${item.total.toFixed(2)}</td>
                          <td className="text-end">{item.count}</td>
                        </tr>
                      ))}
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
        <Form onSubmit={handleFilter} className="mb-4">
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
              <Button type="submit" variant="primary" className="mb-3">Apply Filter</Button>
            </div>
          </div>
        </Form>
        
        <div className="mb-4" style={{ height: '400px' }}>
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
            }
          }} />
        </div>
        
        <Card>
          <Card.Header>Monthly Expense Summary for {year}</Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-striped mb-0">
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
                      <td className="text-end">${item.total.toFixed(2)}</td>
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
        <div className="mb-4" style={{ height: '500px' }}>
          <Line data={chartData} options={{ 
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
          }} />
        </div>
        
        <div className="alert alert-info">
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
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{getReportTitle()}</h1>
        <Link to="/reports" className="btn btn-outline-secondary">
          Back to Reports
        </Link>
      </div>
      
      {renderReportContent()}
    </div>
  );
};

export default ReportView;