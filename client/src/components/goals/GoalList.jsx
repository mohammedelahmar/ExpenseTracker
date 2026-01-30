import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goalService from '../../services/goalService';
import GoalProgressCard from './GoalProgressCard';
// import '../../styles/GoalList.css'; // Removed
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/dashboard-loading.json';
import { Plus, Target, CheckCircle, TrendingUp, Filter } from 'lucide-react';

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await goalService.fetchGoals();
        setGoals(data);
        setError('');
      } catch (err) {
        setError('Failed to load goals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // Filter goals based on active filter
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return !goal.isCompleted;
    if (filter === 'completed') return goal.isCompleted;
    return true;
  });

  // Calculations for overview section
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const activeGoals = totalGoals - completedGoals;
  
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSavedAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 
    ? Math.round((totalSavedAmount / totalTargetAmount) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 md:p-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Financial Goals</h1>
          <p className="text-primary-100 font-medium">Track, manage, and achieve your dreams</p>
        </div>
        
        <Link 
          to="/goals/add" 
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full font-bold text-white transition-all hover:bg-white/30 hover:scale-105 active:scale-95 shadow-lg group"
        >
          <Plus size={20} className="transition-transform group-hover:rotate-90" /> 
          Add New Goal
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Goals Overview Section */}
      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-300"></div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800 mb-2 group-hover:scale-110 transition-transform">
              {totalGoals}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Target size={14} /> Total Goals
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300"></div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              {activeGoals}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <TrendingUp size={14} /> Active Goals
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-300"></div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 mb-2 group-hover:scale-110 transition-transform">
              {completedGoals}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <CheckCircle size={14} /> Completed
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-violet-300"></div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-violet-400 mb-2 group-hover:scale-110 transition-transform">
              {overallProgress}%
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <TrendingUp size={14} /> Overall Progress
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex justify-center mb-8">
        <div className="flex p-1.5 bg-white rounded-full shadow-sm border border-gray-100 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Goals' },
            { id: 'active', label: 'Active Goals' },
            { id: 'completed', label: 'Completed Goals' }
          ].map((option) => (
            <button 
              key={option.id}
              className={`
                px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                ${filter === option.id 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }
              `}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-48 h-48">
            <Lottie 
              animationData={loadingAnimation} 
              loop={true}
            />
          </div>
          <p className="text-gray-500 font-medium mt-4">Loading your financial goals...</p>
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredGoals.map(goal => (
            <GoalProgressCard key={goal._id} goal={goal} onUpdate={() => {
              goalService.fetchGoals().then(data => setGoals(data));
            }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Target size={40} className="text-primary-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {filter !== 'all' ? `No ${filter} goals found` : 'Start achieving your dreams!'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-md">
            {filter !== 'all' 
              ? `You don't have any ${filter} goals at the moment.` 
              : 'Create your first financial goal to start tracking your progress and achieving your dreams.'}
          </p>
          <Link to="/goals/add" className="btn btn-primary px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            Create Your First Goal
          </Link>
        </div>
      )}
    </div>
  );
};

export default GoalList;