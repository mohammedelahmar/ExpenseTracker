import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goalService from '../../services/goalService';
import GoalProgressCard from './GoalProgressCard';
import '../../styles/GoalList.css';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/dashboard-loading.json'; // Reuse existing animation

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await goalService.fetchGoals();
        setGoals(data);
        setError('');
      } catch (err) {
        setError('Failed to load goals. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // Filter goals based on active filter
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return !goal.isCompleted;
    if (filter === 'completed') return goal.isCompleted;
    return true;
  });

  // Calculations for overview section
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const activeGoals = totalGoals - completedGoals;
  
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSavedAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 
    ? Math.round((totalSavedAmount / totalTargetAmount) * 100) 
    : 0;

  return (
    <div className="goal-list-container">
      <div className="goal-list-header">
        <h1>Financial Goals</h1>
        <Link to="/goals/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add New Goal
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Goals Overview Section */}
      {!loading && goals.length > 0 && (
        <div className="goals-overview">
          <div className="overview-card">
            <div className="overview-value">{totalGoals}</div>
            <div className="overview-label">Total Goals</div>
          </div>
          <div className="overview-card">
            <div className="overview-value">{activeGoals}</div>
            <div className="overview-label">Active Goals</div>
          </div>
          <div className="overview-card">
            <div className="overview-value">{completedGoals}</div>
            <div className="overview-label">Completed Goals</div>
          </div>
          <div className="overview-card">
            <div className="overview-value">{overallProgress}%</div>
            <div className="overview-label">Overall Progress</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="goal-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Goals
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active Goals
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed Goals
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-animation-container">
          <div className="loading-animation-wrapper">
            <Lottie 
              animationData={loadingAnimation} 
              loop={true}
              style={{ width: 180, height: 180 }}
            />
            <p className="loading-text">Loading your financial goals...</p>
          </div>
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="goal-cards-container">
          {filteredGoals.map(goal => (
            <GoalProgressCard key={goal._id} goal={goal} onUpdate={() => {
              goalService.fetchGoals().then(data => setGoals(data));
            }} />
          ))}
        </div>
      ) : (
        <div className="no-data-message">
          <p>{filter !== 'all' ? `No ${filter} goals found.` : 'No goals found. Create your first financial goal to get started!'}</p>
          <Link to="/goals/add" className="btn btn-primary">
            Create Your First Goal
          </Link>
        </div>
      )}
    </div>
  );
};

export default GoalList;