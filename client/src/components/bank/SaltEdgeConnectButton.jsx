import React, { useState, useCallback } from 'react';
import bankService from '../../services/bankService';

const SaltEdgeConnectButton = ({ onSuccess, onExit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnectClick = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get connect session
      const session = await bankService.getConnectSession();
      
      // Redirect to Salt Edge Connect
      if (session && session.connect_url) {
        // Store any necessary data in localStorage or state management before redirecting
        localStorage.setItem('saltedge_session_expires', session.expires_at);
        
        // Redirect to Salt Edge Connect
        window.location.href = session.connect_url;
      } else {
        throw new Error('Invalid connect session');
      }
    } catch (err) {
    setError('Failed to initiate bank connection. Please try again.');
      
      if (onExit) {
        onExit(err);
      }
    } finally {
      setLoading(false);
    }
  }, [onExit]);

  return (
    <div className="saltedge-connect-container">
      {error && <div className="alert alert-danger">{error}</div>}
      <button 
        onClick={handleConnectClick} 
        disabled={loading} 
        className="btn btn-primary"
      >
        {loading ? 'Connecting...' : 'Connect Bank Account'}
      </button>
    </div>
  );
};

export default SaltEdgeConnectButton;