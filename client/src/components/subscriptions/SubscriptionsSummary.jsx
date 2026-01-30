import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import { CalendarCheck, ArrowRight, CheckCircle, CreditCard, DollarSign } from 'lucide-react';

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
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse h-full">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 rounded-xl"></div>
          <div className="h-20 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-sky-500" size={20} />
            Subscriptions
          </h3>
        </div>
        <div className="inline-flex items-center px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-sm font-semibold border border-sky-100">
          <DollarSign size={14} className="mr-1" />
          {formatCurrency(totalMonthly)}/mo
        </div>
      </div>
      
      <div className="p-5 flex-1">
        {upcomingPayments.length > 0 ? (
          <>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              <CalendarCheck className="text-sky-500" size={16} /> Upcoming (7 days)
            </h4>
            <div className="space-y-3">
              {upcomingPayments.map(payment => (
                <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-sky-50/50 transition-colors border border-transparent hover:border-sky-100 group">
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 text-gray-700 p-2 rounded-lg text-center min-w-[60px] shadow-sm">
                      <div className="text-xs font-bold uppercase text-red-500">
                        {new Date(payment.nextBillingDate).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-lg font-black leading-none mt-0.5">
                        {new Date(payment.nextBillingDate).getDate()}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 group-hover:text-sky-700 transition-colors">{payment.name}</div>
                      <div className="text-xs font-medium text-gray-500">{payment.category}</div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-gray-900 font-medium">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">No upcoming payments this week.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          to="/subscriptions" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors group"
        >
          View All Subscriptions <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionsSummary;