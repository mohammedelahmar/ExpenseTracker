import moment from 'moment';

/**
 * Utilities
 */
const PERIOD_FORMATS = {
  day: 'YYYY-MM-DD',
  week: 'GGGG-[W]WW', // ISO week-year
  month: 'YYYY-MM',
  quarter: 'YYYY-[Q]Q',
  year: 'YYYY',
};

const PERIOD_LABELS = {
  day: 'DD MMM YYYY',
  week: 'GGGG-[W]WW',
  month: 'MMM YYYY',
  quarter: '[Q]Q YYYY',
  year: 'YYYY',
};

/**
 * Normalize category representation to a string name.
 */
function getCategoryName(expense) {
  const cat = expense?.category;
  if (!cat) return 'Uncategorized';
  if (typeof cat === 'string') return cat || 'Uncategorized';
  if (typeof cat === 'object') {
    // try common props when populated via Mongoose
    return cat.name || cat.title || cat.label || 'Uncategorized';
  }
  return 'Uncategorized';
}

/**
 * Safely coerce numeric values
 */
function num(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

/**
 * Generate a continuous list of period keys and labels between start and end.
 */
function generatePeriods({ period = 'month', start, end }) {
  const fmt = PERIOD_FORMATS[period] || PERIOD_FORMATS.month;
  const labelFmt = PERIOD_LABELS[period] || PERIOD_LABELS.month;

  let cursor = start.clone().startOf(period);
  const last = end.clone().endOf(period);

  const keys = [];
  const labels = [];

  while (cursor.isSameOrBefore(last)) {
    keys.push(cursor.format(fmt));
    labels.push(cursor.format(labelFmt));
    cursor = cursor.add(1, period);
  }

  return { keys, labels };
}

/**
 * Create start/end range from limit or explicit dates.
 */
function resolveRange({ period = 'month', limit = 6, startDate, endDate }) {
  const end = endDate ? moment(endDate) : moment();
  const start = startDate
    ? moment(startDate)
    : end.clone().startOf(period).subtract(Math.max(0, limit - 1), `${period}s`).startOf(period);
  return { start, end };
}

/**
 * Sum values by period and category.
 */
function aggregateByPeriod(expenses, { period = 'month', start, end }) {
  const fmt = PERIOD_FORMATS[period] || PERIOD_FORMATS.month;
  const byPeriod = new Map();
  const categories = new Set();

  for (const e of expenses) {
    if (!e?.date) continue;
    const d = moment(e.date);
    if (!d.isValid() || d.isBefore(start) || d.isAfter(end)) continue;

    const key = d.format(fmt);
    const cat = getCategoryName(e);
    categories.add(cat);

    if (!byPeriod.has(key)) byPeriod.set(key, new Map());
    const catMap = byPeriod.get(key);
    catMap.set(cat, num(catMap.get(cat) || 0) + num(e.amount || 0));
  }

  return { byPeriod, categories: Array.from(categories) };
}

/**
 * Build series arrays aligned to period keys.
 */
function buildSeries({ byPeriod, categories, keys }) {
  const series = categories.map((cat) => ({ category: cat, data: keys.map(() => 0) }));
  const indexByCategory = Object.fromEntries(series.map((s, i) => [s.category, i]));
  const totalsPerPeriod = keys.map(() => 0);

  keys.forEach((key, idx) => {
    const catMap = byPeriod.get(key) || new Map();
    for (const [cat, amount] of catMap.entries()) {
      const i = indexByCategory[cat];
      if (i !== undefined) {
        const val = num(amount);
        series[i].data[idx] = val;
        totalsPerPeriod[idx] += val;
      }
    }
  });

  // enrich with totals/averages/trends
  for (const s of series) {
    const total = s.data.reduce((a, b) => a + num(b), 0);
    const avg = s.data.length ? total / s.data.length : 0;
    const last = s.data[s.data.length - 1] || 0;
    const prev = s.data.length > 1 ? s.data[s.data.length - 2] || 0 : 0;
    const change = last - prev;
    const pct = prev > 0 ? (change / prev) * 100 : (last > 0 ? 100 : 0);
    s.total = round2(total);
    s.avg = round2(avg);
    s.trend = { change: round2(change), pct: round2(pct) };
    s.movingAverage = movingAverage(s.data, 3);
  }

  return { series, totalsPerPeriod: totalsPerPeriod.map(round2) };
}

function movingAverage(arr, window) {
  if (!arr?.length || window <= 1) return arr?.slice() || [];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    const val = slice.reduce((a, b) => a + num(b), 0) / slice.length;
    out.push(round2(val));
  }
  return out;
}

function round2(x) {
  return Math.round(num(x) * 100) / 100;
}

/**
 * Analyze spending patterns by category over time with richer metrics.
 * @param {Array} expenses - List of expense objects
 * @param {String} period - 'day' | 'week' | 'month' | 'quarter' | 'year'
 * @param {Number} limit - Number of periods if startDate not provided
 * @param {Object} options - { startDate, endDate, includeEmpty }
 */
export const analyzeSpendingPatterns = (expenses, period = 'month', limit = 6, options = {}) => {
  const allowed = new Set(['day', 'week', 'month', 'quarter', 'year']);
  const p = allowed.has(period) ? period : 'month';
  const { startDate, endDate, includeEmpty = true, minAmount = 0, topN = 3 } = options || {};

  const { start, end } = resolveRange({ period: p, limit, startDate, endDate });
  const { keys, labels } = generatePeriods({ period: p, start, end });

  const { byPeriod, categories } = aggregateByPeriod(expenses || [], { period: p, start, end });

  // Optionally remove categories below minAmount total
  const filteredCategories = categories.filter((cat) => {
    let total = 0;
    for (const key of keys) {
      const m = byPeriod.get(key);
      if (m?.has(cat)) total += num(m.get(cat));
    }
    return total >= minAmount;
  });

  // Ensure includeEmpty periods exist
  if (includeEmpty) {
    for (const key of keys) {
      if (!byPeriod.has(key)) byPeriod.set(key, new Map());
    }
  }

  const { series, totalsPerPeriod } = buildSeries({ byPeriod, categories: filteredCategories, keys });

  // Top categories by total spending
  const topSpendingCategories = series
    .map((s) => ({ name: s.category, total: s.total, average: s.avg }))
    .sort((a, b) => b.total - a.total)
    .slice(0, Math.max(1, topN));

  const overall = {
    total: round2(totalsPerPeriod.reduce((a, b) => a + b, 0)),
    avgPerPeriod: round2(
      totalsPerPeriod.length ? totalsPerPeriod.reduce((a, b) => a + b, 0) / totalsPerPeriod.length : 0
    ),
    last: totalsPerPeriod[totalsPerPeriod.length - 1] || 0,
    prev: totalsPerPeriod.length > 1 ? totalsPerPeriod[totalsPerPeriod.length - 2] || 0 : 0,
  };
  const overallChange = overall.last - overall.prev;
  overall.trend = {
    change: round2(overallChange),
    pct: round2(overall.prev > 0 ? (overallChange / overall.prev) * 100 : overall.last > 0 ? 100 : 0),
  };

  return {
    period: p,
    periodKeys: keys,
    periodLabels: labels,
    periodData: Object.fromEntries(keys.map((k, i) => [k, series.reduce((acc, s) => ({ ...acc, [s.category]: s.data[i] }), {})])),
    totalsPerPeriod,
    series,
    topSpendingCategories,
    categories: filteredCategories,
    overall,
    metadata: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      periods: keys.length,
      generatedAt: new Date().toISOString(),
      notes: 'Includes zeros for missing periods; averages are per-period averages.',
    },
  };
};

/**
 * Forecast expenses for upcoming months based on historical data using
 * simple exponential smoothing combined with conservative growth estimates.
 * @param {Array} expenses - List of expense objects
 * @param {Number} months - Number of months to forecast
 * @param {Object} options - { alpha }
 */
export const forecastExpenses = (expenses, months = 3, options = {}) => {
  const alphaFromN = (n) => (n > 1 ? Math.min(0.8, Math.max(0.2, 2 / (n + 1))) : 0.5);
  const monthly = new Map(); // monthKey -> Map(category -> sum)
  const categories = new Set();

  for (const e of expenses || []) {
    if (!e?.date) continue;
    const key = moment(e.date).format(PERIOD_FORMATS.month);
    const cat = getCategoryName(e);
    categories.add(cat);
    if (!monthly.has(key)) monthly.set(key, new Map());
    const m = monthly.get(key);
    m.set(cat, num(m.get(cat) || 0) + num(e.amount || 0));
  }

  const monthsSorted = Array.from(monthly.keys()).sort();
  const cats = Array.from(categories);

  // Build per-category history arrays aligned to monthsSorted
  const history = Object.fromEntries(
    cats.map((c) => [c, monthsSorted.map((mk) => num(monthly.get(mk)?.get(c) || 0))])
  );

  // Compute exponential smoothing and growth rates
  const smoothing = {}; // last smoothed value per category
  const growthRates = {}; // average relative growth
  const residualStd = {}; // std dev of residuals

  for (const c of cats) {
    const y = history[c];
    if (!y.length) {
      smoothing[c] = 0;
      growthRates[c] = 0.02; // minimal growth
      residualStd[c] = 0;
      continue;
    }
    const alpha = num(options.alpha, alphaFromN(y.length));
    let s = y[0];
    const residuals = [];
    for (let t = 1; t < y.length; t++) {
      s = alpha * y[t] + (1 - alpha) * s;
      residuals.push(y[t] - s);
    }
    smoothing[c] = s;

    // growth as avg month-over-month for positive previous months
    let sumGrowth = 0;
    let count = 0;
    for (let i = 1; i < y.length; i++) {
      const prev = y[i - 1];
      const curr = y[i];
      if (prev > 0) {
        sumGrowth += (curr - prev) / prev;
        count++;
      }
    }
    const avgGrowth = count ? sumGrowth / count : 0.02;
    growthRates[c] = avgGrowth * 0.6; // dampen

    // residual std deviation
    const mu = residuals.length
      ? residuals.reduce((a, b) => a + b, 0) / residuals.length
      : 0;
    const variance = residuals.length
      ? residuals.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / residuals.length
      : 0;
    residualStd[c] = Math.sqrt(variance);
  }

  const future = [];
  for (let h = 1; h <= months; h++) {
    const d = moment().add(h, 'months').startOf('month');
    const key = d.format(PERIOD_FORMATS.month);
    const display = d.format(PERIOD_LABELS.month);

    const categoriesForecast = {};
    let total = 0;
    let totalVar = 0;

    for (const c of cats) {
      const base = smoothing[c] || 0;
      const g = growthRates[c] || 0;
      const point = base * Math.pow(1 + g, h);
      const val = Math.max(0, round2(point));
      categoriesForecast[c] = val;
      total += val;
      totalVar += Math.pow(residualStd[c] || 0, 2);
    }

    const std = Math.sqrt(totalVar);
    const ci80 = { low: Math.max(0, round2(total - 1.28 * std)), high: round2(total + 1.28 * std) };
    const ci95 = { low: Math.max(0, round2(total - 1.96 * std)), high: round2(total + 1.96 * std) };

    future.push({ month: key, displayMonth: display, categories: categoriesForecast, total: round2(total), ci80, ci95 });
  }

  return future;
};

/**
 * Robust anomaly detection using median/MAD per category and period spikes.
 * @param {Array} expenses - List of expense objects
 * @param {Object} options - { zThreshold, minCategoryCount }
 */
export const detectAnomalies = (expenses, options = {}) => {
  const zThreshold = num(options.zThreshold, 3.5); // modified z-score threshold
  const minCategoryCount = num(options.minCategoryCount, 5);

  if (!expenses || expenses.length < 5) {
    return { anomalies: [], message: 'Not enough data for anomaly detection.' };
  }

  // Group by category
  const byCat = new Map();
  for (const e of expenses) {
    const c = getCategoryName(e);
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c).push(e);
  }

  const anomalies = [];

  // Per-transaction anomalies using robust stats
  for (const [cat, list] of byCat.entries()) {
    if (list.length < minCategoryCount) continue;
    const amounts = list.map((e) => num(e.amount));
    const median = quantile(amounts, 0.5);
    const mad = medianAbsoluteDeviation(amounts, median);

    const robustZ = (x) => (mad === 0 ? standardZ(x, amounts) : (0.6745 * (x - median)) / mad);

    for (const e of list) {
      const score = robustZ(num(e.amount));
      if (Math.abs(score) >= zThreshold) {
        anomalies.push({
          type: 'transaction_outlier',
          expense: {
            id: e._id,
            description: e.description,
            amount: num(e.amount),
            date: e.date,
            category: cat,
          },
          score: round2(score),
          severity: severityFromScore(score),
          message:
            score > 0
              ? `This ${cat} expense is unusually high compared to your typical ${cat} spending.`
              : `This ${cat} expense is unusually low compared to your typical ${cat} spending.`,
        });
      }
    }
  }

  // Period spikes: compare last month to previous 6-month median per category
  const monthlyTotals = new Map(); // cat -> array of { key, total }
  const monthKey = (d) => moment(d).format(PERIOD_FORMATS.month);

  for (const e of expenses) {
    const c = getCategoryName(e);
    const key = monthKey(e.date);
    if (!monthlyTotals.has(c)) monthlyTotals.set(c, new Map());
    const m = monthlyTotals.get(c);
    m.set(key, num(m.get(key) || 0) + num(e.amount));
  }

  for (const [cat, m] of monthlyTotals.entries()) {
    const entries = Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length < 4) continue;
    const last = entries[entries.length - 1][1];
    const past = entries.slice(Math.max(0, entries.length - 7), entries.length - 1).map(([, v]) => v);
    if (past.length >= 3) {
      const med = quantile(past, 0.5);
      const mad = medianAbsoluteDeviation(past, med) || 1;
      const score = (last - med) / mad;
      if (score >= 3) {
        anomalies.push({
          type: 'period_spike',
          category: cat,
          period: entries[entries.length - 1][0],
          value: round2(last),
          median: round2(med),
          score: round2(score),
          severity: severityFromScore(score),
          message: `Spending in ${cat} spiked above recent median.`,
        });
      }
    }
  }

  const sorted = anomalies.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 10);
  return {
    anomalies: sorted,
    message: sorted.length ? 'Found unusual spending patterns.' : 'No unusual spending patterns detected.',
  };
};

function quantile(arr, q) {
  const a = (arr || []).slice().sort((x, y) => x - y);
  if (!a.length) return 0;
  const pos = (a.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (a[base + 1] !== undefined) return a[base] + rest * (a[base + 1] - a[base]);
  return a[base];
}

function medianAbsoluteDeviation(arr, median) {
  const m = median !== undefined ? median : quantile(arr, 0.5);
  const devs = (arr || []).map((x) => Math.abs(x - m));
  return quantile(devs, 0.5) * 1.4826; // scale factor for normal consistency
}

function standardZ(x, arr) {
  const mean = (arr || []).reduce((a, b) => a + b, 0) / (arr?.length || 1);
  const variance = (arr || []).reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr?.length || 1);
  const std = Math.sqrt(variance) || 1;
  return (x - mean) / std;
}

function severityFromScore(score) {
  const s = Math.abs(num(score));
  if (s >= 6) return 'high';
  if (s >= 3.5) return 'medium';
  return 'low';
}

/**
 * Generate personalized spending recommendations
 * @param {Array} expenses - List of expense objects
 */
export const generateRecommendations = (expenses) => {
  const list = expenses || [];
  if (list.length < 10) {
    return {
      tips: [
        {
          title: 'Not enough data',
          description: 'Continue adding expenses to receive personalized recommendations.',
        },
      ],
    };
  }

  const recommendations = [];

  // Group by category totals and transactions
  const categoryTotals = new Map();
  const byCategory = new Map();
  let totalSpending = 0;

  for (const e of list) {
    const cat = getCategoryName(e);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(e);
    categoryTotals.set(cat, num(categoryTotals.get(cat) || 0) + num(e.amount));
    totalSpending += num(e.amount);
  }

  const sortedCats = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);

  // 1) Highest spending category
  if (sortedCats.length) {
    const [topCat, topAmount] = sortedCats[0];
    const pct = totalSpending > 0 ? (topAmount / totalSpending) * 100 : 0;
    if (pct > 30) {
      recommendations.push({
        title: `High ${topCat} spending`,
        description: `You spend ${round2(pct)}% of your budget on ${topCat}. Consider setting a monthly limit for this category.`,
        impact: 'high',
      });
    }
  }

  // 2) Frequent small expenses per category
  for (const [cat, txs] of byCategory.entries()) {
    if (txs.length >= 10) {
      const small = txs.filter((e) => num(e.amount) < 20);
      if (small.length >= 8) {
        const sumSmall = small.reduce((s, e) => s + num(e.amount), 0);
        recommendations.push({
          title: `Frequent small ${cat} expenses`,
          description: `You have ${small.length} small ${cat} expenses totaling $${round2(sumSmall)}.`,
          tip: 'Consider bundling purchases or finding subscription alternatives.',
          impact: 'medium',
        });
      }
    }
  }

  // 3) Monthly trend analysis (last 3)
  const monthlyTotals = new Map();
  for (const e of list) {
    const key = moment(e.date).format(PERIOD_FORMATS.month);
    monthlyTotals.set(key, num(monthlyTotals.get(key) || 0) + num(e.amount));
  }
  const monthsSorted = Array.from(monthlyTotals.keys()).sort();
  if (monthsSorted.length >= 3) {
    const last3 = monthsSorted.slice(-3).map((k) => monthlyTotals.get(k));
    if (last3[2] > last3[1] && last3[1] > last3[0]) {
      const inc = last3[0] > 0 ? ((last3[2] - last3[0]) / last3[0]) * 100 : 100;
      recommendations.push({
        title: 'Increasing monthly spending',
        description: `Your spending has increased by ${round2(inc)}% over the last 3 months.`,
        tip: 'Review recent expenses for opportunities to cut back.',
        impact: 'high',
      });
    } else if (last3[2] < last3[1] && last3[1] < last3[0]) {
      const dec = last3[0] > 0 ? ((last3[0] - last3[2]) / last3[0]) * 100 : 0;
      recommendations.push({
        title: 'Decreasing monthly spending',
        description: `Your spending has decreased by ${round2(dec)}% over the last 3 months.`,
        tip: 'Keep up the good work with your budget management.',
        impact: 'positive',
      });
    }
  }

  // 4) Recurring charge detection from descriptions (~subscriptions)
  const byMerchant = new Map();
  for (const e of list) {
    const merchant = normalizeMerchant(e.description);
    if (!merchant) continue;
    if (!byMerchant.has(merchant)) byMerchant.set(merchant, []);
    byMerchant.get(merchant).push(e);
  }

  for (const [merchant, txs] of byMerchant.entries()) {
    if (txs.length < 3) continue;
    // group by month day proximity
    const byMonth = new Map();
    for (const t of txs) {
      const d = moment(t.date);
      const key = d.format('YYYY-MM');
      const day = d.date();
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key).push({ amount: num(t.amount), day });
    }
    const months = Array.from(byMonth.keys()).sort();
    if (months.length < 3) continue;

    // check if charges occur roughly monthly
    let recurring = true;
    let amounts = [];
    let days = [];
    for (const m of months) {
      const items = byMonth.get(m);
      const avgDay = Math.round(items.reduce((s, it) => s + it.day, 0) / items.length);
      const sum = items.reduce((s, it) => s + it.amount, 0);
      days.push(avgDay);
      amounts.push(sum);
    }
    const dayVar = variance(days);
    if (dayVar > 25) recurring = false; // days too spread out

    if (recurring) {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      recommendations.push({
        title: `Recurring charge detected: ${merchant}`,
        description: `Average monthly charge ~$${round2(avg)} to ${merchant}.`,
        tip: 'If this is a subscription, consider if you still need it or can switch to a cheaper plan.',
        impact: 'medium',
      });
    }
  }

  return {
    tips: recommendations.slice(0, 7),
    summary:
      recommendations.length > 0
        ? 'Here are personalized tips to help optimize your spending.'
        : 'No specific recommendations available at this time.',
  };
};

function normalizeMerchant(desc) {
  if (!desc || typeof desc !== 'string') return '';
  let s = desc.toLowerCase();
  s = s.replace(/[0-9#*\-_/]+/g, ' ');
  s = s.replace(/pos|card|payment|charge|debit|credit|purchase|online|store|shop/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s.split(' ').slice(0, 3).join(' ').trim();
}

function variance(arr) {
  if (!arr?.length) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / arr.length;
}

/**
 * Convenience: produce a one-shot analytics summary suitable for dashboards.
 */
export const summarizeAnalytics = (expenses, options = {}) => {
  const period = options.period || 'month';
  const limit = options.limit || 6;
  const analysis = analyzeSpendingPatterns(expenses, period, limit, options);
  const forecasts = forecastExpenses(expenses, options.forecastMonths || 3, options);
  const anomalies = detectAnomalies(expenses, options);
  const tips = generateRecommendations(expenses);
  return {
    analysis,
    forecasts,
    anomalies,
    recommendations: tips,
    metadata: { generatedAt: new Date().toISOString() },
  };
};
