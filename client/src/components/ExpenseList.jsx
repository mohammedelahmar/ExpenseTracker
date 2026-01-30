import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';
import { makeSafeUrl } from '../utils/url';
import ReceiptViewer from './ReceiptViewer';
// import '../styles/ExpenseList.css'; // Removed
import Lottie from 'lottie-react';
import dashboardLoadingAnimation from '../assets/dashboard-loading.json';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Calendar, 
  Receipt, 
  DollarSign, 
  Check, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const LOCAL_PLACEHOLDER = require('../assets/receipt-placeholder.png');

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
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
          No receipt
        </span>
      );
    }

    const receiptUrl = makeSafeUrl(receipt);

    return (
      <button
        className="group relative flex items-center gap-2 hover:opacity-80 transition-opacity"
        onClick={() => setViewReceipt({
          show: true,
          url: receiptUrl,
          description: description
        })}
      >
        <div className="relative">
          <img
            src={receiptUrl}
            alt="Receipt"
            className="w-10 h-10 object-cover rounded-lg border-2 border-gray-100 shadow-sm group-hover:border-primary-200 transition-colors"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = LOCAL_PLACEHOLDER; 
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
            <Search className="text-white opacity-0 group-hover:opacity-100 w-4 h-4 drop-shadow-md" />
          </div>
        </div>
        <span className="text-sm font-medium text-primary-600 hidden lg:inline-block">View</span>
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-gray-50/30">
        {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="header-content">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-sky-500 mb-2">
            Your Expenses
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-2">
              <Receipt size={16} className="text-sky-500" />
              {pagination?.total || 0} expenses
            </span>
            {pagination?.total > 0 && (
              <span className="flex items-center gap-2">
                <DollarSign size={16} className="text-sky-500" />
                Total: $
                {expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Link 
          to="/expenses/add" 
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-sky-500 text-white font-semibold rounded-full shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all text-sm"
        >
          <Plus size={18} /> Add New Expense
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Enhanced Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
            <Filter size={20} className="text-sky-500" /> 
            <span>Filters & Search</span>
            {activeFiltersCount > 0 && (
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-primary-500 to-sky-500 text-white text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <>Hide Filters <ChevronUp size={16} /></>
            ) : (
              <>Show Filters <ChevronDown size={16} /></>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-2">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search expenses by description, category, or amount..."
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-gray-700 placeholder-gray-400"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Quick Filters</div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'today', icon: Calendar, label: 'Today' },
              { id: 'thisWeek', icon: Calendar, label: 'This Week' },
              { id: 'thisMonth', icon: Calendar, label: 'This Month' },
              { id: 'hasReceipt', icon: Receipt, label: 'With Receipt' }
            ].map(filter => {
              const Icon = filter.icon;
              return (
                <button 
                  key={filter.id}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    quickFilters[filter.id] 
                      ? 'bg-gradient-to-r from-primary-500 to-sky-500 text-white shadow-md shadow-primary-500/20 border-transparent' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                  }`}
                  onClick={() => handleQuickFilterToggle(filter.id)}
                >
                  <Icon size={14} /> {filter.label}
                </button>
              );
            })}
          </div>
        </div>
        
        {showFilters && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            {/* Category Filter */}
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Categories</div>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCategories.includes(category) 
                        ? 'bg-sky-100 text-sky-700 border border-sky-200' 
                        : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                    {selectedCategories.includes(category) && (
                      <Check size={14} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="startDate"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="endDate"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Min Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    type="number"
                    name="minAmount"
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Max Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    type="number"
                    name="maxAmount"
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <div className="relative">
                  <select
                    name="sortBy"
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm appearance-none"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="date:desc">Date (Newest First)</option>
                    <option value="date:asc">Date (Oldest First)</option>
                    <option value="amount:desc">Amount (Highest First)</option>
                    <option value="amount:asc">Amount (Lowest First)</option>
                    <option value="category:asc">Category (A-Z)</option>
                    <option value="category:desc">Category (Z-A)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Items per page</label>
                <div className="relative">
                  <select
                    name="limit"
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm appearance-none"
                    value={filters.limit}
                    onChange={handleFilterChange}
                  >
                    <option value="5">5 items</option>
                    <option value="10">10 items</option>
                    <option value="25">25 items</option>
                    <option value="50">50 items</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="text-sm font-medium text-primary-600">
                {activeFiltersCount > 0 && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full border border-primary-100">
                     ✨ {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" 
                onClick={resetFilters}
              >
                <RefreshCw size={14} /> Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Lottie 
            animationData={dashboardLoadingAnimation}
            loop={true}
            style={{ width: 180, height: 180 }}
          />
          <p className="mt-4 text-gray-500 font-medium">Fetching your expenses...</p>
        </div>
      ) : expenses.length > 0 ? (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map(expense => {
                    const { day, year } = formatDate(expense.date);
                    return (
                      <tr key={expense._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-800 leading-tight">{day}</span>
                            <span className="text-xs text-gray-500">{year}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 font-medium line-clamp-1 max-w-[200px]" title={expense.description}>
                            {expense.description}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-red-500 font-mono tracking-wide bg-red-50 px-2 py-1 rounded-md border border-red-100">
                            -${parseFloat(expense.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {renderReceipt(expense.receipt, expense.description)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100"
                              onClick={() => navigate(`/expenses/edit/${expense._id}`)}
                              title="Edit expense"
                              aria-label="Edit expense"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              onClick={() => handleDelete(expense._id)}
                              title="Delete expense"
                              aria-label="Delete expense"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ReceiptViewer 
            show={viewReceipt.show}
            onHide={() => setViewReceipt({ show: false, url: null, description: '' })}
            receiptUrl={viewReceipt.url}
            description={viewReceipt.description}
          />

          {pagination && pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 gap-4">
              <div className="text-sm text-gray-500 font-medium">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
              </div>
              <div className="flex items-center gap-1">
                <button 
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1 mx-2">
                  {[...Array(pagination.pages).keys()].map(page => (
                    <button 
                      key={page + 1} 
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        pagination.page === page + 1 
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center border-dashed border-2 border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
            <Receipt size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {activeFiltersCount > 0 ? 'No matching expenses' : 'No expenses yet'}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            {activeFiltersCount > 0 
              ? "We couldn't find any expenses matching your current filters. Try adjusting your search criteria."
              : "Track your first expense to see your spending insights here."
            }
          </p>
          {activeFiltersCount > 0 ? (
            <button 
              onClick={resetFilters} 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} /> Clear Filters
            </button>
          ) : (
            <Link 
              to="/expenses/add" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 shadow-md transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} /> Add Your First Expense
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;