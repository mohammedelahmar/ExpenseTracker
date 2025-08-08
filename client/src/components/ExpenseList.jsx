import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';
import ReceiptViewer from './ReceiptViewer';
import '../styles/ExpenseList.css';
import Lottie from 'lottie-react';
import dashboardLoadingAnimation from '../assets/dashboard-loading.json';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
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
  const [viewReceipt, setViewReceipt] = useState({
    show: false,
    url: null,
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
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
      ...(name !== 'page' && name !== 'limit' ? { page: 1 } : {})
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination?.pages) {
      setFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      minAmount: '',
      maxAmount: '',
      page: 1,
      limit: 10,
      sortBy: 'date:desc'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const year = date.toLocaleDateString('en-US', { year: 'numeric' });
    return { day, year };
  };

  const renderReceipt = (receipt, description) => {
    if (!receipt) {
      return <span className="no-receipt">No receipt</span>;
    }
    
    const receiptUrl = receipt.startsWith('http') 
      ? receipt 
      : `http://localhost:5000/${receipt}`;
    
    return (
      <button
        className="receipt-link"
        onClick={() => setViewReceipt({ 
          show: true, 
          url: receiptUrl,
          description: description
        })}
      >
        <img 
          src={receiptUrl} 
          alt="Receipt" 
          className="receipt-thumbnail" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/50?text=Error";
          }}
        />
        <span>View</span>
      </button>
    );
  };

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h1>Your Expenses</h1>
        <Link to="/expenses/add" className="add-expense-btn">
          <i className="fas fa-plus"></i> Add New Expense
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filter-card">
        <div className="filter-header">
          <div className="filter-title">
            <i className="fas fa-filter"></i> Filters
          </div>
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <>Hide Filters <i className="fas fa-chevron-up"></i></>
            ) : (
              <>Show Filters <i className="fas fa-chevron-down"></i></>
            )}
          </button>
        </div>
        
        {showFilters && (
          <>
            <div className="filter-form-grid">
              <div className="filter-date-inputs">
                <div className="filter-date-group">
                  <label className="filter-label" htmlFor="startDate">From</label>
                  <i className="fas fa-calendar-alt"></i>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="filter-input filter-date-input"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="filter-date-group">
                  <label className="filter-label" htmlFor="endDate">To</label>
                  <i className="fas fa-calendar-alt"></i>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="filter-input filter-date-input"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label" htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="filter-input"
                  value={filters.category}
                  onChange={handleFilterChange}
                  placeholder="Filter by category"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label" htmlFor="minAmount">Minimum Amount</label>
                <input
                  type="number"
                  id="minAmount"
                  name="minAmount"
                  className="filter-input"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="Min amount"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label" htmlFor="maxAmount">Maximum Amount</label>
                <input
                  type="number"
                  id="maxAmount"
                  name="maxAmount"
                  className="filter-input"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="Max amount"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label" htmlFor="sortBy">Sort By</label>
                <select
                  id="sortBy"
                  name="sortBy"
                  className="filter-input filter-select"
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
            
            <div className="filter-actions">
              <button className="filter-btn reset-btn" onClick={resetFilters}>
                <i className="fas fa-undo"></i> Reset Filters
              </button>
              <button className="filter-btn apply-btn" onClick={() => setFilters({...filters})}>
                <i className="fas fa-search"></i> Apply Filters
              </button>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="loading-animation-container">
          <div className="loading-animation-wrapper">
            <Lottie 
              animationData={dashboardLoadingAnimation}
              loop={true}
              style={{ width: 180, height: 180 }}
            />
            <p className="loading-text">Fetching your expenses...</p>
          </div>
        </div>
      ) : expenses.length > 0 ? (
        <>
          <div className="expense-table-container">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => {
                  const { day, year } = formatDate(expense.date);
                  return (
                    <tr key={expense._id}>
                      <td data-label="Date">
                        <div className="expense-date">
                          <span className="expense-day">{day}</span>
                          <span className="expense-year">{year}</span>
                        </div>
                      </td>
                      <td data-label="Category">
                        <span className="expense-category">{expense.category}</span>
                      </td>
                      <td data-label="Description">
                        <span className="expense-description">{expense.description}</span>
                      </td>
                      <td data-label="Amount">
                        <span className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</span>
                      </td>
                      <td data-label="Receipt" className="receipt-cell">
                        {renderReceipt(expense.receipt, expense.description)}
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => navigate(`/expenses/edit/${expense._id}`)}
                            title="Edit expense"
                            aria-label="Edit expense"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(expense._id)}
                            title="Delete expense"
                            aria-label="Delete expense"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ReceiptViewer 
            show={viewReceipt.show}
            onHide={() => setViewReceipt({ show: false, url: null, description: '' })}
            receiptUrl={viewReceipt.url}
            description={viewReceipt.description}
          />

          {pagination && pagination.pages > 1 && (
            <div className="pagination-container">
              <ul className="pagination">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    aria-label="Previous page"
                  >
                    <i className="fas fa-chevron-left"></i>
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
                    aria-label="Next page"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="no-data-container">
          <div className="no-data-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <p className="no-data-text">No expenses found. Add a new expense to get started!</p>
          <Link to="/expenses/add" className="no-data-btn">
            <i className="fas fa-plus-circle"></i> Add Your First Expense
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;