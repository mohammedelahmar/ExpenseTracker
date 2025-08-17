import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SaltEdgeConnectButton from '../components/bank/SaltEdgeConnectButton';
import PlaidLinkButton from '../components/bank/PlaidLinkButton';
import LinkedAccountsList from '../components/bank/LinkedAccountsList';
import '../styles/BankConnections.css';

const BankConnections = () => {
  const [refreshList, setRefreshList] = useState(0);
  const location = useLocation();
  const [connectionResult, setConnectionResult] = useState(
    location.state?.connectionResult || null
  );

  const handleConnectionExit = (err) => {
    if (err) {
      setConnectionResult({
        success: false,
        message: 'Connection process was cancelled or encountered an error.'
      });
    }
  };

  return (
    <div className="bank-connections-page">
      <div className="page-header">
        <h1>Bank Connections</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <SaltEdgeConnectButton onExit={handleConnectionExit} />
          <PlaidLinkButton onLinked={() => setRefreshList(v => v + 1)} onExit={handleConnectionExit} />
        </div>
      </div>

      {connectionResult && (
        <div className={`alert ${connectionResult.success ? 'alert-success' : 'alert-danger'}`}>
          {connectionResult.message}
        </div>
      )}

      <div className="card connection-section">
        <div className="card-body">
          <h2>Connect Your Bank</h2>
          <p>Securely connect your bank accounts to automatically import your transactions.</p>
          <p>We use Salt Edge to ensure your banking credentials are never stored on our servers.</p>
        </div>
      </div>

      <div className="card accounts-section">
        <div className="card-body">
          <div className="accounts-header">
            <h2>Connected Accounts</h2>
            <button 
              className="btn btn-outline-primary"
              onClick={() => setRefreshList(prev => prev + 1)}
            >
              Refresh
            </button>
          </div>
          <LinkedAccountsList refreshTrigger={refreshList} />
        </div>
      </div>

      <div className="card info-section">
        <div className="card-body">
          <h2>About Bank Connections</h2>
          <p>
            Connecting your bank accounts allows you to automatically import transactions, 
            keep your expenses up to date, and get better insights into your spending habits.
          </p>
          <p>
            <strong>Your security is our priority:</strong> All connections are encrypted and 
            secure. We use Salt Edge, a trusted financial data provider with bank-level security.
          </p>
          <Link to="/privacy-policy" className="btn btn-link">View Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default BankConnections;