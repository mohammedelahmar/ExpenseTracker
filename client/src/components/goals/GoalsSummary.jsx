import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goalService from '../../services/goalService';
import '../../styles/GoalsSummary.css';

const GoalsSummary = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await goalService.fetchGoals();
        const activeGoals = data
          .filter(goal => !goal.isCompleted)
          .sort((a, b) => a.targetDate - b.targetDate)
          .slice(0, 3); // Get top 3 upcoming goals
        setGoals(activeGoals);
      } catch (err) {
        console.error('Error fetching goals for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (loading) {
    return <div className="loading">Loading goals...</div>;
  }

  if (goals.length === 0) {
    return (
      <div className="goals-summary card">
        <div className="card-header">
          <h3>Financial Goals</h3>
        </div>
        <div className="card-body">
          <p className="no-goals-message">You don't have any active goals.</p>
          <Link to="/goals/add" className="btn btn-primary btn-sm">Create a Goal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="goals-summary card">
      <div className="card-header">
        <h3>Financial Goals</h3>
        <Link to="/goals" className="view-all">View All</Link>
      </div>
      <div className="card-body p-0">
        <div className="goals-list">
          {goals.map(goal => (
            <div key={goal._id} className="dashboard-goal">
              <div className="goal-info">
                <div className="goal-icon">
                  <i className={`fas fa-${goal.icon || 'piggy-bank'}`}></i>
                </div>
                <div>
                  <h4>{goal.name}</h4>
                  <div className="mini-progress">
                    <div 
                      className="mini-progress-bar" 
                      style={{ width: `${goal.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="goal-status">
                <span className="goal-percentage">{goal.progressPercentage}%</span>
                <span className="goal-amount">
                  ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <Link to="/goals/add" className="btn btn-outline-primary btn-sm">Add New Goal</Link>
      </div>
    </div>
  );
};

export default GoalsSummary;