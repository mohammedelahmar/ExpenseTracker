import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import goalService from '../../services/goalService';
import { Target, ArrowRight, Plus, PiggyBank, Car, Home, GraduationCap, Briefcase, Smartphone, Heart } from 'lucide-react';
// import '../../styles/GoalsSummary.css'; // Removed

const GoalsSummary = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await goalService.fetchGoals();
        const activeGoals = data
          .filter(goal => !goal.isCompleted)
          .sort((a, b) => a.targetDate - b.targetDate)
          .slice(0, 3); // Get top 3 upcoming goals
        setGoals(activeGoals);
      } catch (err) {
        // failed to load goals
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const getIcon = (iconName) => {
    const icons = {
      'piggy-bank': PiggyBank,
      'car': Car,
      'home': Home,
      'graduation-cap': GraduationCap,
      'briefcase': Briefcase,
      'mobile-alt': Smartphone,
      'heart': Heart
    };
    const IconComponent = icons[iconName] || Target;
    return <IconComponent size={20} className="text-white" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-pink-500" size={20} />
            Financial Goals
          </h3>
        </div>
        <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-3">
            <Target className="text-pink-400" size={24} />
          </div>
          <p className="text-gray-500 mb-6 font-medium">You don't have any active goals yet.</p>
          <Link 
            to="/goals/add" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
          >
            <Plus size={16} /> Create a Goal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Target className="text-pink-500" size={20} />
          Financial Goals
        </h3>
        <Link 
          to="/goals" 
          className="text-sm font-medium text-pink-500 hover:text-pink-700 flex items-center gap-1 transition-colors group"
        >
          View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="p-0 flex-1">
        <div className="divide-y divide-gray-50">
          {goals.map(goal => (
            <div key={goal._id} className="p-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-sm flex-shrink-0">
                  {getIcon(goal.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-800 truncate pr-2">{goal.name}</h4>
                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                      {goal.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-pink-400 to-rose-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${goal.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>${goal.currentAmount.toFixed(0)} saved</span>
                    <span>Target: ${goal.targetAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          to="/goals/add" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
        >
          <Plus size={16} /> Add New Goal
        </Link>
      </div>
    </div>
  );
};

export default GoalsSummary;