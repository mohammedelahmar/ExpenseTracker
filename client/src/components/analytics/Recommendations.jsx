import React from 'react';
import AnalyticsLoading from './AnalyticsLoading';
import recommendationsAnimation from '../../assets/dashboard-loading.json';
import { Lightbulb, AlertCircle, ArrowUpCircle, CheckCircle, Info, Sparkles } from 'lucide-react';

const Recommendations = ({ recommendations, loading }) => {
  if (loading) {
    return <AnalyticsLoading 
      animationData={recommendationsAnimation}
      title="Generating Smart Recommendations"
      description="Our AI is creating personalized financial insights just for you..."
    />;
  }
  
  if (!recommendations || !recommendations.tips || recommendations.tips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Lightbulb className="text-gray-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Recommendations Yet</h3>
        <p className="text-gray-500 mb-1">Continue tracking your expenses to receive personalized recommendations.</p>
        <p className="text-sm text-gray-400">We need at least 10 expenses to generate meaningful insights.</p>
      </div>
    );
  }
  
  // Function to get appropriate icon based on impact
  const getImpactDetails = (impact) => {
    switch (impact) {
      case 'high':
        return {
          icon: <AlertCircle size={32} className="text-rose-500" />,
          borderColor: 'border-l-rose-500',
          bgHighlight: 'bg-rose-50'
        };
      case 'medium':
        return {
          icon: <AlertCircle size={32} className="text-orange-500" />,
          borderColor: 'border-l-orange-500',
          bgHighlight: 'bg-orange-50'
        };
      case 'low':
        return {
          icon: <Info size={32} className="text-yellow-500" />,
          borderColor: 'border-l-yellow-400',
          bgHighlight: 'bg-yellow-50'
        };
      case 'positive':
        return {
          icon: <CheckCircle size={32} className="text-emerald-500" />,
          borderColor: 'border-l-emerald-500',
          bgHighlight: 'bg-emerald-50'
        };
      default:
        return {
          icon: <Lightbulb size={32} className="text-primary-500" />,
          borderColor: 'border-l-primary-500',
          bgHighlight: 'bg-primary-50'
        };
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="text-amber-400" size={24} />
          Smart Budget Recommendations
        </h3>
        <p className="text-gray-500 max-w-2xl">{recommendations.summary || "Here are personalized recommendations to help you optimize your spending"}</p>
      </div>
      
      <div className="space-y-6">
        {recommendations.tips.map((tip, index) => {
          const { icon, borderColor, bgHighlight } = getImpactDetails(tip.impact);
          
          return (
            <div 
              className={`flex flex-col sm:flex-row gap-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 border-l-[6px] ${borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-md`} 
              key={index}
            >
              <div className={`w-16 h-16 rounded-2xl ${bgHighlight} flex items-center justify-center flex-shrink-0 mr-4 hidden sm:flex shadow-inner`}>
                {icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 sm:hidden">
                  <div className={`p-2 rounded-lg ${bgHighlight}`}>
                    {React.cloneElement(icon, { size: 24 })}
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">{tip.title}</h4>
                </div>
                
                <h4 className="text-xl font-bold text-gray-800 mb-2 hidden sm:block">{tip.title}</h4>
                <p className="text-gray-600 leading-relaxed mb-4">{tip.description}</p>
                
                {tip.tip && (
                  <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border-l-4 border-sky-400 text-sky-900 text-sm">
                    <ArrowUpCircle size={18} className="mt-0.5 flex-shrink-0 text-sky-500" />
                    <span><strong className="font-semibold block mb-1">Action tip:</strong> {tip.tip}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-l-4 border-primary-500">
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Info size={20} className="text-primary-500" />
          About These Recommendations
        </h4>
        <p className="text-gray-600 leading-relaxed">
          Our AI analyzes your spending patterns to provide personalized recommendations that can help you manage your expenses more effectively. These suggestions are based solely on your data and spending habits.
        </p>
      </div>
    </div>
  );
};

export default Recommendations;