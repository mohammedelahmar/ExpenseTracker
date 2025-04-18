import React from 'react';
import { Link } from 'react-router-dom';
import AnalyticsLoading from './AnalyticsLoading';
import anomalyAnimation from '../../assets/dashboard-loading.json';
const AnomalyDetection = ({ anomalies, loading }) => {
  if (loading) {
    return <AnalyticsLoading 
      animationData={anomalyAnimation}
      title="Scanning for Unusual Spending"
      description="Our system is analyzing your expenses to detect anomalies and outliers..."
    />;
  }
  
  if (!anomalies) {
    return <div>No anomaly data available</div>;
  }
  
  return (
    <div className="anomaly-detection">
      <div className="anomaly-header">
        <h3>Expense Anomaly Detection</h3>
        <p>{anomalies.message || "We've analyzed your expenses to find unusual spending patterns."}</p>
      </div>
      
      {anomalies.anomalies && anomalies.anomalies.length > 0 ? (
        <div className="anomalies-list">
          {anomalies.anomalies.map((anomaly, index) => (
            <div className="anomaly-card" key={index}>
              <div className="anomaly-info">
                <div className="anomaly-header">
                  <h4>{anomaly.expense.description}</h4>
                  <span className={`badge ${anomaly.percentageDifference > 0 ? 'high' : 'w'}`}>
                    {anomaly.percentageDifference > 0 ? 'Above Average' : 'Below Average'}
                  </span>
                </div>
                <div className="anomaly-details">
                  <p>
                    <strong>Amount:</strong> {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }).format(anomaly.expense.amount)}
                  </p>
                  <p><strong>Category:</strong> {anomaly.expense.category}</p>
                  <p><strong>Date:</strong> {new Date(anomaly.expense.date).toLocaleDateString()}</p>
                </div>
                <p className="anomaly-message">{anomaly.message}</p>
              </div>
              <div className="anomaly-actions">
                <Link to={`/expenses/edit/${anomaly.expense.id}`} className="btn-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-anomalies">
          <p>No unusual spending patterns detected in your recent expenses.</p>
          <p>This is a good sign! Your spending appears to be consistent.</p>
        </div>
      )}
      
      <div className="anomaly-explanation">
        <h4>How Anomaly Detection Works</h4>
        <p>Our system analyzes your spending patterns in each category and identifies expenses that deviate significantly from your normal spending behavior. This can help you identify potential errors, fraud, or areas where you might be overspending.</p>
      </div>
    </div>
  );
};

export default AnomalyDetection;