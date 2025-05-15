import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import Lottie from 'lottie-react'; // Changed to lottie-react
import '../styles/ReportList.css';

// Import animations
import circularGraphAnimation from '../assets/CircularGraphAnimation.json';
import calendarAnimation from '../assets/calendarAnimation.json';
import graphAnimation from '../assets/GraphAnimation.json';

const ReportList = () => {
  const reports = [
    {
      id: 'by-category',
      title: 'Expenses by Category',
      description: 'View your expenses broken down by categories to understand where your money goes',
      animationData: circularGraphAnimation,
      color: 'blue'
    },
    {
      id: 'monthly',
      title: 'Monthly Summary',
      description: 'Track your monthly spending patterns and budget adherence',
      animationData: calendarAnimation,
      color: 'green'
    },
    {
      id: 'trends',
      title: 'Expense Trends',
      description: 'Analyze how your spending changes over time to identify patterns',
      animationData: graphAnimation || circularGraphAnimation, // Fallback if graphAnimation is empty
      color: 'purple'
    }
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Financial Reports</h1>
        <p className="text-muted">Select a report to view detailed insights about your expenses</p>
      </div>
      
      <Row className="reports-grid">
        {reports.map(report => (
          <Col md={4} key={report.id} className="mb-4">
            <div className={`report-card report-card-${report.color}`}>
              <div className="animation-container">
                <Lottie
                  animationData={report.animationData}
                  loop={true}
                  style={{ width: 150, height: 150 }}
                />
              </div>
              <h3 className="report-title">{report.title}</h3>
              <p className="report-description">{report.description}</p>
              <Link to={`/reports/${report.id}`} className="view-report-button">
                View Report
              </Link>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ReportList;