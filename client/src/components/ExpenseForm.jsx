import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/ExpenseForm.css';
import ReceiptUpload from './ReceiptUpload';

const ExpenseForm = ({ editExpense = null, onSubmitSuccess, onGoBack }) => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt: ''
  });
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load categories when component mounts
  useEffect(() => {
    if (user) {
      const fetchCategories = async () => {
        try {
          const res = await axios.get('/api/categories', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setCategories(res.data);
        } catch (err) {
          console.error('Error fetching categories:', err);
          setError('Failed to load categories');
        }
      };

      fetchCategories();
    }
  }, [user]);

  // If editing an expense, populate form with expense data
  useEffect(() => {
    if (editExpense) {
      setFormData({
        amount: editExpense.amount,
        category: editExpense.category,
        date: new Date(editExpense.date).toISOString().split('T')[0],
        description: editExpense.description,
        receipt: editExpense.receipt || ''
      });
      
      if (editExpense.receipt) {
        setReceiptPreview(`http://localhost:5000/${editExpense.receipt}`);
      }
    }
  }, [editExpense]);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'amount':
        if (!value || parseFloat(value) <= 0) {
          errors.amount = 'Amount must be greater than 0';
        } else {
          delete errors.amount;
        }
        break;
      case 'category':
        if (!value) {
          errors.category = 'Please select a category';
        } else {
          delete errors.category;
        }
        break;
      case 'description':
        if (!value || value.trim().length < 3) {
          errors.description = 'Description must be at least 3 characters';
        } else {
          delete errors.description;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleReceiptProcessed = (receiptData) => {
    console.log('Receipt data received:', receiptData);
    
    let formattedDate = formData.date;
    if (receiptData.date) {
      try {
        const parsedDate = new Date(receiptData.date);
        if (!isNaN(parsedDate)) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        amount: receiptData.amount || prevData.amount,
        category: receiptData.category || prevData.category,
        description: receiptData.description || receiptData.merchant || prevData.description,
        date: formattedDate,
        receipt: receiptData.receipt || prevData.receipt
      };
      return newData;
    });
    
    if (receiptData.receipt) {
      setReceiptPreview(`http://localhost:5000/${receiptData.receipt}`);
    }
    
    setSuccess('Receipt processed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const handleReceiptError = (error) => {
    console.error("Receipt processing error:", error);
    setError('Error processing receipt. Please try again or enter details manually.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate all fields
    const isValid = Object.keys(formData).every(key => 
      key === 'receipt' || validateField(key, formData[key])
    );

    if (!isValid) {
      setLoading(false);
      setError('Please fix the errors above');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      let response;
      if (editExpense) {
        response = await axios.put(
          `/api/expenses/${editExpense._id}`,
          formData,
          config
        );
        setSuccess('Expense updated successfully!');
      } else {
        response = await axios.post('/api/expenses', formData, config);
        setSuccess('Expense added successfully!');
      }

      setLoading(false);
      setIsSubmitted(true);
      
      if (!editExpense) {
        setFormData({
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          receipt: ''
        });
        setReceiptPreview(null);
      }
      
      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess(response.data);
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message || 
        'An error occurred. Please try again.'
      );
      console.error('Error submitting expense:', err);
    }
  };

  const clearForm = () => {
    setFormData({
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      receipt: ''
    });
    setReceiptPreview(null);
    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  const removeReceipt = () => {
    setFormData({ ...formData, receipt: '' });
    setReceiptPreview(null);
    setSuccess('Receipt removed successfully');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Calculate progress based on required fields
  const calculateProgress = () => {
    const requiredFields = ['amount', 'category', 'date', 'description'];
    const completedFields = requiredFields.filter(field => 
      formData[field] && formData[field].toString().trim() !== ''
    ).length;
    return (completedFields / requiredFields.length) * 100;
  };

  return (
    <div className="expense-form-wrapper">
      <div className={`expense-form-container ${isSubmitted ? 'form-success' : ''}`}>
        {/* Header with Back Button */}
        <div className="form-header">
          <h2>
            <span className="form-icon">
              {editExpense ? '✏️' : '💰'}
            </span>
            {editExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <div className="form-actions-header">
            {onGoBack && (
              <button 
                type="button" 
                className="btn-back"
                onClick={onGoBack}
                aria-label="Go back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            )}
            {!editExpense && (
              <button 
                type="button" 
                className="btn btn-clear"
                onClick={clearForm}
                title="Clear form"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
        
        

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="expense-form">
          {/* Receipt Upload Component */}
          <div className="form-group">
            <div className="form-group-header">
              <label>📄 Receipt Upload (Optional)</label>
              <span className="form-hint">Upload a receipt to auto-fill form data</span>
            </div>
            <div className="receipt-upload-container">
              <ReceiptUpload 
                onProcessed={handleReceiptProcessed} 
                onError={handleReceiptError} 
              />
            </div>
          </div>
          
          {/* Amount Field */}
          <div className={`form-group ${fieldErrors.amount ? 'has-error' : ''}`}>
            <label htmlFor="amount">
              💵 Amount
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="number"
                step="0.01"
                id="amount"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                placeholder="0.00"
              />
            </div>
            {fieldErrors.amount && (
              <div className="field-error">{fieldErrors.amount}</div>
            )}
          </div>
          
          {/* Category Field */}
          <div className={`form-group ${fieldErrors.category ? 'has-error' : ''}`}>
            <label htmlFor="category">
              🏷️ Category
              <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Choose a category...</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {fieldErrors.category && (
              <div className="field-error">{fieldErrors.category}</div>
            )}
          </div>
          
          {/* Date Field */}
          <div className="form-group">
            <label htmlFor="date">
              📅 Date
              <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Description Field */}
          <div className={`form-group ${fieldErrors.description ? 'has-error' : ''}`}>
            <label htmlFor="description">
              📝 Description
              <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="What was this expense for?"
              maxLength="500"
            ></textarea>
            <div className="character-count">
              {formData.description.length}/500 characters
            </div>
            {fieldErrors.description && (
              <div className="field-error">{fieldErrors.description}</div>
            )}
          </div>
          
          {/* Hidden field for receipt path */}
          <input
            type="hidden"
            id="receipt"
            name="receipt"
            value={formData.receipt}
          />
          
          {/* Receipt Preview */}
          {receiptPreview && (
            <div className="form-group">
              <div className="receipt-preview-header">
                <label>🖼️ Receipt Preview</label>
                <button 
                  type="button" 
                  className="btn-remove-receipt"
                  onClick={removeReceipt}
                  title="Remove receipt"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="receipt-preview">
                {/\.pdf($|\?)/i.test(receiptPreview) ? (
                  <iframe
                    title="Receipt PDF"
                    src={receiptPreview}
                    style={{ width: '100%', height: '360px', border: 'none' }}
                  />
                ) : (
                  <img 
                    src={receiptPreview} 
                    alt="Receipt" 
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="form-actions">
            <div className="form-actions-left">
              {!editExpense && (
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={clearForm}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  </svg>
                  Clear Form
                </button>
              )}
            </div>
            <div className="form-actions-right">
              {onGoBack && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={onGoBack}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || Object.keys(fieldErrors).length > 0}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    {editExpense ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    {editExpense ? 'Update Expense' : 'Add Expense'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;