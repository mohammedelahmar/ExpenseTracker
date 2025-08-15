import saltEdgeClient from '../config/saltedge.js';
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
      country_codes: ['US'], // Only use US for sandbox testing
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
        institutionId: metadata.institution.id,
        institutionName: metadata.institution.name,
        accountId: account.account_id,
        accountName: account.name,
        accountType: account.type,
        accessToken: accessToken,
        itemId: itemId
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
      ? await BankAccount.find({ user: userId, accessToken, isActive: true }) 
      : await BankAccount.find({ user: userId, isActive: true });
    
    if (accounts.length === 0) return { added: 0 };
    
    let addedCount = 0;
    
    for (const account of accounts) {
      // Get transactions for the last 30 days
      const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
      const endDate = moment().format('YYYY-MM-DD');
      
      const transactionsResponse = await plaidClient.transactionsGet({
        access_token: account.accessToken,
        start_date: startDate,
        end_date: endDate,
      });
      
      // Process each transaction
      for (const transaction of transactionsResponse.data.transactions) {
        // Skip pending transactions or deposits (positive amounts)
        if (transaction.pending || transaction.amount <= 0) continue;
        
        // Check if transaction already exists to avoid duplicates
        const existingExpense = await Expense.findOne({
          user: userId,
          'metadata.transactionId': transaction.transaction_id
        });
        
        if (!existingExpense) {
          // Create new expense from transaction
          await Expense.create({
            user: userId,
            date: new Date(transaction.date),
            amount: transaction.amount,
            category: determineCategory(transaction.category),
            description: transaction.name,
            metadata: {
              transactionId: transaction.transaction_id,
              accountId: account._id,
              importMethod: 'plaid'
            }
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
    
    // Get or create Salt Edge customer to get the numeric ID
    const customer = await createSaltEdgeCustomer(userId, userEmail);
    
    // Ensure HTTPS for production or use redirects for localhost
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const returnTo = `${clientUrl}/bank-connections/callback`;
    
    
    
    const response = await saltEdgeClient.post('/connect_sessions/create', {
      data: {
        customer_id: customer.numericId, // Use the numeric ID here
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
      
      const expense = new Expense({
        user: userId,
        title: transaction.description,
        amount: Math.abs(transaction.amount),
        date: moment(transaction.made_on).toDate(),
        category: determineCategory(transaction.category),
        description: transaction.description,
        bankAccountId: accountId,
        transactionId: transaction.id
      });
      
      await expense.save();
      savedTransactions.push(expense);
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
  
  const lowerCategory = category.toLowerCase();
  
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
    
    // Generate a numeric identifier from the ObjectId
    // Simple approach: use last 8 digits of ObjectId converted to integer
    const numericId = parseInt(userId.toString().slice(-8), 16);
    
    // Salt Edge requires email for customers
    const response = await saltEdgeClient.post('/customers', {
      data: {
        identifier: `user-${userId.toString()}`, // Use string identifier for reference
        email: userEmail || `user-${userId}@example.com` // Fallback if email is not available
      }
    });
    
    
    
    // Store the mapping between your user and the Salt Edge customer ID
    // This could be saved in your User model or a separate mapping table
    return {
      saltEdgeCustomerId: response.data.data.id,
      numericId
    };
  } catch (error) {
    // If customer already exists, we need to retrieve the actual Salt Edge customer ID
    if (error.response?.status === 409 || 
        error.response?.data?.error?.message?.includes('already exists')) {
      
      // Generate the same numeric ID for consistency
      const numericId = parseInt(userId.toString().slice(-8), 16);
      return { saltEdgeCustomerId: numericId, numericId };
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