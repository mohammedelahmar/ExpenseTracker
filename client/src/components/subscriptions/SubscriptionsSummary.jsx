import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';

const SubscriptionsSummary = () => {
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMonthly, setTotalMonthly] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get upcoming payments in the next 7 days
        const upcoming = await subscriptionService.getUpcomingPayments(7);
        setUpcomingPayments(upcoming);
        
        // Get all subscriptions to calculate monthly cost
        const allSubs = await subscriptionService.fetchSubscriptions();
        
        // Calculate total monthly subscription cost
        const monthlyTotal = allSubs
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
          
        setTotalMonthly(monthlyTotal);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // If loading or no data, show placeholder
  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Subscriptions</h5>
          </div>
          <div className="card-body">
            <p>Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-section">
      <div className="subscription-dashboard-card">
        <div className="subscription-dashboard-header">
          <div className="subscription-header-left">
            <h3 className="subscription-dashboard-title">Subscriptions</h3>
            <div className="subscription-total-badge">
              <span className="subscription-icon">💸</span>
              Monthly Total: {formatCurrency(totalMonthly)}
            </div>
          </div>
          <Link to="/subscriptions" className="subscription-view-all">
            View All <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        
        <div className="subscription-dashboard-content">
          {loading ? (
            <div className="subscription-loading">
              <div className="subscription-loading-pulse"></div>
              <p>Loading subscription data...</p>
            </div>
          ) : upcomingPayments.length > 0 ? (
            <>
              <h4 className="upcoming-title">
                <i className="fas fa-calendar-check"></i> Upcoming in 7 days
              </h4>
              <div className="upcoming-subscriptions">
                {upcomingPayments.map(payment => (
                  <div key={payment._id} className="upcoming-subscription-item">
                    <div className="upcoming-subscription-info">
                      <div className="upcoming-date-badge">
                        {new Date(payment.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="upcoming-subscription-name">
                        {payment.name}
                        <span className="upcoming-subscription-category">{payment.category}</span>
                      </div>
                    </div>
                    <div className="upcoming-subscription-amount">{formatCurrency(payment.amount)}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-subscriptions-message">
              <i className="fas fa-check-circle"></i>
              <p>No upcoming subscription payments in the next 7 days.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsSummary;