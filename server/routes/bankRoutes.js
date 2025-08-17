import express from 'express';
import { 
    createLinkToken,
    exchangeToken,
    getLinkedAccounts,
    syncTransactions,
    removeLinkedAccount,
    createConnectSession,
    handleCallback,
    fetchTransactions
} from '../controllers/bankIntegrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.post('/create-link-token', createLinkToken);
router.post('/exchange-token', exchangeToken);
router.get('/accounts', getLinkedAccounts);
router.post('/sync', syncTransactions);
router.delete('/accounts/:id', removeLinkedAccount);
router.post('/create-session', createConnectSession);
router.post('/callback', handleCallback);
router.post('/fetch-transactions', fetchTransactions);

export default router;