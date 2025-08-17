import React, { useState, useEffect } from 'react';
import bankService from '../../services/bankService';

const LinkedAccountsList = ({ refresh, refreshTrigger }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await bankService.getConnectedAccounts();
        setAccounts(data);
      } catch (err) {
        setError('Failed to fetch linked accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [refresh, refreshTrigger]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const result = await bankService.syncTransactions();
      setSyncResult({
        success: true,
        message: result.message
      });
    } catch (err) {
      setSyncResult({
        success: false,
        message: err.message || 'Failed to sync transactions'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRemove = async (accountId) => {
    if (window.confirm('Are you sure you want to disconnect this account?')) {
      try {
        await bankService.removeAccount(accountId);
        setAccounts(accounts.filter(account => account._id !== accountId));
      } catch (err) {
        setError('Failed to remove account');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading linked accounts...</div>;
  }

  return (
    <div className="linked-accounts-container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {syncResult && (
        <div className={`alert ${syncResult.success ? 'alert-success' : 'alert-danger'}`}>
          {syncResult.message}
        </div>
      )}
      
      <div className="accounts-header">
        <h3>Linked Bank Accounts</h3>
        <button 
          onClick={handleSync} 
          disabled={syncing || accounts.length === 0} 
          className="btn btn-secondary"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
      
      {accounts.length === 0 ? (
        <p>No bank accounts linked yet. Connect an account to get started.</p>
      ) : (
        <div className="accounts-list">
      {accounts.map(account => (
            <div key={account._id} className="account-card">
              <div className="account-info">
        <h4>{account.institutionName || account.bankName || 'Bank'}</h4>
                <p>{account.accountName} • {account.accountType}</p>
                <small>Last synced: {new Date(account.lastSync).toLocaleString()}</small>
              </div>
              <button 
                onClick={() => handleRemove(account._id)} 
                className="btn btn-danger btn-sm"
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedAccountsList;