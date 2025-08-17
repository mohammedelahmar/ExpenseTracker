import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Provide a deterministic stub when Plaid credentials are not configured.
function createStubClient() {
  const stub = {
    async linkTokenCreate(configs) {
      return {
        data: {
          link_token: 'stub-link-token',
          expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      };
    },
    async itemPublicTokenExchange({ public_token }) {
      return {
        data: {
          access_token: `stub-access-${public_token || 'token'}`,
          item_id: `stub-item-${Math.random().toString(36).slice(2, 10)}`,
        },
      };
    },
    async accountsGet({ access_token }) {
      // Return a couple of fake accounts
      const fakeAccounts = [
        {
          account_id: `acc_${Math.random().toString(36).slice(2, 10)}`,
          name: 'Checking',
          type: 'depository',
          subtype: 'checking',
        },
        {
          account_id: `acc_${Math.random().toString(36).slice(2, 10)}`,
          name: 'Savings',
          type: 'depository',
          subtype: 'savings',
        },
      ];
      return { data: { accounts: fakeAccounts } };
    },
    async transactionsGet({ access_token, start_date, end_date }) {
      // Produce a few deterministic fake transactions, negative amounts are debits (expenses)
      const today = new Date();
      const iso = (d) => d.toISOString().slice(0, 10);
      const tx = [
        {
          transaction_id: `tx_${Math.random().toString(36).slice(2, 10)}`,
          date: iso(today),
          name: 'Grocery Store',
          amount: 54.32,
          pending: false,
          category: ['Food and Drink', 'Groceries'],
        },
        {
          transaction_id: `tx_${Math.random().toString(36).slice(2, 10)}`,
          date: iso(new Date(today.getTime() - 2 * 86400000)),
          name: 'Ride Share',
          amount: 12.75,
          pending: false,
          category: ['Travel', 'Taxi'],
        },
        {
          transaction_id: `tx_${Math.random().toString(36).slice(2, 10)}`,
          date: iso(new Date(today.getTime() - 5 * 86400000)),
          name: 'Payroll',
          amount: -1500.0, // deposit (negative here will be treated as income and skipped below)
          pending: false,
          category: ['Transfer', 'Payroll'],
        },
      ];
      return { data: { transactions: tx } };
    },
  };
  return stub;
}

function createPlaidClient() {
  const {
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_ENV = 'sandbox',
  } = process.env;

  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    // Fallback to stub to keep local dev/tests working without secrets.
    return createStubClient();
  }

  const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
    },
  });

  return new PlaidApi(configuration);
}

const plaidClient = createPlaidClient();
export default plaidClient;
