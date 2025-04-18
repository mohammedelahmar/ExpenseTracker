import moment from 'moment';

/**
 * Analyze spending patterns by category over time
 * @param {Array} expenses - List of expense objects
 * @param {String} period - Time period for analysis ('month', 'week', 'year')
 * @param {Number} limit - Number of periods to include
 */
export const analyzeSpendingPatterns = (expenses, period, limit) => {
  // Group expenses by time period and category
  const groupedExpenses = {};
  const now = moment();
  const periodFormats = {
    'week': 'YYYY-[W]WW',
    'month': 'YYYY-MM',
    'year': 'YYYY'
  };
  
  // Calculate start date based on period and limit
  const startDate = moment().subtract(limit, `${period}s`);
  
  // Filter expenses by date range
  const filteredExpenses = expenses.filter(expense => 
    moment(expense.date).isAfter(startDate)
  );
  
  // Group expenses by period and category
  filteredExpenses.forEach(expense => {
    const periodKey = moment(expense.date).format(periodFormats[period]);
    // Use category directly as it's a string
    const categoryName = expense.category || 'Uncategorized';
    
    if (!groupedExpenses[periodKey]) {
      groupedExpenses[periodKey] = {};
    }
    
    if (!groupedExpenses[periodKey][categoryName]) {
      groupedExpenses[periodKey][categoryName] = 0;
    }
    
    groupedExpenses[periodKey][categoryName] += expense.amount;
  });
  
  // Calculate average spending per category
  const categories = [...new Set(filteredExpenses.map(e => e.category || 'Uncategorized'))];
  const categoryAverages = {};
  
  categories.forEach(category => {
    const categoryExpenses = filteredExpenses.filter(e => 
      (e.category || 'Uncategorized') === category
    );
    
    if (categoryExpenses.length > 0) {
      categoryAverages[category] = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
    }
  });
  
  // Find top spending categories
  const topCategories = Object.entries(categoryAverages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, avg]) => ({ name, average: avg }));
  
  return {
    periodData: groupedExpenses,
    topSpendingCategories: topCategories,
    categories
  };
};

/**
 * Forecast expenses for upcoming months based on historical data
 * @param {Array} expenses - List of expense objects
 * @param {Number} months - Number of months to forecast
 */
export const forecastExpenses = (expenses, months) => {
  // Get unique categories
  const categories = [...new Set(expenses.map(e => e.category || 'Uncategorized'))];
  
  // Group expenses by month and category
  const monthlyData = {};
  
  expenses.forEach(expense => {
    const monthKey = moment(expense.date).format('YYYY-MM');
    const categoryName = expense.category ? expense.category.name : 'Uncategorized';
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {};
    }
    
    if (!monthlyData[monthKey][categoryName]) {
      monthlyData[monthKey][categoryName] = 0;
    }
    
    monthlyData[monthKey][categoryName] += expense.amount;
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // Calculate monthly growth rate per category
  const growthRates = {};
  categories.forEach(category => {
    let sumGrowth = 0;
    let countMonths = 0;
    
    for (let i = 1; i < sortedMonths.length; i++) {
      const prevMonth = sortedMonths[i-1];
      const currMonth = sortedMonths[i];
      
      const prevAmount = monthlyData[prevMonth][category] || 0;
      const currAmount = monthlyData[currMonth][category] || 0;
      
      if (prevAmount > 0) {
        const growthRate = (currAmount - prevAmount) / prevAmount;
        sumGrowth += growthRate;
        countMonths++;
      }
    }
    
    // Average growth rate with a dampening factor for conservative estimates
    growthRates[category] = countMonths > 0 ? (sumGrowth / countMonths) * 0.8 : 0.02;
  });
  
  // Calculate last month's spending by category
  const latestMonth = sortedMonths[sortedMonths.length - 1];
  const lastMonthSpending = monthlyData[latestMonth] || {};
  
  // Generate forecasts for upcoming months
  const forecasts = [];
  
  for (let i = 1; i <= months; i++) {
    const forecastDate = moment().add(i, 'months');
    const forecastMonth = forecastDate.format('YYYY-MM');
    
    const monthForecast = {
      month: forecastMonth,
      displayMonth: forecastDate.format('MMM YYYY'),
      categories: {}
    };
    
    let totalForecast = 0;
    
    categories.forEach(category => {
      const lastAmount = lastMonthSpending[category] || 0;
      const growthRate = growthRates[category];
      const forecast = lastAmount * Math.pow(1 + growthRate, i);
      
      monthForecast.categories[category] = Math.round(forecast * 100) / 100;
      totalForecast += monthForecast.categories[category];
    });
    
    monthForecast.total = Math.round(totalForecast * 100) / 100;
    forecasts.push(monthForecast);
  }
  
  return forecasts;
};

/**
 * Detect anomalies in user's spending patterns
 * @param {Array} expenses - List of expense objects
 */
export const detectAnomalies = (expenses) => {
  if (expenses.length < 5) {
    return { anomalies: [], message: "Not enough data for anomaly detection." };
  }
  
  // Group expenses by category
  const expensesByCategory = {};
  
  expenses.forEach(expense => {
    const categoryName = expense.category || 'Uncategorized';
    
    if (!expensesByCategory[categoryName]) {
      expensesByCategory[categoryName] = [];
    }
    
    expensesByCategory[categoryName].push(expense);
  });
  
  const anomalies = [];
  
  // Process each category with enough data
  Object.entries(expensesByCategory).forEach(([category, categoryExpenses]) => {
    if (categoryExpenses.length < 5) return;
    
    // Calculate mean and standard deviation for this category
    const amounts = categoryExpenses.map(e => e.amount);
    const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Detect anomalies (expenses more than 2 standard deviations from the mean)
    const threshold = Math.max(2 * stdDev, mean * 0.5);
    
    categoryExpenses.forEach(expense => {
      if (Math.abs(expense.amount - mean) > threshold) {
        anomalies.push({
          expense: {
            id: expense._id,
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
            category: category
          },
          difference: expense.amount - mean,
          percentageDifference: (expense.amount - mean) / mean * 100,
          message: expense.amount > mean 
            ? `This ${category} expense is ${Math.round((expense.amount/mean - 1) * 100)}% higher than your average`
            : `This ${category} expense is ${Math.round((1 - expense.amount/mean) * 100)}% lower than your average`
        });
      }
    });
  });
  
  return {
    anomalies: anomalies.sort((a, b) => Math.abs(b.percentageDifference) - Math.abs(a.percentageDifference)).slice(0, 5),
    message: anomalies.length > 0 ? "Found unusual spending patterns." : "No unusual spending patterns detected."
  };
};

/**
 * Generate personalized spending recommendations
 * @param {Array} expenses - List of expense objects
 */
export const generateRecommendations = (expenses) => {
  if (expenses.length < 10) {
    return {
      tips: [{
        title: "Not enough data",
        description: "Continue adding expenses to receive personalized recommendations."
      }]
    };
  }
  
  const recommendations = [];
  
  // Group expenses by category and calculate total per category
  const categoryTotals = {};
  const expensesByCategory = {};
  let totalSpending = 0;
  
  expenses.forEach(expense => {
    const categoryName = expense.category || 'Uncategorized';
    
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = 0;
      expensesByCategory[categoryName] = [];
    }
    
    categoryTotals[categoryName] += expense.amount;
    expensesByCategory[categoryName].push(expense);
    totalSpending += expense.amount;
  });
  
  // Find top spending categories
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);
  
  // Generate recommendations based on spending patterns
  
  // 1. Highest spending category
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentage = (topAmount / totalSpending * 100).toFixed(1);
    
    if (percentage > 30) {
      recommendations.push({
        title: `High ${topCategory} Spending`,
        description: `You spend ${percentage}% of your budget on ${topCategory}. Consider setting a monthly limit for this category.`,
        impact: "high"
      });
    }
  }
  
  // 2. Frequency-based recommendations
  sortedCategories.forEach(([category, total]) => {
    const categoryExpenses = expensesByCategory[category];
    
    // Look for frequent small expenses
    if (categoryExpenses.length >= 10) {
      const smallExpenses = categoryExpenses.filter(e => e.amount < 20);
      
      if (smallExpenses.length >= 8) {
        recommendations.push({
          title: `Frequent Small ${category} Expenses`,
          description: `You have ${smallExpenses.length} small ${category} expenses. These add up to $${smallExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}.`,
          tip: "Consider bundling purchases or finding subscription alternatives.",
          impact: "medium"
        });
      }
    }
  });
  
  // 3. Monthly trend analysis
  const monthlyTotals = {};
  expenses.forEach(expense => {
    const monthKey = moment(expense.date).format('YYYY-MM');
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = 0;
    }
    
    monthlyTotals[monthKey] += expense.amount;
  });
  
  const sortedMonths = Object.keys(monthlyTotals).sort();
  
  if (sortedMonths.length >= 3) {
    const last3Months = sortedMonths.slice(-3);
    const trend = last3Months.map(month => monthlyTotals[month]);
    
    if (trend[2] > trend[1] && trend[1] > trend[0]) {
      const increasePercent = ((trend[2] - trend[0]) / trend[0] * 100).toFixed(1);
      
      recommendations.push({
        title: "Increasing Monthly Spending",
        description: `Your spending has increased by ${increasePercent}% over the last 3 months.`,
        tip: "Review recent expenses for opportunities to cut back.",
        impact: "high"
      });
    } else if (trend[2] < trend[1] && trend[1] < trend[0]) {
      const decreasePercent = ((trend[0] - trend[2]) / trend[0] * 100).toFixed(1);
      
      recommendations.push({
        title: "Decreasing Monthly Spending",
        description: `Great job! Your spending has decreased by ${decreasePercent}% over the last 3 months.`,
        tip: "Keep up the good work with your budget management.",
        impact: "positive"
      });
    }
  }
  
  // Limit number of recommendations
  return {
    tips: recommendations.slice(0, 5),
    summary: recommendations.length > 0 
      ? "Here are personalized tips to help optimize your spending." 
      : "No specific recommendations available at this time."
  };
};