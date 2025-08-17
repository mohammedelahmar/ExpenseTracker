import saltEdgeClient from '../config/saltedge.js';
import plaidClient from '../config/plaid.js';
import BankAccount from '../models/BankAccount.js';
import Expense from '../models/Expense.js';
import moment from 'moment-timezone';

// Create a link token for connecting bank accounts
export const createLinkToken = async (userId) => {
  try {
    const configs = {
      user: {
        client_user_id: userId.toString(),
      },
      client_name: 'Expense Tracker',
      products: ['transactions'],
  country_codes: ['US'], // Sandbox/test default
      language: 'en',
    };
    
    const response = await plaidClient.linkTokenCreate(configs);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Exchange public token for access token and store bank account
export const exchangePublicToken = async (publicToken, metadata, userId) => {
  try {
    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    
    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;
    
    // Get account details
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    
    // Save accounts to database
    const accounts = [];
    for (const account of accountsResponse.data.accounts) {
      const bankAccount = await BankAccount.create({
        user: userId,
        provider: 'plaid',
        bankName: metadata?.institution?.name || 'Plaid',
        accountName: account.name || account.official_name || 'Account',
        accountType: account.type,
        accountNumber: 'xxxx',
        plaidAccessToken: accessToken,
        plaidItemId: itemId,
        plaidAccountId: account.account_id,
      });
      
      accounts.push({
        id: bankAccount._id,
        name: bankAccount.accountName,
        type: bankAccount.accountType
      });
    }
    
    // Immediately sync transactions for the new accounts
    await syncTransactions(userId, accessToken);
    
    return accounts;
  } catch (error) {
    throw error;
  }
};

// Sync transactions from Plaid
export const syncTransactions = async (userId, accessToken = null) => {
  try {
    // If no access token provided, sync all active accounts for user
    const accounts = accessToken 
      ? await BankAccount.find({ user: userId, plaidAccessToken: accessToken, isActive: true }) 
      : await BankAccount.find({ user: userId, provider: 'plaid', isActive: true });
    
    if (accounts.length === 0) return { added: 0 };
    
    let addedCount = 0;
    
    for (const account of accounts) {
      // Get transactions for the last 30 days
      const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
      const endDate = moment().format('YYYY-MM-DD');
      
      const transactionsResponse = await plaidClient.transactionsGet({
        access_token: account.plaidAccessToken,
        start_date: startDate,
        end_date: endDate,
      });
      
      // Process each transaction
      for (const transaction of transactionsResponse.data.transactions) {
        // Skip pending transactions or deposits (non-expenses)
        // Plaid amounts are positive for debits, negative for credits.
        if (transaction.pending || transaction.amount <= 0) continue;
        
        // Check if transaction already exists to avoid duplicates
        const existingExpense = await Expense.findOne({
          user: userId,
          transactionId: transaction.transaction_id,
        });
        
        if (!existingExpense) {
          // Create new expense from transaction
          await Expense.create({
            user: userId,
            date: new Date(transaction.date),
            amount: transaction.amount,
            category: determineCategory(Array.isArray(transaction.category) ? transaction.category.join(' ').toLowerCase() : (transaction.category || '')),
            description: transaction.name,
            bankAccountId: account._id,
            transactionId: transaction.transaction_id,
            importMethod: 'plaid',
            metadata: { raw: transaction },
          });
          
          addedCount++;
        }
      }
      
      // Update last sync time
      account.lastSync = new Date();
      await account.save();
    }
    
    return { added: addedCount };
  } catch (error) {
    throw error;
  }
};

// Create a connect session for connecting bank accounts
export const createConnectSession = async (userId, userEmail) => {
  try {
    // Ensure we have a Salt Edge customer and get its real ID
    const { saltEdgeCustomerId } = await createSaltEdgeCustomer(userId, userEmail);

    // Ensure HTTPS for production or use redirects for localhost
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const returnTo = `${clientUrl}/bank-connections/callback`;

    const response = await saltEdgeClient.post('/connect_sessions/create', {
      data: {
        customer_id: saltEdgeCustomerId,
        consent: {
          scopes: ["account_details", "transactions_details"]
        },
        attempt: {
          return_to: returnTo,
          fetch_scopes: ["accounts", "transactions"],
          from_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
    });
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Handle callback after successful connection
export const handleConnectionCallback = async (connectionId, userId) => {
  try {
    // Get connection details
    const connectionResponse = await saltEdgeClient.get(`/connections/${connectionId}`);
    const connection = connectionResponse.data.data;
    
    // Get accounts for this connection
    const accountsResponse = await saltEdgeClient.get('/accounts', {
      params: { connection_id: connectionId }
    });
    const accounts = accountsResponse.data.data;
    
    // Save accounts to database
    const savedAccounts = [];
    for (const account of accounts) {
      const newAccount = new BankAccount({
        user: userId,
        provider: 'saltedge',
        bankName: connection.provider_name,
        accountName: account.name,
        accountType: account.nature || 'Unknown',
        accountNumber: account.number || 'xxxx',
        currentBalance: account.balance,
        saltEdgeAccountId: account.id,
        saltEdgeConnectionId: connectionId,
      });
      
      await newAccount.save();
      savedAccounts.push(newAccount);
    }
    
    return savedAccounts;
  } catch (error) {
    throw error;
  }
};

// Fetch transactions for a specific account
export const fetchTransactions = async (accountId, userId) => {
  try {
    // Get the bank account to get Salt Edge IDs
    const account = await BankAccount.findOne({ _id: accountId, user: userId });
    
    if (!account) {
      throw new Error('Account not found or unauthorized');
    }
    
    const response = await saltEdgeClient.get('/transactions', {
      params: {
        account_id: account.saltEdgeAccountId,
        from_date: moment().subtract(30, 'days').format('YYYY-MM-DD')
      }
    });
    
    const transactions = response.data.data;
    
    // Map to our expense model and save
    const savedTransactions = [];
    for (const transaction of transactions) {
      // Skip deposits
      if (transaction.amount > 0) continue;
      
      // Upsert by user + transactionId to avoid duplicates
      const doc = await Expense.findOneAndUpdate(
        { user: userId, transactionId: transaction.id },
        {
          user: userId,
          bankAccountId: accountId,
          amount: Math.abs(transaction.amount),
          date: moment(transaction.made_on).toDate(),
          category: determineCategory(transaction.category || ''),
          description: transaction.description || 'Transaction',
          importMethod: 'saltedge',
          metadata: { raw: transaction },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      savedTransactions.push(doc);
    }
    
    return savedTransactions;
  } catch (error) {
    throw error;
  }
};

// Map Plaid categories to app categories

// Map Salt Edge categories to app categories
function determineCategory(category) {
  if (!category) return 'Other';
  
  const categoryMap = {
    'food': 'Food',
    'restaurants': 'Food',
    'travel': 'Travel',
    'transport': 'Transportation',
    'bills': 'Bills',
    'shopping': 'Shopping',
    'entertainment': 'Entertainment',
    'health': 'Health',
    'services': 'Services',
    'utilities': 'Utilities',
    'education': 'Education',
    'housing': 'Housing'
  };
  
  const lowerCategory = category.toString().toLowerCase();
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }
  
  return 'Other';
}

// Add to bankIntegrationService.js
export const createSaltEdgeCustomer = async (userId, userEmail) => {
  try {
    const identifier = `user-${userId.toString()}`;

    // Try to create the customer first
    const createResp = await saltEdgeClient.post('/customers', {
      data: {
        identifier,
        email: userEmail || `user-${userId}@example.com`
      }
    });

    return {
      saltEdgeCustomerId: createResp.data?.data?.id,
    };
  } catch (error) {
    // If customer already exists, retrieve by identifier
    if (error.response?.status === 409 || 
        error.response?.data?.error?.message?.toLowerCase?.().includes('already exists')) {
      const identifier = `user-${userId.toString()}`;
      try {
        const searchResp = await saltEdgeClient.get('/customers', {
          params: { identifier }
        });
        const existing = searchResp.data?.data?.[0];
        if (existing?.id) {
          return { saltEdgeCustomerId: existing.id };
        }
      } catch (e) {
        // fall through to throw
      }
    }
    throw error;
  }
};

export default {
  createLinkToken,
  exchangePublicToken,
  syncTransactions,
  createConnectSession,
  handleConnectionCallback,
  fetchTransactions,
  createSaltEdgeCustomer
};