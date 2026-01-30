import React, { useState, useEffect } from 'react';
import subscriptionService from '../../services/subscriptionService';
import { Calendar, AlertTriangle, AlertCircle, Info } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
          <Calendar size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          Upcoming (15 Days) <span className="text-gray-400 font-normal">|</span> <span className="text-violet-600">{formatCurrency(totalUpcoming)}</span>
        </h3>
      </div>
      
      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading upcoming payments...</p>
      ) : (
        <div className="space-y-3">
          {upcomingPayments.map(payment => {
            const days = daysUntil(payment.nextBillingDate);
            let badgeClass = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 w-fit ';
            let daysText = '';
            let Icon = Info;
            
            if (days <= 2) {
              badgeClass += 'bg-rose-100 text-rose-700 border border-rose-200';
              daysText = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`;
              Icon = AlertCircle;
            } else if (days <= 5) {
              badgeClass += 'bg-amber-100 text-amber-700 border border-amber-200';
              daysText = `${days} days`;
              Icon = AlertTriangle;
            } else {
              badgeClass += 'bg-sky-100 text-sky-700 border border-sky-200';
              daysText = `${days} days`;
              Icon = Info;
            }
            
            return (
              <div key={payment._id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                <div className="flex items-center gap-3">
                   <div className={badgeClass}>
                     <Icon size={12} />
                     {daysText}
                   </div>
                   <span className="text-sm font-medium text-gray-500 hidden sm:inline">{formatDate(payment.nextBillingDate)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700">{payment.name}</span>
                  <span className="font-bold text-gray-900 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm min-w-[80px] text-right">
                    {formatCurrency(payment.amount)}
                  </span>
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