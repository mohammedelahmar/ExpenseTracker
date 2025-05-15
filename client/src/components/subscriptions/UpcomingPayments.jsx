import React, { useState, useEffect } from 'react';
import subscriptionService from '../../services/subscriptionService';

const UpcomingPayments = () => {
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUpcomingPayments = async () => {
      try {
        const data = await subscriptionService.getUpcomingPayments(15); // Get payments due in next 15 days
        setUpcomingPayments(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load upcoming payments:', err);
        setLoading(false);
      }
    };

    fetchUpcomingPayments();
  }, []);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days remaining
  const daysUntil = (dateString) => {
    const today = new Date();
    const nextDate = new Date(dateString);
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // If no upcoming payments, don't render the component
  if (!loading && upcomingPayments.length === 0) {
    return null;
  }
  
  // Calculate total upcoming payments
  const totalUpcoming = upcomingPayments.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="upcoming-payments">
      <h3>Upcoming in the Next 15 Days - {formatCurrency(totalUpcoming)}</h3>
      
      {loading ? (
        <p>Loading upcoming payments...</p>
      ) : (
        <div className="upcoming-list">
          {upcomingPayments.map(payment => {
            const days = daysUntil(payment.nextBillingDate);
            let badgeClass = 'badge ';
            
            if (days <= 2) {
              badgeClass += 'bg-danger';
            } else if (days <= 5) {
              badgeClass += 'bg-warning text-dark';
            } else {
              badgeClass += 'bg-info text-dark';
            }
            
            return (
              <div key={payment._id} className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{borderBottom: '1px solid #eee'}}>
                <div>
                  <span className={badgeClass}>{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}</span>
                  <span className="ms-2">{formatDate(payment.nextBillingDate)}</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-3">{payment.name}</span>
                  <strong>{formatCurrency(payment.amount)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingPayments;