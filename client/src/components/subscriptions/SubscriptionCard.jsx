import React from 'react';
import { Link } from 'react-router-dom';

const SubscriptionCard = ({ subscription, onDelete, onRecordPayment }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days until next payment
  const daysUntil = () => {
    const today = new Date();
    const nextDate = new Date(subscription.nextBillingDate);
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const days = daysUntil();
  
  // Determine subscription card class based on due date
  const getCardClass = () => {
    if (days <= 3) return "subscription-card due-very-soon";
    if (days <= 7) return "subscription-card due-soon";
    return "subscription-card";
  };
  
  const getFrequencyText = () => {
    switch(subscription.frequency) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Annual';
      default: return subscription.frequency;
    }
  };

  return (
    <div className={getCardClass()}>
      <div className="subscription-card-header">
        <h3 className="subscription-name">{subscription.name}</h3>
        <div className="subscription-category">{subscription.category}</div>
        {subscription.autoPay && <div className="auto-pay-badge">Auto-pay</div>}
      </div>
      
      <div className="subscription-card-body">
        <div className="subscription-amount">
          {formatCurrency(subscription.amount)}
          <span className="subscription-frequency"> / {getFrequencyText()}</span>
        </div>
        
        <div className="subscription-date">
          Next payment: {formatDate(subscription.nextBillingDate)}
          {days <= 7 && (
            <span style={{ color: '#f72585', marginLeft: '5px', fontWeight: 'bold' }}>
              ({days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `${days} days`})
            </span>
          )}
        </div>
        
        <div className={`subscription-status status-${subscription.status}`}>
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </div>
        
        {subscription.description && (
          <div className="subscription-description mt-2">
            {subscription.description}
          </div>
        )}
        
        <div className="subscription-actions">
          <button 
            className="btn-subscription btn-record" 
            onClick={() => onRecordPayment(subscription._id)}
            disabled={subscription.status !== 'active'}
          >
            <i className="fas fa-check-circle"></i> Record Payment
          </button>
          
          <div>
            <Link 
              to={`/subscriptions/edit/${subscription._id}`} 
              className="btn-subscription btn-edit me-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            
            <button 
              className="btn-subscription btn-delete" 
              onClick={() => onDelete(subscription._id)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;