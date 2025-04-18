import React from 'react';
import GoalList from '../components/goals/GoalList';
import '../styles/Goals.css';

const Goals = () => {
  return (
    <div className="goals-page-container">
      <GoalList />
    </div>
  );
};

export default Goals;