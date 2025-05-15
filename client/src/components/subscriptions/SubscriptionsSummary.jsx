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
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Subscriptions</h5>
          <Link to="/subscriptions" className="btn btn-sm btn-primary">View All</Link>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col">
              <div className="subscription-summary-card">
                <h6>Monthly Recurring</h6>
                <h3>{formatCurrency(totalMonthly)}</h3>
              </div>
            </div>
          </div>
          
          {upcomingPayments.length > 0 ? (
            <div>
              <h6 className="text-muted mb-3">Upcoming in 7 days</h6>
              <ul className="list-group">
                {upcomingPayments.map(payment => (
                  <li key={payment._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-primary me-2">
                        {new Date(payment.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {payment.name}
                    </div>
                    <span>{formatCurrency(payment.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No upcoming subscription payments in the next 7 days.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsSummary;