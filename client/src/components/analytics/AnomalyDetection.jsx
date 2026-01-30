import React from 'react';
import { Link } from 'react-router-dom';
import AnalyticsLoading from './AnalyticsLoading';
import anomalyAnimation from '../../assets/dashboard-loading.json';
import { AlertCircle, CheckCircle, Search, ArrowRight, DollarSign, Calendar, Tag } from 'lucide-react';

const AnomalyDetection = ({ anomalies, loading }) => {
  if (loading) {
    return <AnalyticsLoading 
      animationData={anomalyAnimation}
      title="Scanning for Unusual Spending"
      description="Our system is analyzing your expenses to detect anomalies and outliers..."
    />;
  }
  
  if (!anomalies) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">No anomaly data available</div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Search className="text-primary-500" size={24} />
            Expense Anomaly Detection
          </h3>
          <p className="text-gray-500 max-w-2xl">{anomalies.message || "We've analyzed your expenses to find unusual spending patterns."}</p>
        </div>
      </div>
      
      {anomalies.anomalies && anomalies.anomalies.length > 0 ? (
        <div className="space-y-6">
          {anomalies.anomalies.map((anomaly, index) => (
            <div 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md group" 
              key={index}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-rose-500"></div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <h4 className="text-xl font-bold text-gray-800">{anomaly.expense.description}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${
                      anomaly.percentageDifference > 0 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {anomaly.percentageDifference > 0 ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                      {anomaly.percentageDifference > 0 ? 'Above Average' : 'Below Average'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <DollarSign size={16} className="text-gray-400" />
                      <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Amount</span>
                        <span className="font-bold text-gray-900">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(anomaly.expense.amount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <Tag size={16} className="text-gray-400" />
                      <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Category</span>
                        <span className="font-medium text-gray-900">{anomaly.expense.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Date</span>
                        <span className="font-medium text-gray-900">{new Date(anomaly.expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm font-medium flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    {anomaly.message}
                  </div>
                </div>
                
                <div className="flex items-center justify-end md:justify-center md:border-l md:border-gray-100 md:pl-6">
                  <Link 
                    to={`/expenses/edit/${anomaly.expense.id}`} 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group-hover:shadow"
                  >
                    View Details
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Everything Looks Good!</h3>
          <p className="text-gray-500 mb-1">No unusual spending patterns detected in your recent expenses.</p>
          <p className="text-sm text-gray-400">This is a good sign! Your spending appears to be consistent.</p>
        </div>
      )}
      
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-l-4 border-primary-500">
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Search size={20} className="text-primary-500" />
          How Anomaly Detection Works
        </h4>
        <p className="text-gray-600 leading-relaxed">
          Our system analyzes your spending patterns in each category and identifies expenses that deviate significantly from your normal spending behavior. This can help you identify potential errors, fraud, or areas where you might be overspending.
        </p>
      </div>
    </div>
  );
};

export default AnomalyDetection;