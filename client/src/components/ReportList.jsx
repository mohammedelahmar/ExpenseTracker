import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';

const ReportList = () => {
  const reports = [
    {
      id: 'by-category',
      title: 'Expenses by Category',
      description: 'View your expenses broken down by categories',
      icon: '📊'
    },
    {
      id: 'monthly',
      title: 'Monthly Summary',
      description: 'Track your monthly spending patterns',
      icon: '📅'
    },
    {
      id: 'trends',
      title: 'Expense Trends',
      description: 'Analyze how your spending changes over time',
      icon: '📈'
    }
  ];

  return (
    <div className="mt-4">
      <h1>Financial Reports</h1>
      <p className="text-muted">Select a report to view detailed insights about your expenses</p>
      
      <Row>
        {reports.map(report => (
          <Col md={4} key={report.id} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="display-4 text-center mb-3">{report.icon}</div>
                <Card.Title>{report.title}</Card.Title>
                <Card.Text>{report.description}</Card.Text>
                <Link to={`/reports/${report.id}`} className="btn btn-primary w-100">
                  View Report
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ReportList;