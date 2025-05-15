import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bankService from '../../services/bankService';

const ConnectCallback = () => {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse connection_id from URL query params
        const params = new URLSearchParams(location.search);
        const connectionId = params.get('connection_id');
        
        if (!connectionId) {
          throw new Error('No connection ID provided');
        }
        
        // Process the connection
        const result = await bankService.handleCallback(connectionId);
        
        setStatus('success');
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate('/bank-connections', { 
            state: { 
              connectionResult: {
                success: true,
                message: 'Bank account connected successfully!'
              } 
            } 
          });
        }, 1500);
        
      } catch (error) {
        console.error('Error processing callback:', error);
        setStatus('error');
        
        // Redirect after showing error
        setTimeout(() => {
          navigate('/bank-connections', { 
            state: { 
              connectionResult: {
                success: false,
                message: 'Failed to connect bank account.'
              } 
            }
          });
        }, 1500);
      }
    };
    
    processCallback();
  }, [location, navigate]);
  
  return (
    <div className="callback-container">
      {status === 'processing' && (
        <div className="callback-status processing">
          <div className="loading-animation"></div>
          <h2>Processing your bank connection...</h2>
          <p>Please wait while we securely connect your account.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="callback-status success">
          <div className="success-icon">✓</div>
          <h2>Connection Successful!</h2>
          <p>Your bank account was connected successfully.</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="callback-status error">
          <div className="error-icon">!</div>
          <h2>Connection Failed</h2>
          <p>We couldn't connect your bank account. Please try again.</p>
        </div>
      )}
    </div>
  );
};

export default ConnectCallback;