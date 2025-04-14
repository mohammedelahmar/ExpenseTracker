import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';
import '../styles/ExpenseList.css';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 10,
    sortBy: 'date:desc'
  });
  const navigate = useNavigate();

  // Load expenses when component mounts or filters change
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        // Remove empty filters
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        
        const result = await expenseService.fetchExpenses(activeFilters);
        setExpenses(result.expenses);
        setPagination(result.pagination);
        setLoading(false);
      } catch (err) {
        setError('Failed to load expenses');
        console.error(err);
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset to page 1 when filters change
      ...(name !== 'page' && name !== 'limit' ? { page: 1 } : {})
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination?.pages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        setExpenses(expenses.filter(expense => expense._id !== id));
      } catch (err) {
        setError('Failed to delete expense');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h1>Expenses</h1>
        <Link to="/expenses/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add New Expense
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter Form */}
      <div className="filter-section card">
        <h3>Filters</h3>
        <div className="filter-form">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-4">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                className="form-control"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Filter by category"
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="minAmount">Min Amount</label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                className="form-control"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="Min amount"
                min="0"
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="maxAmount">Max Amount</label>
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                className="form-control"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="Max amount"
                min="0"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-12">
              <label htmlFor="sortBy">Sort By</label>
              <select
                id="sortBy"
                name="sortBy"
                className="form-control"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="date:desc">Date (Newest First)</option>
                <option value="date:asc">Date (Oldest First)</option>
                <option value="amount:desc">Amount (Highest First)</option>
                <option value="amount:asc">Amount (Lowest First)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : expenses.length > 0 ? (
        <>
          <div className="table-responsive">
            <table className="table expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense._id}>
                    <td>{formatDate(expense.date)}</td>
                    <td>{expense.category}</td>
                    <td>{expense.description}</td>
                    <td>${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => navigate(`/expenses/edit/${expense._id}`)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(expense._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <nav aria-label="Expense pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(pagination.pages).keys()].map(page => (
                  <li 
                    key={page + 1} 
                    className={`page-item ${pagination.page === page + 1 ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="no-data-message">
          <p>No expenses found. Add a new expense to get started!</p>
          <Link to="/expenses/add" className="btn btn-primary">
            Add Your First Expense
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;