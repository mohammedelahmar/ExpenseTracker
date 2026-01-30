import React, { useState } from 'react';
import { X, DollarSign, Save } from 'lucide-react';
// import '../../styles/ContributeModal.css'; // Removed

const ContributeModal = ({ show, onHide, onContribute, goalName, remainingAmount }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  if (!show) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const contributionAmount = parseFloat(amount);
    
    if (!contributionAmount || contributionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (contributionAmount > remainingAmount) {
      setAmount(remainingAmount.toString());
    }
    
    onContribute(contributionAmount);
    setAmount('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-all animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Contribute to {goalName}</h3>
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={onHide}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm rounded-r-md">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="contributionAmount" className="block text-sm font-semibold text-gray-700 mb-2">
              Contribution Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="text-gray-400 h-5 w-5" />
              </div>
              <input
                type="number"
                id="contributionAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-lg font-medium"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                required
                autoFocus
                placeholder="0.00"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>Remaining to goal:</span>
              <span className="font-semibold text-gray-700">${remainingAmount.toFixed(2)}</span>
            </p>
          </div>
          
          <div className="flex gap-3 justify-end pt-2">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors" 
              onClick={onHide}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Save size={18} /> Add Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;