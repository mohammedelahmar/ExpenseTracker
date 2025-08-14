import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  const { token } = useAuth();
  const [trends, setTrends] = useState(null);
  const [forecasts, setForecasts] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState({
    trends: false,
    forecasts: false,
    anomalies: false,
    recommendations: false
  });
  const [error, setError] = useState(null);

  const fetchTrends = useCallback(async (period = 'month', limit = 6, extraParams = {}) => {
    setLoading(prev => ({ ...prev, trends: true }));
    try {
      const params = new URLSearchParams({ period, limit, ...extraParams });
      const response = await api.get(`/analytics/trends?${params.toString()}`);
      setTrends(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching trends:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending trends');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, trends: false }));
    }
  }, []);

  const fetchForecasts = useCallback(async (months = 3) => {
    setLoading(prev => ({ ...prev, forecasts: true }));
    try {
      const response = await api.get(`/analytics/forecasts?months=${months}`);
      setForecasts(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching forecasts:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending forecasts');
    } finally {
      setLoading(prev => ({ ...prev, forecasts: false }));
    }
  }, []);

  const fetchAnomalies = useCallback(async () => {
    setLoading(prev => ({ ...prev, anomalies: true }));
    try {
      const response = await api.get(`/analytics/anomalies`);
      setAnomalies(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching anomalies:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending anomalies');
    } finally {
      setLoading(prev => ({ ...prev, anomalies: false }));
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    try {
      const response = await api.get(`/analytics/recommendations`);
      setRecommendations(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching recommendations:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending recommendations');
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  }, []);

  const fetchAllAnalytics = useCallback(async () => {
    setError(null);
    setLoading(prev => ({ ...prev, trends: true, forecasts: true, anomalies: true, recommendations: true }));
    try {
      await Promise.all([
        fetchTrends('month', 6),
        fetchForecasts(3),
        fetchAnomalies(),
        fetchRecommendations()
      ]);
    } finally {
      setLoading(prev => ({ ...prev, trends: false, forecasts: false, anomalies: false, recommendations: false }));
    }
  }, [fetchTrends, fetchForecasts, fetchAnomalies, fetchRecommendations]);

  const testAuth = useCallback(async () => {
    try {
      const res = await api.get('/users/profile');
      return `Auth OK: ${res.data?.email || 'profile loaded'}`;
    } catch (err) {
      return `Auth test failed: ${err.response?.status} ${err.response?.data?.message || err.message}`;
    }
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        trends,
        forecasts,
        anomalies,
        recommendations,
        loading,
        error,
        fetchTrends,
        fetchForecasts,
        fetchAnomalies,
        fetchRecommendations,
        fetchAllAnalytics,
        testAuth
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};