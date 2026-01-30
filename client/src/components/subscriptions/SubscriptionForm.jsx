import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import { ArrowLeft, Save, Calendar, DollarSign, Tag, FileText, Clock, CreditCard } from 'lucide-react';
// import '../../styles/Subscription.css'; // Removed

const SubscriptionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    category: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    autoPay: false,
    reminderDays: 3,
    status: 'active'
  });
  
  // Load subscription data if editing
  useEffect(() => {
    const fetchSubscription = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await subscriptionService.getSubscriptionById(id);
          
          // Format date for the form
          const formattedDate = data.startDate ? 
            new Date(data.startDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
          
          setFormData({
            ...data,
            startDate: formattedDate
          });
          
          setLoading(false);
        } catch (err) {
          setError('Failed to load subscription details');
          setLoading(false);
        }
      }
    };
    
    fetchSubscription();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (id) {
        await subscriptionService.updateSubscription(id, formData);
      } else {
        await subscriptionService.addSubscription(formData);
      }
      
      navigate('/subscriptions');
    } catch (err) {
      setError(err.message || 'Failed to save subscription');
      setLoading(false);
    }
  };
  
  if (loading && id) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
     );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/subscriptions" className="p-2 rounded-full bg-white text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Subscription' : 'Add New Subscription'}</h1>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-violet-500"></div>
           
           {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg">
              {error}
            </div>
           )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Subscription Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Netflix, Spotify, Gym membership, etc."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-bold text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="text-gray-400 h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="9.99"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-bold text-gray-700 mb-2">Frequency</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="text-gray-400 h-5 w-5" />
                  </div>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="text-gray-400 h-5 w-5" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                     className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Software">Software</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Education">Education</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Housing">Housing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

               <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  required
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label htmlFor="startDate" className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="text-gray-400 h-5 w-5" />
                  </div>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-600"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="reminderDays" className="block text-sm font-bold text-gray-700 mb-2">Remind me days before</label>
                <input
                  type="number"
                  id="reminderDays"
                  name="reminderDays"
                  value={formData.reminderDays}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  min="1"
                  max="30"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <input
                type="checkbox"
                id="autoPay"
                name="autoPay"
                checked={formData.autoPay}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
              />
              <label htmlFor="autoPay" className="font-medium text-gray-700 cursor-pointer select-none">This is an automatic payment (Auto-pay)</label>
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
                  value={formData.description}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 min-h-[100px]"
                  placeholder="Additional details about this subscription"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-gray-100 mt-8">
              <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> {id ? 'Update Subscription' : 'Save Subscription'}</>}
              </button>
              
              <button 
                type="button" 
                className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                onClick={() => navigate('/subscriptions')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;