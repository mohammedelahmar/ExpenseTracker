import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import goalService from '../../services/goalService';
import ContributeModal from './ContributeModal';
import '../../styles/GoalProgressCard.css';

const GoalProgressCard = ({ goal, onUpdate }) => {
  const navigate = useNavigate();
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate days remaining
  const calculateDaysLeft = () => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Calculate required monthly saving to reach goal
  const calculateMonthlySaving = () => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    if (remainingAmount <= 0) return 0;
    
    // Calculate months between dates
    const months = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                  (targetDate.getMonth() - today.getMonth());
    
    // Return monthly amount needed (minimum 1 month)
    return months > 0 ? remainingAmount / months : remainingAmount;
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
      try {
        setLoading(true);
        await goalService.deleteGoal(goal._id);
        if (onUpdate) onUpdate();
      } catch (err) {
        setError('Failed to delete goal');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleContribution = async (amount) => {
    try {
      setLoading(true);
      await goalService.contributeToGoal(goal._id, amount);
      if (onUpdate) onUpdate();
      setShowContributeModal(false);
    } catch (err) {
      setError('Failed to add contribution');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Determine goal status class
  const getStatusClass = () => {
    if (goal.isCompleted) return 'completed';
    
    const daysLeft = calculateDaysLeft();
    if (daysLeft <= 30) return 'urgent';
    if (goal.progressPercentage >= 75) return 'near-goal';
    
    return 'on-track';
  };

  return (
    <>
      <div className={`goal-card ${getStatusClass()}`}>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="goal-card-header">
          <div className="goal-icon">
            <i className={`fas fa-${goal.icon || 'piggy-bank'}`}></i>
          </div>
          <div className="goal-title-container">
            <h3 className="goal-title">{goal.name}</h3>
            {goal.category && <span className="goal-category">{goal.category}</span>}
          </div>
        </div>
        
        <div className="goal-progress-container">
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${goal.progressPercentage}%` }}
            >
              <span className="progress-text">{goal.progressPercentage}%</span>
            </div>
          </div>
          
          <div className="goal-amounts">
            <div className="current-amount">
              <span className="amount-label">Saved</span>
              <span className="amount-value">{formatCurrency(goal.currentAmount)}</span>
            </div>
            <div className="target-amount">
              <span className="amount-label">Goal</span>
              <span className="amount-value">{formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>
        </div>
        
        {!goal.isCompleted && (
          <div className="goal-stats">
            <div className="stat">
              <span className="stat-value">{calculateDaysLeft()}</span>
              <span className="stat-label">Days Left</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatCurrency(calculateMonthlySaving())}</span>
              <span className="stat-label">Monthly Need</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
              <span className="stat-label">To Go</span>
            </div>
          </div>
        )}
        
        {goal.description && (
          <div className="goal-description">
            <p>{goal.description}</p>
          </div>
        )}
        
        <div className="goal-dates">
          <div className="target-date">
            <i className="fas fa-calendar"></i>
            <span>Target: {formatDate(goal.targetDate)}</span>
          </div>
        </div>
        
        <div className="goal-actions">
          {!goal.isCompleted && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowContributeModal(true)}
              disabled={loading}
            >
              <i className="fas fa-plus"></i> Add Contribution
            </button>
          )}
          
          <div className="action-buttons">
            <button
              className="btn btn-info btn-sm"
              onClick={() => navigate(`/goals/edit/${goal._id}`)}
              title="Edit goal"
              disabled={loading}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              title="Delete goal"
              disabled={loading}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        {goal.isCompleted && (
          <div className="goal-completed-badge">
            <i className="fas fa-check-circle"></i> Goal Achieved!
          </div>
        )}
      </div>
      
      <ContributeModal
        show={showContributeModal}
        onHide={() => setShowContributeModal(false)}
        onContribute={handleContribution}
        goalName={goal.name}
        remainingAmount={goal.targetAmount - goal.currentAmount}
      />
    </>
  );
};

export default GoalProgressCard;