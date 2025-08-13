import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';
import ReceiptViewer from './ReceiptViewer';
import '../styles/ExpenseList.css';
import Lottie from 'lottie-react';
import dashboardLoadingAnimation from '../assets/dashboard-loading.json';

const LOCAL_PLACEHOLDER = require('../assets/receipt-placeholder.png'); // Add a local placeholder image to assets

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories] = useState(['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Travel', 'Other']);
  const [quickFilters, setQuickFilters] = useState({
    today: false,
    thisWeek: false,
    thisMonth: false,
    hasReceipt: false
  });
  
  const navigate = useNavigate();

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== '' && value !== 1 && value !== 10 && value !== 'date:desc').length +
                 selectedCategories.length +
                 Object.values(quickFilters).filter(Boolean).length +
                 (searchQuery ? 1 : 0);
    setActiveFiltersCount(count);
  }, [filters, selectedCategories, quickFilters, searchQuery]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        
        // Add search query
        if (searchQuery) {
          activeFilters.search = searchQuery;
        }
        
        // Add selected categories
        if (selectedCategories.length > 0) {
          activeFilters.categories = selectedCategories.join(',');
        }
        
        // Add quick filters - only if manual date filters are not set
        if (quickFilters.today && !activeFilters.startDate && !activeFilters.endDate) {
          const today = new Date().toISOString().split('T')[0];
          activeFilters.startDate = today;
          activeFilters.endDate = today;
        }
        if (quickFilters.thisWeek && !activeFilters.startDate && !activeFilters.endDate) {
          const today = new Date();
          const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
          activeFilters.startDate = startOfWeek.toISOString().split('T')[0];
          activeFilters.endDate = new Date().toISOString().split('T')[0];
        }
        if (quickFilters.thisMonth && !activeFilters.startDate && !activeFilters.endDate) {
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          activeFilters.startDate = startOfMonth.toISOString().split('T')[0];
          activeFilters.endDate = endOfMonth.toISOString().split('T')[0];
        }
        if (quickFilters.hasReceipt) {
          activeFilters.hasReceipt = 'true';
        }
        
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
  }, [filters, searchQuery, selectedCategories, quickFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name !== 'page' && name !== 'limit' ? { page: 1 } : {})
    }));
    
    // Clear quick date filters when manual date filters are set
    if ((name === 'startDate' || name === 'endDate') && value) {
      setQuickFilters(prev => ({
        ...prev,
        today: false,
        thisWeek: false,
        thisMonth: false
      }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleQuickFilterToggle = (filterName) => {
    setQuickFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName],
      // Clear other quick filters if selecting a new one
      ...(filterName === 'today' && !prev.today ? { thisWeek: false, thisMonth: false } : {}),
      ...(filterName === 'thisWeek' && !prev.thisWeek ? { today: false, thisMonth: false } : {}),
      ...(filterName === 'thisMonth' && !prev.thisMonth ? { today: false, thisWeek: false } : {})
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
    setSearchQuery('');
    setSelectedCategories([]);
    setQuickFilters({
      today: false,
      thisWeek: false,
      thisMonth: false,
      hasReceipt: false
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
            e.target.src = LOCAL_PLACEHOLDER; // Use local fallback image
          }}
        />
        <span>View</span>
      </button>
    );
  };

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <div className="header-content">
          <h1>Your Expenses</h1>
          <div className="expense-stats">
            <span className="stat-item">
              <i className="fas fa-receipt"></i>
              {pagination?.total || 0} expenses
            </span>
            {pagination?.total > 0 && (
              <span className="stat-item">
                <i className="fas fa-dollar-sign"></i>
                Total: $
                {expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Link to="/expenses/add" className="add-expense-btn">
          <i className="fas fa-plus"></i> Add New Expense
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Enhanced Filter Card */}
      <div className="filter-card">
        <div className="filter-header">
          <div className="filter-title">
            <i className="fas fa-filter"></i> 
            <span>Filters & Search</span>
            {activeFiltersCount > 0 && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
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

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search expenses by description, category, or amount..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="quick-filters">
          <div className="quick-filter-label">Quick Filters:</div>
          <div className="quick-filter-buttons">
            <button 
              className={`quick-filter-btn ${quickFilters.today ? 'active' : ''}`}
              onClick={() => handleQuickFilterToggle('today')}
            >
              <i className="fas fa-calendar-day"></i> Today
            </button>
            <button 
              className={`quick-filter-btn ${quickFilters.thisWeek ? 'active' : ''}`}
              onClick={() => handleQuickFilterToggle('thisWeek')}
            >
              <i className="fas fa-calendar-week"></i> This Week
            </button>
            <button 
              className={`quick-filter-btn ${quickFilters.thisMonth ? 'active' : ''}`}
              onClick={() => handleQuickFilterToggle('thisMonth')}
            >
              <i className="fas fa-calendar-alt"></i> This Month
            </button>
            <button 
              className={`quick-filter-btn ${quickFilters.hasReceipt ? 'active' : ''}`}
              onClick={() => handleQuickFilterToggle('hasReceipt')}
            >
              <i className="fas fa-receipt"></i> With Receipt
            </button>
          </div>
        </div>
        
        {showFilters && (
          <>
            {/* Category Filter */}
            <div className="category-filter-section">
              <div className="filter-section-title">Categories</div>
              <div className="category-chips">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    className={`category-chip ${selectedCategories.includes(category) ? 'selected' : ''}`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                    {selectedCategories.includes(category) && (
                      <i className="fas fa-check"></i>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-form-grid">
              <div className="filter-date-inputs">
                <div className="filter-date-group">
                  <label className="filter-label" htmlFor="startDate">From Date</label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-calendar-alt input-icon"></i>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      className="filter-input filter-date-input"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="filter-date-group">
                  <label className="filter-label" htmlFor="endDate">To Date</label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-calendar-alt input-icon"></i>
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
              </div>

              <div className="filter-amount-inputs">
                <div className="filter-group">
                  <label className="filter-label" htmlFor="minAmount">Minimum Amount</label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-dollar-sign input-icon"></i>
                    <input
                      type="number"
                      id="minAmount"
                      name="minAmount"
                      className="filter-input"
                      value={filters.minAmount}
                      onChange={handleFilterChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-label" htmlFor="maxAmount">Maximum Amount</label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-dollar-sign input-icon"></i>
                    <input
                      type="number"
                      id="maxAmount"
                      name="maxAmount"
                      className="filter-input"
                      value={filters.maxAmount}
                      onChange={handleFilterChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label" htmlFor="sortBy">Sort By</label>
                <div className="select-wrapper">
                  <select
                    id="sortBy"
                    name="sortBy"
                    className="filter-input filter-select"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="date:desc">📅 Date (Newest First)</option>
                    <option value="date:asc">📅 Date (Oldest First)</option>
                    <option value="amount:desc">💰 Amount (Highest First)</option>
                    <option value="amount:asc">💰 Amount (Lowest First)</option>
                    <option value="category:asc">📂 Category (A-Z)</option>
                    <option value="category:desc">📂 Category (Z-A)</option>
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label" htmlFor="limit">Items per page</label>
                <div className="select-wrapper">
                  <select
                    id="limit"
                    name="limit"
                    className="filter-input filter-select"
                    value={filters.limit}
                    onChange={handleFilterChange}
                  >
                    <option value="5">5 items</option>
                    <option value="10">10 items</option>
                    <option value="25">25 items</option>
                    <option value="50">50 items</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="filter-btn reset-btn" onClick={resetFilters}>
                <i className="fas fa-undo"></i> Clear All Filters
              </button>
              <div className="filter-summary">
                {activeFiltersCount > 0 && (
                  <span className="active-filters-text">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                  </span>
                )}
              </div>
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
                        <span className="expense-description" title={expense.description}>
                          {expense.description}
                        </span>
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
              <div className="pagination-info">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
              </div>
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
          <p className="no-data-text">
            {activeFiltersCount > 0 
              ? "No expenses match your current filters. Try adjusting your search criteria."
              : "No expenses found. Add a new expense to get started!"
            }
          </p>
          {activeFiltersCount > 0 ? (
            <button onClick={resetFilters} className="no-data-btn">
              <i className="fas fa-filter"></i> Clear Filters
            </button>
          ) : (
            <Link to="/expenses/add" className="no-data-btn">
              <i className="fas fa-plus-circle"></i> Add Your First Expense
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;