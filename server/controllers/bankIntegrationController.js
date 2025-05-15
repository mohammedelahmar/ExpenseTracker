import asyncHandler from "express-async-handler";
import bankIntegrationService from "../services/bankIntegrationService.js";
import BankAccount from "../models/BankAccount.js";

// @desc   Create a link token for Plaid Link
// @route  POST /api/bank/create-link-token
// @access Private
export const createLinkToken = asyncHandler(async (req, res) => {
  try {
    // Add debug logging
    console.log('User ID:', req.user?._id);
    
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    const userId = req.user._id;
    const linkToken = await bankIntegrationService.createLinkToken(userId);
    res.json(linkToken);
  } catch (error) {
    console.error('Error in createLinkToken:', error);
    res.status(500);
    throw new Error('Failed to create link token');
  }
});

// @desc   Exchange public token for access token and store account
// @route  POST /api/bank/exchange-token
// @access Private
export const exchangeToken = asyncHandler(async (req, res) => {
  try {
    const { publicToken, metadata } = req.body;
    const userId = req.user._id;
    
    const accounts = await bankIntegrationService.exchangePublicToken(
      publicToken, metadata, userId
    );
    
    res.status(201).json({
      success: true,
      message: 'Bank account connected successfully',
      accounts
    });
  } catch (error) {
    console.error('Error in exchangeToken:', error);
    res.status(500);
    throw new Error('Failed to link bank account');
  }
});

// @desc   Get all linked bank accounts
// @route  GET /api/bank/accounts
// @access Private
export const getLinkedAccounts = asyncHandler(async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.user._id });
      
    res.json(accounts);
  } catch (error) {
    console.error('Error in getLinkedAccounts:', error);
    res.status(500);
    throw new Error('Failed to fetch linked accounts');
  }
});

// @desc   Sync transactions from linked accounts
// @route  POST /api/bank/sync
// @access Private
export const syncTransactions = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await bankIntegrationService.syncTransactions(userId);
    
    res.json({
      success: true,
      message: `Successfully imported ${result.added} new transactions`,
      transactionsAdded: result.added
    });
  } catch (error) {
    console.error('Error in syncTransactions:', error);
    res.status(500);
    throw new Error('Failed to sync transactions');
  }
});

// @desc   Remove a linked bank account
// @route  DELETE /api/bank/accounts/:id
// @access Private
export const removeLinkedAccount = asyncHandler(async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    
    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }
    
    if (account.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to remove this account');
    }
    
    await BankAccount.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Bank account removed successfully' });
  } catch (error) {
    console.error('Error in removeLinkedAccount:', error);
    if (!error.statusCode) {
      res.status(500);
    }
    throw error;
  }
});

// @desc   Create a connect session for Salt Edge
// @route  POST /api/bank/create-session
// @access Private
export const createConnectSession = asyncHandler(async (req, res) => {
  try {
    console.log('Creating connect session for user:', req.user?._id);
    
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    const userId = req.user._id;
    const userEmail = req.user.email;
    
    // First check if customer exists or create one
    await bankIntegrationService.createSaltEdgeCustomer(userId, userEmail);
    
    // Then create the connect session
    const session = await bankIntegrationService.createConnectSession(userId, userEmail);
    res.json(session);
  } catch (error) {
    console.error('Error in createConnectSession:', error.message);
    if (error.response?.data?.error) {
      console.error('Salt Edge API error:', error.response.data.error);
    }
    res.status(500);
    throw new Error(`Failed to create connect session: ${error.message}`);
  }
});

// @desc   Handle callback after Salt Edge connection
// @route  POST /api/bank/callback
// @access Private
export const handleCallback = asyncHandler(async (req, res) => {
  try {
    console.log('Handling Salt Edge callback with payload:', req.body);
    
    const { connection_id } = req.body;
    
    if (!connection_id) {
      res.status(400);
      throw new Error('Missing connection_id parameter');
    }
    
    const userId = req.user._id;
    const result = await bankIntegrationService.handleConnectionCallback(connection_id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Bank connection processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in handleCallback:', error);
    res.status(500);
    throw new Error(`Failed to process bank connection: ${error.message}`);
  }
});

// @desc   Get user's connected bank accounts
// @route  GET /api/bank/accounts
// @access Private
export const getConnectedAccounts = asyncHandler(async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.user._id });
    res.json(accounts);
  } catch (error) {
    console.error('Error in getConnectedAccounts:', error);
    res.status(500);
    throw new Error('Failed to fetch accounts');
  }
});

// @desc   Fetch transactions from a connected account
// @route  POST /api/bank/fetch-transactions
// @access Private
export const fetchTransactions = asyncHandler(async (req, res) => {
  try {
    const { accountId } = req.body;
    
    if (!accountId) {
      res.status(400);
      throw new Error('Account ID is required');
    }
    
    const transactions = await bankIntegrationService.fetchTransactions(accountId, req.user._id);
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Error in fetchTransactions:', error);
    res.status(500);
    throw new Error('Failed to fetch transactions');
  }
});