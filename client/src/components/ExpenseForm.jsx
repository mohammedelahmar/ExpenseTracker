import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/ExpenseForm.css'; // You'll need to create this CSS file
import ReceiptUpload from './ReceiptUpload';

const ExpenseForm = ({ editExpense = null, onSubmitSuccess }) => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    description: '',
    receipt: ''
  });
  const [receiptPreview, setReceiptPreview] = useState(null);

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
      
      // Set receipt preview if available
      if (editExpense.receipt) {
        setReceiptPreview(`http://localhost:5000/${editExpense.receipt}`);
      }
    }
  }, [editExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle receipt processing
  const handleReceiptProcessed = (receiptData) => {
    console.log('Receipt data received:', receiptData);
    
    // Format the date if it exists
    let formattedDate = formData.date;
    if (receiptData.date) {
      try {
        // Try to parse and format the date
        const parsedDate = new Date(receiptData.date);
        if (!isNaN(parsedDate)) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
    
    // Update form with extracted data
    setFormData(prevData => {
      const newData = {
        ...prevData,
        amount: receiptData.amount || prevData.amount,
        category: receiptData.category || prevData.category,
        description: receiptData.description || receiptData.merchant || prevData.description,
        date: formattedDate,
        receipt: receiptData.receipt || prevData.receipt
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    
    // Set receipt preview
    if (receiptData.receipt) {
      setReceiptPreview(`http://localhost:5000/${receiptData.receipt}`);
    }
  };
  
  // Handle receipt processing error
  const handleReceiptError = (error) => {
    console.error("Receipt processing error:", error);
    setError('Error processing receipt. Please try again or enter details manually.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      let response;
      if (editExpense) {
        // Update existing expense
        response = await axios.put(
          `/api/expenses/${editExpense._id}`,
          formData,
          config
        );
      } else {
        // Create new expense
        response = await axios.post('/api/expenses', formData, config);
      }

      setLoading(false);
      
      // Reset form after successful submission
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
      
      // Notify parent component of successful submission
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
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

  return (
    <div className="expense-form-container card">
      <h2>{editExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Receipt Upload Component */}
        <div className="form-group receipt-upload-container">
          <ReceiptUpload 
            onProcessed={handleReceiptProcessed} 
            onError={(err) => setError('Receipt processing failed')} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
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
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
          ></textarea>
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
            <label>Receipt Image</label>
            <div className="receipt-preview">
              <img 
                src={receiptPreview} 
                alt="Receipt" 
                style={{ maxWidth: '100%', maxHeight: '150px' }} 
              />
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editExpense ? 'Update Expense' : 'Add Expense')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;