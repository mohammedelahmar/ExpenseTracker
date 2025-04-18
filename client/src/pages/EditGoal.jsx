import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GoalForm from '../components/goals/GoalForm';
import goalService from '../services/goalService';
import '../styles/EditGoal.css';

const EditGoal = () => {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        setLoading(true);
        const data = await goalService.getGoalById(id);
        setGoal(data);
      } catch (err) {
        setError('Failed to load goal details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="edit-goal-container">
      <h1>Edit Financial Goal</h1>
      {goal && <GoalForm editGoal={goal} />}
    </div>
  );
};

export default EditGoal;