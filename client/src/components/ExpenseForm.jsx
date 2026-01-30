import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ReceiptUpload from './ReceiptUpload';
import { makeSafeUrl } from '../utils/url';
import { 
  ArrowLeft, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  Tag, 
  Calendar, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  X,
  CreditCard,
  Pencil
} from 'lucide-react';
// import '../styles/ExpenseForm.css'; // Removed

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
            const res = await api.get('/categories');
          setCategories(res.data);
        } catch (err) {
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
        const safeUrl = makeSafeUrl(editExpense.receipt);
        setReceiptPreview(safeUrl);
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
    let formattedDate = formData.date;
    if (receiptData.date) {
      try {
        const parsedDate = new Date(receiptData.date);
        if (!isNaN(parsedDate)) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
  // ignore parsing errors
      }
    }
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        amount: (typeof receiptData.amount === 'number' && receiptData.amount > 0) ? receiptData.amount : prevData.amount,
        category: receiptData.category || prevData.category,
        description: receiptData.description || receiptData.merchant || prevData.description,
        date: formattedDate,
        receipt: receiptData.receipt || prevData.receipt
      };
      return newData;
    });
    
    if (receiptData.receipt) {
      const safeUrl = makeSafeUrl(receiptData.receipt);
      setReceiptPreview(safeUrl);
    }
    
    setSuccess('Receipt processed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const handleReceiptError = (error) => {
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
      let response;
      if (editExpense) {
        response = await api.put(
          `/expenses/${editExpense._id}`,
          formData
        );
        setSuccess('Expense updated successfully!');
      } else {
        response = await api.post('/expenses', formData);
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

  return (
    <div className="bg-gray-50/50 min-h-screen py-8 px-4 flex justify-center">
      <div className={`w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ${isSubmitted ? 'ring-2 ring-green-100' : ''}`}>
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className={`p-3 rounded-full ${editExpense ? 'bg-amber-50 text-amber-500' : 'bg-primary-50 text-primary-600'}`}>
              {editExpense ? <Pencil size={24} /> : <CreditCard size={24} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {editExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!editExpense && (
              <button 
                type="button" 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors"
                onClick={clearForm}
                title="Clear form"
              >
                <Trash2 size={16} />
                Clear
              </button>
            )}
            
            {onGoBack && (
              <button 
                type="button" 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
                onClick={onGoBack}
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>
        </div>
        
        {/* Alert Messages */}
        <div className="px-6 md:px-8 pt-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-start animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-100 flex items-start animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Receipt Upload Component */}
          <div className="bg-gradient-to-br from-primary-50/50 to-sky-50/30 rounded-2xl p-6 border border-primary-100/50">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <ImageIcon size={16} className="text-primary-500" />
                Receipt Upload (Optional)
              </label>
              <span className="text-xs text-gray-500 italic hidden sm:inline-block">Upload a receipt to auto-fill details</span>
            </div>
            <ReceiptUpload 
              onProcessed={handleReceiptProcessed} 
              onError={handleReceiptError} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Amount Field */}
            <div className={`space-y-2 ${fieldErrors.amount ? 'has-error' : ''}`}>
              <label htmlFor="amount" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <DollarSign size={16} className="text-gray-400" />
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  id="amount"
                  name="amount"
                  className={`w-full pl-8 pr-4 py-3 bg-white border ${fieldErrors.amount ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'} rounded-xl outline-none transition-all font-mono text-lg font-medium text-gray-800 placeholder-gray-300`}
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  placeholder="0.00"
                  data-testid="expense-amount"
                />
              </div>
              {fieldErrors.amount && (
                <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {fieldErrors.amount}
                </div>
              )}
            </div>
            
            {/* Category Field */}
            <div className={`space-y-2 ${fieldErrors.category ? 'has-error' : ''}`}>
              <label htmlFor="category" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag size={16} className="text-gray-400" />
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  className={`w-full pl-4 pr-10 py-3 bg-white border ${fieldErrors.category ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'} rounded-xl outline-none transition-all appearance-none text-gray-700`}
                  value={formData.category}
                  onChange={handleChange}
                  required
                  data-testid="expense-category"
                >
                  <option value="">Choose a category...</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
              {fieldErrors.category && (
                <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {fieldErrors.category}
                </div>
              )}
            </div>
            
            {/* Date Field */}
            <div className="space-y-2">
              <label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all text-gray-700"
                value={formData.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                data-testid="expense-date"
              />
            </div>
          </div>
          
          {/* Description Field */}
          <div className={`space-y-2 ${fieldErrors.description ? 'has-error' : ''}`}>
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} className="text-gray-400" />
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={`w-full px-4 py-3 bg-white border ${fieldErrors.description ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50'} rounded-xl outline-none transition-all text-gray-700 min-h-[120px] resize-y placeholder-gray-400`}
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="What was this expense for?"
              maxLength="500"
              data-testid="expense-description"
            ></textarea>
            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
              <span>{fieldErrors.description && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={10} /> {fieldErrors.description}</span>}</span>
              <span className={formData.description.length > 450 ? 'text-amber-500' : ''}>
                {formData.description.length}/500
              </span>
            </div>
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
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <ImageIcon size={16} className="text-primary-500" />
                  Receipt Preview
                </label>
                <button 
                  type="button" 
                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                  onClick={removeReceipt}
                  title="Remove receipt"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-center bg-white border border-gray-200 rounded-xl overflow-hidden p-2 shadow-sm">
                {/\.pdf($|\?)/i.test(receiptPreview) ? (
                  <iframe
                    title="Receipt PDF"
                    src={receiptPreview}
                    className="w-full h-80 border-0"
                  />
                ) : (
                  <img 
                    src={receiptPreview} 
                    alt="Receipt" 
                    className="max-h-80 object-contain rounded-lg"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="pt-8 mt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-end">
             {onGoBack && (
              <button 
                type="button" 
                className="order-2 sm:order-1 px-8 py-3.5 rounded-full font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                onClick={onGoBack}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            
            <button 
              type="submit" 
              className="order-1 sm:order-2 flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-primary-600 to-sky-500 hover:from-primary-700 hover:to-sky-600 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              disabled={loading || Object.keys(fieldErrors).length > 0}
              data-testid="expense-submit"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {editExpense ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  {editExpense ? 'Update Expense' : 'Add Expense'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;