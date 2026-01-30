import React from 'react';
import GoalList from '../components/goals/GoalList';
// import '../styles/Goals.css'; // Removed

const Goals = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <GoalList />
    </div>
  );
};

export default Goals;