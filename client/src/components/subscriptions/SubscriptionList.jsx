import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import SubscriptionCard from './SubscriptionCard';
import UpcomingPayments from './UpcomingPayments';
import Lottie from 'lottie-react';
import dashboardLoadingAnimation from '../../assets/dashboard-loading.json';
import Swal from 'sweetalert2';
import { Plus, CreditCard, RefreshCw } from 'lucide-react';
// import '../../styles/Subscription.css'; // Removed

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const data = await subscriptionService.fetchSubscriptions();
        setSubscriptions(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load subscriptions');
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);
  
  const handleDeleteSubscription = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await subscriptionService.deleteSubscription(id);
        setSubscriptions(subscriptions.filter(sub => sub._id !== id));
      } catch (err) {
        setError('Failed to delete subscription');
      }
    }
  };
  
  const handlePaymentRecord = async (id) => {
    try {
      const result = await subscriptionService.recordPayment(id);
      
      // Update subscription in the list with new next billing date
      setSubscriptions(subscriptions.map(sub => 
        sub._id === id ? { ...sub, nextBillingDate: result.nextBillingDate } : sub
      ));
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Payment recorded successfully!',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
    } catch (err) {
      setError('Failed to record payment');
    }
  };
  
  // Calculate total monthly subscription cost
  const monthlyTotal = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => {
      switch(sub.frequency) {
        case 'weekly':
          return total + (sub.amount * 4.33); // Average weeks in a month
        case 'monthly':
          return total + sub.amount;
        case 'quarterly':
          return total + (sub.amount / 3);
        case 'yearly':
          return total + (sub.amount / 12);
        default:
          return total;
      }
    }, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 md:p-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl shadow-xl relative overflow-hidden text-white">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Subscriptions</h1>
          <p className="text-primary-100 font-medium flex items-center justify-center md:justify-start gap-2">
            Monthly recurring cost: <strong className="text-white text-xl">${monthlyTotal.toFixed(2)}</strong>
          </p>
        </div>
        
        <Link 
          to="/subscriptions/add" 
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full font-bold text-white transition-all hover:bg-white/30 hover:scale-105 active:scale-95 shadow-lg group"
        >
          <Plus size={20} className="transition-transform group-hover:rotate-90" />
          Add Subscription
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg shadow-sm">
          {error}
        </div>
      )}
      
      <UpcomingPayments />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-48 h-48">
            <Lottie 
              animationData={dashboardLoadingAnimation}
              loop={true}
            />
          </div>
          <p className="text-gray-500 font-medium mt-4">Loading your subscriptions...</p>
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subscriptions.map(subscription => (
            <SubscriptionCard 
              key={subscription._id}
              subscription={subscription}
              onDelete={handleDeleteSubscription}
              onRecordPayment={handlePaymentRecord}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <RefreshCw size={40} className="text-primary-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Subscriptions Yet</h3>
          <p className="text-gray-500 mb-8 max-w-md">Track your recurring payments by adding your subscriptions.</p>
          <Link to="/subscriptions/add" className="btn btn-primary px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-primary-700 transition-all">
            Add Your First Subscription
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;