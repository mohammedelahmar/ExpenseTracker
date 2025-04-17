import React, { createContext, useContext, useState } from 'react';
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

  const fetchTrends = async (period = 'month', limit = 6) => {
    setLoading(prev => ({ ...prev, trends: true }));
    try {
      const response = await api.get(
        `/analytics/trends?period=${period}&limit=${limit}`
      );
      setTrends(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching trends:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending trends');
    } finally {
      setLoading(prev => ({ ...prev, trends: false }));
    }
  };

  const fetchForecasts = async (months = 3) => {
    setLoading(prev => ({ ...prev, forecasts: true }));
    try {
      const response = await api.get(
        `/analytics/forecasts?months=${months}`
      );
      setForecasts(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching forecasts:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending forecasts');
    } finally {
      setLoading(prev => ({ ...prev, forecasts: false }));
    }
  };

  const fetchAnomalies = async () => {
    setLoading(prev => ({ ...prev, anomalies: true }));
    try {
      const response = await api.get(
        `/analytics/anomalies`
      );
      setAnomalies(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching anomalies:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending anomalies');
    } finally {
      setLoading(prev => ({ ...prev, anomalies: false }));
    }
  };

  const fetchRecommendations = async () => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    try {
      const response = await api.get(
        `/analytics/recommendations`
      );
      setRecommendations(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching recommendations:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch spending recommendations');
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  const fetchAllAnalytics = async () => {
    await Promise.all([
      fetchTrends(),
      fetchForecasts(),
      fetchAnomalies(),
      fetchRecommendations()
    ]);
  };

  const testAuth = async () => {
    try {
      console.log("Current token:", token ? token.substring(0, 15) + "..." : "No token");
      const testResponse = await api.get(`/analytics/test`);
      console.log("Test route response:", testResponse.data);
      
      // Try a protected route with explicit token
      const authResponse = await api.get(`/analytics/trends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Protected route response:", authResponse.data);
      
      return "Auth test complete - check console";
    } catch (err) {
      console.error("Auth test failed:", err.response?.status, err.response?.data);
      return `Auth test failed: ${err.response?.status} ${err.response?.data?.message || err.message}`;
    }
  };

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