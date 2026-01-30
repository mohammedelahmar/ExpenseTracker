import React from 'react';
import Lottie from 'lottie-react';
// import '../../styles/analytics.css'; // Removed

const AnalyticsLoading = ({ animationData, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100 p-10 md:p-16 mx-auto max-w-2xl text-center relative overflow-hidden my-10 animate-fade-in">
      {/* Shimmer effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-shimmer"></div>
      
      <div className="w-60 h-60 mb-6">
        <Lottie 
          animationData={animationData} 
          loop={true} 
          autoplay={true}
        />
      </div>
      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 mb-3">
        {title}
      </h3>
      <p className="text-lg text-gray-500 leading-relaxed max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
};

export default AnalyticsLoading;