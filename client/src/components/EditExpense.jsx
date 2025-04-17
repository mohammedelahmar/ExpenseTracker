import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';

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

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        console.log(`Attempting to fetch expense with ID: ${id}`);
        
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
        
        console.log('Successfully received expense data:', data);
        
        // Format the date to YYYY-MM-DD for the date input
        const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
        setExpense({
          ...data,
          date: formattedDate
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching expense:', err);
        setError(`Failed to fetch expense details: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await expenseService.updateExpense(id, expense);
      navigate('/expenses');
    } catch (err) {
      setError('Failed to update expense');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-expense-container">
      <h1>Edit Expense</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            id="date"
            name="date"
            value={expense.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Amount</label>
          <input
            type="number"
            className="form-control"
            id="amount"
            name="amount"
            value={expense.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            id="category"
            name="category"
            value={expense.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={expense.description}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="receipt" className="form-label">Receipt URL (Optional)</label>
          <input
            type="text"
            className="form-control"
            id="receipt"
            name="receipt"
            value={expense.receipt || ''}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Update Expense</button>
        <button 
          type="button" 
          className="btn btn-secondary ms-2"
          onClick={() => navigate('/expenses')}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditExpense;