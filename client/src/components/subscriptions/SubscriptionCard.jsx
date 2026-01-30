import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Edit, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';

const SubscriptionCard = ({ subscription, onDelete, onRecordPayment }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days until next payment
  const daysUntil = () => {
    const today = new Date();
    const nextDate = new Date(subscription.nextBillingDate);
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const days = daysUntil();
  
  const getFrequencyText = () => {
    switch(subscription.frequency) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Annual';
      default: return subscription.frequency;
    }
  };

  // Determine theme based on category or status
  const getTheme = () => {
    if (subscription.status === 'cancelled') return {
      gradient: 'from-gray-400 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-gray-500', 
      border: 'border-gray-200'
    };
    
    if (subscription.status === 'paused') return {
      gradient: 'from-amber-400 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200'
    };

    // Default active theme based on category roughly
    switch(subscription.category) {
      case 'Entertainment': return { gradient: 'from-pink-500 to-rose-500', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
      case 'Utilities': return { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' };
      case 'Software': return { gradient: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'Food & Dining': return { gradient: 'from-orange-400 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
      default: return { gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
    }
  };

  const theme = getTheme();
  
  // Urgency indicator
  const isUrgent = days <= 3 && subscription.status === 'active';
  const isSoon = days <= 7 && !isUrgent && subscription.status === 'active';

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100 relative group flex flex-col h-full ${isUrgent ? 'ring-2 ring-rose-400' : ''}`}>
      
      {/* Header */}
      <div className={`p-6 bg-gradient-to-br ${theme.gradient} text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-xl font-bold shadow-sm">{subscription.name}</h3>
            <div className="text-white/80 text-sm font-medium uppercase tracking-wider mt-1">{subscription.category}</div>
          </div>
          {subscription.autoPay && (
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/30 flex items-center gap-1">
               <Clock size={12} /> Auto
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold text-gray-800 tracking-tight">{formatCurrency(subscription.amount)}</span>
          <span className="text-sm font-semibold text-gray-400 uppercase">/ {getFrequencyText()}</span>
        </div>
        
        <div className="mt-4 space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Calendar size={16} className="text-gray-400" />
              <span>Next bill</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-700">{formatDate(subscription.nextBillingDate)}</div>
              {subscription.status === 'active' && days <= 30 && (
                <div className={`text-xs font-bold ${days <= 3 ? 'text-rose-500' : days <= 7 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `${days} days left`}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              subscription.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              subscription.status === 'paused' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
              'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {subscription.status}
            </span>
          </div>
        </div>
        
        {subscription.description && (
          <div className="mb-6 text-sm text-gray-500 italic line-clamp-2">
            "{subscription.description}"
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              subscription.status === 'active' 
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-sm' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => onRecordPayment(subscription._id)}
            disabled={subscription.status !== 'active'}
            title="Record Payment"
          >
            <CheckCircle size={16} /> <span className="hidden sm:inline">Pay</span>
          </button>
          
          <Link 
            to={`/subscriptions/edit/${subscription._id}`} 
            className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-white hover:text-primary-600 hover:shadow-md border border-gray-100 hover:border-primary-100 transition-all"
            title="Edit"
          >
            <Edit size={16} />
          </Link>
          
          <button 
            className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:shadow-md border border-gray-100 hover:border-rose-100 transition-all"
            onClick={() => onDelete(subscription._id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {isUrgent && (
        <div className="absolute top-0 right-0 p-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;