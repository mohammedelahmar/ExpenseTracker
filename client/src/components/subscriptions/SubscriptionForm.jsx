import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';

const SubscriptionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    category: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    autoPay: false,
    reminderDays: 3,
    status: 'active'
  });
  
  // Load subscription data if editing
  useEffect(() => {
    const fetchSubscription = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await subscriptionService.getSubscriptionById(id);
          
          // Format date for the form
          const formattedDate = data.startDate ? 
            new Date(data.startDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
          
          setFormData({
            ...data,
            startDate: formattedDate
          });
          
          setLoading(false);
        } catch (err) {
          setError('Failed to load subscription details');
          setLoading(false);
        }
      }
    };
    
    fetchSubscription();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (id) {
        await subscriptionService.updateSubscription(id, formData);
      } else {
        await subscriptionService.addSubscription(formData);
      }
      
      navigate('/subscriptions');
    } catch (err) {
      setError(err.message || 'Failed to save subscription');
      setLoading(false);
    }
  };
  
  return (
    <div className="subscription-form-container">
      <h2 className="form-title">{id ? 'Edit Subscription' : 'Add New Subscription'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form className="subscription-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Subscription Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Netflix, Spotify, Gym membership, etc."
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="9.99"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="frequency">Frequency</label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="Software">Software</option>
            <option value="Health & Fitness">Health & Fitness</option>
            <option value="Food & Dining">Food & Dining</option>
            <option value="Education">Education</option>
            <option value="Shopping">Shopping</option>
            <option value="Insurance">Insurance</option>
            <option value="Housing">Housing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Additional details about this subscription"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reminderDays">Remind me days before payment</label>
            <input
              type="number"
              id="reminderDays"
              name="reminderDays"
              value={formData.reminderDays}
              onChange={handleChange}
              min="1"
              max="30"
              required
            />
          </div>
          
          <div className="form-group d-flex align-items-center" style={{marginTop: '32px'}}>
            <input
              type="checkbox"
              id="autoPay"
              name="autoPay"
              checked={formData.autoPay}
              onChange={handleChange}
              style={{width: 'auto', marginRight: '10px'}}
            />
            <label htmlFor="autoPay">This is an automatic payment</label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/subscriptions')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update Subscription' : 'Save Subscription')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionForm;