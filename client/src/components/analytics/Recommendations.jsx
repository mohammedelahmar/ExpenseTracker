import React from 'react';

const Recommendations = ({ recommendations, loading }) => {
  if (loading) {
    return <div className="loading">Generating personalized recommendations...</div>;
  }
  
  if (!recommendations || !recommendations.tips || recommendations.tips.length === 0) {
    return (
      <div className="no-recommendations">
        <h3>No Recommendations Available</h3>
        <p>Continue tracking your expenses to receive personalized recommendations.</p>
        <p>We need at least 10 expenses to generate meaningful insights.</p>
      </div>
    );
  }
  
  // Function to get appropriate icon based on impact
  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'low':
        return '🟡';
      case 'positive':
        return '🟢';
      default:
        return '💡';
    }
  };
  
  return (
    <div className="recommendations">
      <div className="recommendations-header">
        <h3>Smart Budget Recommendations</h3>
        <p>{recommendations.summary || "Here are personalized recommendations to help you optimize your spending"}</p>
      </div>
      
      <div className="recommendations-list">
        {recommendations.tips.map((tip, index) => (
          <div className={`recommendation-card ${tip.impact || ''}`} key={index}>
            <div className="recommendation-icon">
              {getImpactIcon(tip.impact)}
            </div>
            <div className="recommendation-content">
              <h4>{tip.title}</h4>
              <p>{tip.description}</p>
              {tip.tip && <p className="action-tip"><strong>Action tip:</strong> {tip.tip}</p>}
            </div>
          </div>
        ))}
      </div>
      
      <div className="recommendations-note">
        <h4>About These Recommendations</h4>
        <p>Our AI analyzes your spending patterns to provide personalized recommendations that can help you manage your expenses more effectively. These suggestions are based solely on your data and spending habits.</p>
      </div>
    </div>
  );
};

export default Recommendations;