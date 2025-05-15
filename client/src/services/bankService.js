import api from './api';

const bankService = {
  // Get a Salt Edge connect session
  getConnectSession: async () => {
    const response = await api.post('/api/bank/create-session');
    return response.data;
  },
  
  // Handle the callback after connecting bank account
  handleCallback: async (connectionId) => {
    const response = await api.post('/api/bank/callback', { connection_id: connectionId });
    return response.data;
  },
  
  // Get connected bank accounts
  getConnectedAccounts: async () => {
    const response = await api.get('/api/bank/accounts');
    return response.data;
  },
  
  // Fetch transactions from a connected account
  fetchTransactions: async (accountId) => {
    const response = await api.post('/api/bank/fetch-transactions', { accountId });
    return response.data;
  },
  
  // Sync transactions from all accounts
  syncTransactions: async () => {
    const response = await api.post('/api/bank/sync');
    return response.data;
  },
  
  // Remove a bank account
  removeAccount: async (accountId) => {
    const response = await api.delete(`/api/bank/accounts/${accountId}`);
    return response.data;
  }
};

export default bankService;