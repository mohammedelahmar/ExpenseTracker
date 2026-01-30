import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import goalService from '../../services/goalService';
import { 
  PiggyBank, Home, Car, GraduationCap, Plane, 
  Laptop, Heart, Gift, BookOpen, Umbrella, 
  DollarSign, Calendar, Tag, FileText, Save, X 
} from 'lucide-react';
// import '../../styles/GoalForm.css'; // Removed

const GoalForm = ({ editGoal = null, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    category: '',
    description: '',
    icon: 'piggy-bank'
  });
  
  // Icons mapping
  const iconMap = {
    'piggy-bank': <PiggyBank size={24} />,
    'home': <Home size={24} />,
    'car': <Car size={24} />,
    'graduation-cap': <GraduationCap size={24} />,
    'plane': <Plane size={24} />,
    'laptop': <Laptop size={24} />,
    'heart': <Heart size={24} />,
    'gift': <Gift size={24} />,
    'book': <BookOpen size={24} />,
    'umbrella': <Umbrella size={24} />
  };

  const availableIcons = Object.keys(iconMap);

  // If editing an goal, populate form with goal data
  useEffect(() => {
    if (editGoal) {
      const targetDate = editGoal.targetDate 
        ? new Date(editGoal.targetDate).toISOString().split('T')[0]
        : '';
        
      setFormData({
        name: editGoal.name,
        targetAmount: editGoal.targetAmount,
        currentAmount: editGoal.currentAmount,
        targetDate: targetDate,
        category: editGoal.category || '',
        description: editGoal.description || '',
        icon: editGoal.icon || 'piggy-bank'
      });
    }
  }, [editGoal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format data for API
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount)
      };

      let response;
      if (editGoal) {
        response = await goalService.updateGoal(editGoal._id, goalData);
      } else {
        response = await goalService.createGoal(goalData);
      }

      setLoading(false);
      
      // Reset form after successful submission if it's a new goal
      if (!editGoal) {
        setFormData({
          name: '',
          targetAmount: '',
          currentAmount: '0',
          targetDate: '',
          category: '',
          description: '',
          icon: 'piggy-bank'
        });
      }
      
      // Notify parent component of successful submission
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
      
      // Redirect to goals page
      navigate('/goals');
    } catch (err) {
      setLoading(false);
      setError(
        err.message || 'An error occurred. Please try again.'
      );
    }
  };

  const selectIcon = (icon) => {
    setFormData({ ...formData, icon });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Goal Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Emergency Fund, New Car"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-bold text-gray-700 mb-2">Target Amount ($)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="text-gray-400 h-5 w-5" />
              </div>
              <input
                type="number"
                step="0.01"
                id="targetAmount"
                name="targetAmount"
                className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                value={formData.targetAmount}
                onChange={handleChange}
                required
                min="0.01"
                placeholder="5000.00"
              />
            </div>
          </div>
          
          {editGoal && (
            <div>
              <label htmlFor="currentAmount" className="block text-sm font-bold text-gray-700 mb-2">Current Amount ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="text-gray-400 h-5 w-5" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  id="currentAmount"
                  name="currentAmount"
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="targetDate" className="block text-sm font-bold text-gray-700 mb-2">Target Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="text-gray-400 h-5 w-5" />
              </div>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-600"
                value={formData.targetDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">Category (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="text-gray-400 h-5 w-5" />
            </div>
            <input
              type="text"
              id="category"
              name="category"
              className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Savings, Travel, Home"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="text-gray-400 h-5 w-5" />
            </div>
            <textarea
              id="description"
              name="description"
              className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 min-h-[100px]"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe your financial goal..."
            ></textarea>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Choose an Icon</label>
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            {availableIcons.map((icon) => (
              <div
                key={icon}
                className={`
                  aspect-square flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200
                  ${formData.icon === icon 
                    ? 'bg-primary-50 border-2 border-primary-500 text-primary-600 shadow-md scale-105' 
                    : 'bg-gray-50 border border-gray-200 text-gray-400 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-600'
                  }
                `}
                onClick={() => selectIcon(icon)}
              >
                {iconMap[icon]}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 pt-6 border-t border-gray-100 mt-8">
          <button 
            type="submit" 
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> {editGoal ? 'Update Goal' : 'Create Goal'}</>}
          </button>
          
          <button 
            type="button" 
            className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            onClick={() => navigate('/goals')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;