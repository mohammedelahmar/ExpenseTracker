import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import goalService from '../../services/goalService';
import ContributeModal from './ContributeModal';
import { Target, Calendar, PiggyBank, Trash2, Edit, Plus, CheckCircle, AlertCircle, TrendingUp, Clock, DollarSign } from 'lucide-react';
// import '../../styles/GoalProgressCard.css'; // Removed

const GoalProgressCard = ({ goal, onUpdate }) => {
  const navigate = useNavigate();
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate days remaining
  const calculateDaysLeft = () => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Calculate required monthly saving to reach goal
  const calculateMonthlySaving = () => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    if (remainingAmount <= 0) return 0;
    
    // Calculate months between dates
    const months = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                  (targetDate.getMonth() - today.getMonth());
    
    // Return monthly amount needed (minimum 1 month)
    return months > 0 ? remainingAmount / months : remainingAmount;
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
      try {
        setLoading(true);
        await goalService.deleteGoal(goal._id);
        if (onUpdate) onUpdate();
      } catch (err) {
          setError('Failed to delete goal');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleContribution = async (amount) => {
    try {
      setLoading(true);
      await goalService.contributeToGoal(goal._id, amount);
      if (onUpdate) onUpdate();
      setShowContributeModal(false);
    } catch (err) {
      setError('Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Determine goal status color theme
  const getTheme = () => {
    if (goal.isCompleted) return {
      main: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      icon: <CheckCircle size={24} />
    };
    
    const daysLeft = calculateDaysLeft();
    if (daysLeft <= 30) return {
      main: 'rose',
      gradient: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-200',
      icon: <AlertCircle size={24} />
    };

    if (goal.progressPercentage >= 75) return {
      main: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      icon: <TrendingUp size={24} />
    };
    
    return {
      main: 'primary',
      gradient: 'from-primary-500 to-primary-600',
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      border: 'border-primary-200',
      icon: <Target size={24} />
    };
  };

  const theme = getTheme();

  // Dynamic classes based on theme
  const themeClasses = {
    headerIcon: `w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${theme.gradient}`,
    categoryBadge: `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.bg} ${theme.text} border ${theme.border}`,
    progressBar: `h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-1000 ease-out relative overflow-hidden`,
    statsItem: `flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-${theme.main}-200 hover:shadow-sm transition-all`,
    addButton: `flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all bg-gradient-to-r ${theme.gradient}`,
    dateIcon: `${theme.text}`
  };

  return (
    <>
      <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group`}>
        {/* Top border highlight */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.gradient}`}></div>

        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">{error}</div>}
        
        <div className="flex items-start justify-between mb-6 pt-2">
          <div className="flex items-center gap-4">
            <div className={themeClasses.headerIcon}>
              {theme.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight mb-1">{goal.name}</h3>
              {goal.category && <span className={themeClasses.categoryBadge}>{goal.category}</span>}
            </div>
          </div>
          
          {goal.isCompleted && (
             <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-lg">
               <CheckCircle size={14} /> Achieved
             </span>
          )}
        </div>
        
        <div className="mb-6 relative z-10">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-3 shadow-inner">
             <div 
               className={themeClasses.progressBar} 
               style={{ width: `${goal.progressPercentage}%` }}
             >
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
             </div>
          </div>
          <div className="flex justify-between items-end">
            <span className={`text-2xl font-bold ${theme.text}`}>{goal.progressPercentage}%</span>
            <div className="text-right">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-0.5">Target</span>
              <span className="text-sm font-bold text-gray-700">{formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Saved</div>
             <div className="text-lg font-bold text-gray-800">{formatCurrency(goal.currentAmount)}</div>
          </div>
          <div className="flex-1 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">To Go</div>
             <div className="text-lg font-bold text-gray-800">{formatCurrency(goal.targetAmount - goal.currentAmount)}</div>
          </div>
        </div>
        
        {!goal.isCompleted && (
          <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-t border-b border-gray-100 border-dashed">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-50 ${themeClasses.dateIcon}`}>
                <Clock size={18} />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase block">Days Left</span>
                <span className="font-bold text-gray-800">{calculateDaysLeft()} days</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-50 ${themeClasses.dateIcon}`}>
                <PiggyBank size={18} />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase block">Monthly</span>
                <span className="font-bold text-gray-800">{formatCurrency(calculateMonthlySaving())}</span>
              </div>
            </div>
          </div>
        )}
        
        {goal.description && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border-l-4 border-gray-300 text-sm text-gray-600 italic">
            "{goal.description}"
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Calendar size={16} className="text-gray-400" />
            <span>Target: {formatDate(goal.targetDate)}</span>
          </div>
          
          <div className="flex gap-2">
            {!goal.isCompleted && (
              <button 
                className={themeClasses.addButton}
                onClick={() => setShowContributeModal(true)}
                disabled={loading}
              >
                <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Add</span>
              </button>
            )}
            
            <button
              className="p-2.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm"
              onClick={() => navigate(`/goals/edit/${goal._id}`)}
              title="Edit goal"
              disabled={loading}
            >
              <Edit size={18} />
            </button>
            <button
              className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-all shadow-sm"
              onClick={handleDelete}
              title="Delete goal"
              disabled={loading}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <ContributeModal
        show={showContributeModal}
        onHide={() => setShowContributeModal(false)}
        onContribute={handleContribution}
        goalName={goal.name}
        remainingAmount={goal.targetAmount - goal.currentAmount}
      />
    </>
  );
};

export default GoalProgressCard;