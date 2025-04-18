import React from 'react';
import GoalForm from '../components/goals/GoalForm.jsx';
import '../styles/AddGoal.css';

const AddGoal = () => {
  return (
    <div className="add-goal-container">
      <h1>Create Financial Goal</h1>
      <GoalForm />
    </div>
  );
};

export default AddGoal;