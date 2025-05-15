import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import SubscriptionCard from './SubscriptionCard';
import UpcomingPayments from './UpcomingPayments';
import '../../styles/Subscription.css';
import Lottie from 'lottie-react';
import dashboardLoadingAnimation from '../../assets/dashboard-loading.json';

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
        console.error(err);
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
        console.error(err);
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
      
      alert('Payment recorded successfully!');
    } catch (err) {
      setError('Failed to record payment');
      console.error(err);
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
    <div className="subscriptions-container">
      <div className="subscription-header">
        <div>
          <h1>Subscriptions</h1>
          <p>Monthly recurring cost: <strong>${monthlyTotal.toFixed(2)}</strong></p>
        </div>
        <Link to="/subscriptions/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add Subscription
        </Link>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <UpcomingPayments />
      
      {loading ? (
        <div className="loading-animation-container">
          <div className="loading-animation-wrapper">
            <Lottie 
              animationData={dashboardLoadingAnimation}
              loop={true}
              style={{ width: 180, height: 180 }}
            />
            <p className="loading-text">Loading your subscriptions...</p>
          </div>
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="subscription-list">
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
        <div className="no-subscriptions">
          <h3>No Subscriptions Yet</h3>
          <p>Track your recurring payments by adding your subscriptions.</p>
          <Link to="/subscriptions/add" className="btn btn-primary">
            Add Your First Subscription
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;