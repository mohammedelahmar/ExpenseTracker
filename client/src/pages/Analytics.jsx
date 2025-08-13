import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import SpendingTrends from '../components/analytics/SpendingTrends';
import SpendingForecasts from '../components/analytics/SpendingForecasts';
import AnomalyDetection from '../components/analytics/AnomalyDetection';
import Recommendations from '../components/analytics/Recommendations';
import '../styles/analytics.css';

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

  const tabs = [
    { id: 'trends', label: 'Spending Trends', icon: '📈' },
    { id: 'forecasts', label: 'Forecasts', icon: '🔮' },
    { id: 'anomalies', label: 'Anomaly Detection', icon: '🔍' },
    { id: 'recommendations', label: 'Smart Recommendations', icon: '💡' }
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-hero">
        <div className="analytics-container">
          <h1>Expense Analytics & Insights</h1>
          <p className="lead">
            Get AI-powered insights about your spending patterns and recommendations to optimize your budget
          </p>
        </div>
      </div>
      
      <div className="analytics-content">
        <div className="analytics-container">
          <div className="analytics-tabs">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
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
      </div>
    </div>
  );
};

export default Analytics;