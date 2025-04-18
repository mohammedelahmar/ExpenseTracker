import React from 'react';
import Lottie from 'lottie-react';
import '../../styles/analytics.css';

const AnalyticsLoading = ({ animationData, title, description }) => {
  return (
    <div className="analytics-loading-container">
      <div className="analytics-loading-animation">
        <Lottie 
          animationData={animationData} 
          loop={true} 
          autoplay={true}
        />
      </div>
      <h3 className="analytics-loading-title">{title}</h3>
      <p className="analytics-loading-description">{description}</p>
    </div>
  );
};

export default AnalyticsLoading;