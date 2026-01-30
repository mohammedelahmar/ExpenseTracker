import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import SpendingTrends from '../components/analytics/SpendingTrends';
import SpendingForecasts from '../components/analytics/SpendingForecasts';
import AnomalyDetection from '../components/analytics/AnomalyDetection';
import Recommendations from '../components/analytics/Recommendations';
import { TrendingUp, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
// import '../styles/analytics.css'; // Removed

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
  }, [fetchAllAnalytics]);

  const tabs = [
    { id: 'trends', label: 'Spending Trends', icon: <TrendingUp size={18} /> },
    { id: 'forecasts', label: 'Forecasts', icon: <Sparkles size={18} /> },
    { id: 'anomalies', label: 'Anomaly Detection', icon: <AlertTriangle size={18} /> },
    { id: 'recommendations', label: 'Smart Recommendations', icon: <Lightbulb size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Expense Analytics & Insights</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
            Get AI-powered insights about your spending patterns and recommendations to optimize your budget
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-7xl -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl min-h-[600px] overflow-hidden border border-gray-100">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-2 p-4 md:p-6 bg-gray-50/50 border-b border-gray-100">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-white text-primary-600 shadow-md transform -translate-y-0.5 border border-gray-100' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-4 md:p-8 animate-fade-in">
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