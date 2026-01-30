import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
// import '../styles/ReportList.css'; // Removed

// Import animations
// Note: Assuming these assets exist where they are imported
import circularGraphAnimation from '../assets/CircularGraphAnimation.json';
import calendarAnimation from '../assets/calendarAnimation.json';
import graphAnimation from '../assets/GraphAnimation.json';

const ReportList = () => {
  const reports = [
    {
      id: 'by-category',
      title: 'Expenses by Category',
      description: 'View your expenses broken down by categories to understand where your money goes',
      animationData: circularGraphAnimation,
      color: 'blue'
    },
    {
      id: 'monthly',
      title: 'Monthly Summary',
      description: 'Track your monthly spending patterns and budget adherence',
      animationData: calendarAnimation,
      color: 'green'
    },
    {
      id: 'trends',
      title: 'Expense Trends',
      description: 'Analyze how your spending changes over time to identify patterns',
      animationData: graphAnimation || circularGraphAnimation,
      color: 'purple'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Reports</h1>
        <p className="text-gray-500">Select a report to view detailed insights about your expenses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report) => {
          // Dynamic classes for color themes
          const colorClasses = {
            blue: 'hover:border-blue-500 hover:shadow-blue-500/20',
            green: 'hover:border-green-500 hover:shadow-green-500/20',
            purple: 'hover:border-purple-500 hover:shadow-purple-500/20'
          };
          
          return (
            <div 
              key={report.id} 
              className={`bg-white rounded-2xl p-8 shadow-lg border border-transparent transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center ${colorClasses[report.color]}`}
            >
              <div className="mb-6 h-[150px] w-[150px] flex items-center justify-center">
                <Lottie
                  animationData={report.animationData}
                  loop={true}
                  style={{ width: 150, height: 150 }}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{report.title}</h3>
              <p className="text-gray-500 mb-8 flex-grow leading-relaxed">{report.description}</p>
              <Link 
                to={`/reports/${report.id}`} 
                className="w-full py-3 px-6 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                // Assuming we want primary color buttons later, but keeping it neutral for now or matching card color?
                // Standardize on gray for now as per original design intention likely just being clean
              >
                View Report
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportList;