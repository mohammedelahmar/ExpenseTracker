import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';
import '../styles/EditExpense.css';

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState({
    date: '',
    amount: '',
    category: '',
    description: '',
    receipt: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Predefined categories for dropdown
  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Business',
    'Other'
  ];

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        
        
        // Check if we have a token before proceeding
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token missing. Please log in again.');
          setLoading(false);
          return;
        }
        
        const data = await expenseService.getExpenseById(id);
        
        if (!data) {
          setError('Received empty response from server');
          setLoading(false);
          return;
        }
        
        
        
        // Format the date to YYYY-MM-DD for the date input
        const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
        setExpense({
          ...data,
          date: formattedDate
        });
        setLoading(false);
  } catch (err) {
        setError(`Failed to fetch expense details: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const validateForm = () => {
    const errors = {};
    
    if (!expense.date) {
      errors.date = 'Date is required';
    }
    
    if (!expense.amount || parseFloat(expense.amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!expense.category.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!expense.description.trim()) {
      errors.description = 'Description is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await expenseService.updateExpense(id, expense);
      navigate('/expenses');
    } catch (err) {
      setError('Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/expenses');
    }
  };

  if (loading) {
    return (
      <div className="edit-expense-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Loading expense details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-expense-container">
      <div className="edit-expense-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate('/expenses')}
            aria-label="Go back to expenses"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="header-text">
            <h1>Edit Expense</h1>
            <p>Update your expense details</p>
          </div>
        </div>
        <div className="expense-id">
          <span className="id-label">ID:</span>
          <span className="id-value">{id}</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="edit-expense-card">
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-section">
            <h3 className="section-title">
              <i className="fas fa-calendar-alt"></i>
              Basic Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  <i className="fas fa-calendar"></i>
                  Date *
                </label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    className={`form-input ${validationErrors.date ? 'error' : ''}`}
                    id="date"
                    name="date"
                    value={expense.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {validationErrors.date && (
                    <span className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {validationErrors.date}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  <i className="fas fa-dollar-sign"></i>
                  Amount *
                </label>
                <div className="input-wrapper">
                  <div className="amount-input-container">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      className={`form-input amount-input ${validationErrors.amount ? 'error' : ''}`}
                      id="amount"
                      name="amount"
                      value={expense.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                  {validationErrors.amount && (
                    <span className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {validationErrors.amount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <i className="fas fa-tag"></i>
              Category & Description
            </h3>
            
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                <i className="fas fa-folder"></i>
                Category *
              </label>
              <div className="input-wrapper">
                <div className="select-wrapper">
                  <select
                    className={`form-input form-select ${validationErrors.category ? 'error' : ''}`}
                    id="category"
                    name="category"
                    value={expense.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {validationErrors.category && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {validationErrors.category}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <i className="fas fa-align-left"></i>
                Description *
              </label>
              <div className="input-wrapper">
                <textarea
                  className={`form-input form-textarea ${validationErrors.description ? 'error' : ''}`}
                  id="description"
                  name="description"
                  value={expense.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter expense description..."
                />
                <div className="character-count">
                  {expense.description.length}/500
                </div>
                {validationErrors.description && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {validationErrors.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <i className="fas fa-receipt"></i>
              Receipt (Optional)
            </h3>
            
            <div className="form-group">
              <label htmlFor="receipt" className="form-label">
                <i className="fas fa-link"></i>
                Receipt URL
              </label>
              <div className="input-wrapper">
                <input
                  type="url"
                  className="form-input"
                  id="receipt"
                  name="receipt"
                  value={expense.receipt || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/receipt.jpg"
                />
                <small className="form-help">
                  <i className="fas fa-info-circle"></i>
                  Add a link to your receipt image (optional)
                </small>
                {expense.receipt && (
                  <div className="receipt-preview">
                    <img 
                      src={expense.receipt} 
                      alt="Receipt preview" 
                      className="receipt-thumbnail"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
            
            <button 
              type="submit" 
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Update Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Card */}
      <div className="expense-summary">
        <h4>Expense Summary</h4>
        <div className="summary-item">
          <span className="summary-label">Date:</span>
          <span className="summary-value">
            {expense.date ? new Date(expense.date).toLocaleDateString() : 'Not set'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Amount:</span>
          <span className="summary-value amount">
            {expense.amount ? `$${parseFloat(expense.amount).toFixed(2)}` : '$0.00'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Category:</span>
          <span className="summary-value">
            {expense.category || 'Not selected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;