import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import SpendingTrends from '../components/analytics/SpendingTrends';
import SpendingForecasts from '../components/analytics/SpendingForecasts';
import AnomalyDetection from '../components/analytics/AnomalyDetection';
import Recommendations from '../components/analytics/Recommendations';

const Analytics = () => {
  const {
    trends,
    forecasts,
    anomalies,
    recommendations,
    loading,
    fetchAllAnalytics
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('trends');

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  return (
    <div className="analytics-page">
      <h1>Expense Analytics & Insights</h1>
      <p className="lead">
        Get AI-powered insights about your spending patterns and recommendations to optimize your budget
      </p>
      
      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Spending Trends
        </button>
        <button 
          className={`tab ${activeTab === 'forecasts' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecasts')}
        >
          Forecasts
        </button>
        <button 
          className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          Anomaly Detection
        </button>
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Smart Recommendations
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'trends' && (
          <SpendingTrends trends={trends} loading={loading.trends} />
        )}
        
        {activeTab === 'forecasts' && (
          <SpendingForecasts forecasts={forecasts} loading={loading.forecasts} />
        )}
        
        {activeTab === 'anomalies' && (
          <AnomalyDetection anomalies={anomalies} loading={loading.anomalies} />
        )}
        
        {activeTab === 'recommendations' && (
          <Recommendations recommendations={recommendations} loading={loading.recommendations} />
        )}
      </div>
    </div>
  );
};

export default Analytics;