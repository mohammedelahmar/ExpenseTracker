import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import goalService from '../../services/goalService';
import '../../styles/GoalForm.css';

const GoalForm = ({ editGoal = null, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    category: '',
    description: '',
    icon: 'piggy-bank'
  });
  
  // Icons available for selection
  const availableIcons = [
    'piggy-bank', 'home', 'car', 'graduation-cap', 'plane', 
    'laptop', 'heart', 'gift', 'book', 'umbrella'
  ];

  // If editing an goal, populate form with goal data
  useEffect(() => {
    if (editGoal) {
      const targetDate = editGoal.targetDate 
        ? new Date(editGoal.targetDate).toISOString().split('T')[0]
        : '';
        
      setFormData({
        name: editGoal.name,
        targetAmount: editGoal.targetAmount,
        currentAmount: editGoal.currentAmount,
        targetDate: targetDate,
        category: editGoal.category || '',
        description: editGoal.description || '',
        icon: editGoal.icon || 'piggy-bank'
      });
    }
  }, [editGoal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format data for API
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount)
      };

      let response;
      if (editGoal) {
        response = await goalService.updateGoal(editGoal._id, goalData);
      } else {
        response = await goalService.createGoal(goalData);
      }

      setLoading(false);
      
      // Reset form after successful submission if it's a new goal
      if (!editGoal) {
        setFormData({
          name: '',
          targetAmount: '',
          currentAmount: '0',
          targetDate: '',
          category: '',
          description: '',
          icon: 'piggy-bank'
        });
      }
      
      // Notify parent component of successful submission
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
      
      // Redirect to goals page
      navigate('/goals');
    } catch (err) {
      setLoading(false);
      setError(
        err.message || 'An error occurred. Please try again.'
      );
      console.error('Error submitting goal:', err);
    }
  };

  const selectIcon = (icon) => {
    setFormData({ ...formData, icon });
  };

  return (
    <div className="goal-form-container card">
      <h2>{editGoal ? 'Edit Financial Goal' : 'Add New Financial Goal'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Goal Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Emergency Fund, New Car"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="targetAmount">Target Amount ($)</label>
          <input
            type="number"
            step="0.01"
            id="targetAmount"
            name="targetAmount"
            className="form-control"
            value={formData.targetAmount}
            onChange={handleChange}
            required
            min="0.01"
            placeholder="5000.00"
          />
        </div>
        
        {editGoal && (
          <div className="form-group">
            <label htmlFor="currentAmount">Current Amount ($)</label>
            <input
              type="number"
              step="0.01"
              id="currentAmount"
              name="currentAmount"
              className="form-control"
              value={formData.currentAmount}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="targetDate">Target Date</label>
          <input
            type="date"
            id="targetDate"
            name="targetDate"
            className="form-control"
            value={formData.targetDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category (Optional)</label>
          <input
            type="text"
            id="category"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Savings, Travel, Home"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe your financial goal..."
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Choose an Icon</label>
          <div className="icon-selector">
            {availableIcons.map((icon) => (
              <div
                key={icon}
                className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                onClick={() => selectIcon(icon)}
              >
                <i className={`fas fa-${icon}`}></i>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editGoal ? 'Update Goal' : 'Create Goal')}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/goals')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;