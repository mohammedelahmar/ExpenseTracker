## AI coding agent guide for ExpenseTracker

This repo is a full-stack monorepo with a React client and an Express/MongoDB API. Use these notes to be productive fast and follow existing patterns.

### Architecture and data flow
- Client (CRA, React 19) in `client/` uses React Router and Contexts (`AuthContext`, `AnalyticsContext`). Axios helpers live in `src/services/api.js` and `src/utils/api.js`; JWT is stored in `localStorage`.
- Server (Node.js + Express 5, ESM) in `server/` exposes `/api/*`, uses Mongoose models, JWT auth, and per-domain controllers. `protect` middleware reads `Authorization: Bearer <jwt>`, sets `req.user`; `errorHandler` returns JSON errors.
- Flow: login/register -> token persisted -> Axios interceptor attaches Authorization -> protected routes read `req.user._id` to scope queries.

### Run and environment
- API: `cd server && npm run dev` (nodemon) or `npm start`. CORS origin is `process.env.CLIENT_URL || http://localhost:3000`.
- Client: `cd client && npm start` (CRA on 3000). `client/package.json` has `"proxy": "http://localhost:5000"` so relative `/api` works.
- Key server env: `PORT, CONNECTION_URL, JWT_SECRET, CLIENT_URL, PUBLIC_BASE_URL, EMAIL_USERNAME, EMAIL_PASSWORD, FROM_NAME, FROM_EMAIL, GOOGLE_CLIENT_ID, SALT_EDGE_APP_ID, SALT_EDGE_SECRET`.
- For absolute file URLs in responses (receipts), set `PUBLIC_BASE_URL` (e.g., `http://localhost:5000`).

### Client API patterns
- Prefer `src/services/api.js` (env-based `REACT_APP_API_URL`, `withCredentials`, 401 redirect). `src/utils/api.js` hardcodes `http://localhost:5000/api` and also injects token.
- Auth service `src/services/authService.js` persists token as `localStorage.token` and provides login/register/forgot/reset. Profile endpoint is `/api/users/profile` (align any `/me` usage).

### Server conventions
- ESM with explicit `.js` in local imports. Routes mounted in `server/app.js`:
  - `/api/users` (auth/profile/password/google/forgot/reset)
  - `/api/expenses` (CRUD + `GET /stats`, `GET /chart`)
  - `/api/categories`, `/api/reports`, `/api/receipts`, `/api/analytics`, `/api/goals`, `/api/subscriptions`, `/api/bank`
- Models link records to `user`. Example: `Category` enforces unique `{ user, name }`.

### Expenses (filters and examples)
- `GET /api/expenses` supports: `startDate`, `endDate`, `category`, `categories=a,b`, `minAmount`, `maxAmount`, `hasReceipt=true|false`, `search`, `page`, `limit`, `sortBy=field:asc|desc`.
- `GET /api/expenses/stats` totals/averages; `GET /api/expenses/chart?period=monthly|category&startDate&endDate` returns `{ labels[], data[] }`.

### Analytics endpoints
- `GET /api/analytics/trends?period=month&limit=6`
- `GET /api/analytics/forecasts?months=3`
- `GET /api/analytics/anomalies`
- `GET /api/analytics/recommendations`
Note: Controllers call `.populate('category')` but `Expense.category` is a `String`; treat `category` as a label unless the model changes.

### Receipts and uploads
- Uploads under `/api/receipts` use `multer`; files saved to `server/uploads/receipts` and served at `/uploads`.
- PDFs are security-scanned (size/JS/embeds) then parsed via `pdf-parse`; images are preprocessed (sharp) and OCR’d (tesseract.js).
- Response includes absolute `receiptUrl` and `extractedData { amount, date, merchant, items, category }`.

### Bank integration
- Salt Edge configured in `server/config/saltedge.js`; service in `server/services/bankIntegrationService.js` (`createConnectSession`, `handleConnectionCallback`, `fetchTransactions`). Prefer Salt Edge paths; Plaid-style helpers remain in places but aren’t primary.

### Front-end routing and guards
- See `client/src/App.jsx` for routes and `ProtectedRoute` using `useAuth()`. Navbar is hidden on `/`, `/login`, `/register`, `/forgot-password`, `/reset-password*`.

### Gotchas and consistency
- Keep `Authorization: Bearer <token>` and explicit `.js` imports on server.
- Choose one Axios helper per feature to avoid mixed baseURLs; prefer env-driven `services/api.js` for new work.
- Align client profile fetch to `/api/users/profile`.

Key files: `server/app.js`, `server/controllers/*`, `server/models/*`, `server/middleware/*`, `client/src/context/*`, `client/src/services/*`, `client/src/utils/api.js`, `client/src/App.jsx`.
