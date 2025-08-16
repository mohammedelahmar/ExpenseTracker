## AI coding agent guide for ExpenseTracker

Concise pointers to be productive fast in this React + Express/Mongo monorepo. Follow these repo-specific patterns and workflows.

### Architecture and flow
- Client (`client/`): CRA, React 19, React Router. Contexts: `AuthContext`, `AnalyticsContext`. Axios helper at `src/services/api.js` (uses `REACT_APP_API_URL || '/api'`, adds `Authorization: Bearer <token>` from `localStorage`).
- Server (`server/`): Express 5 (ESM) + Mongoose. Import local files with explicit `.js`. Auth via JWT; `protect` sets `req.user`. Central error JSON via `errorHandler`.
- Data flow: login/register → token persisted → Axios interceptor injects header → controllers scope queries with `req.user._id`.

### Run and env
- API: `cd server && npm run dev` (nodemon) or `npm start`. CORS `origin = CLIENT_URL || http://localhost:3000`. Health at `GET /api/health` (reports Mongo state).
- Client: `cd client && npm start` (proxy to `http://localhost:5000`). For prod builds, `npm run build` (build swap script writes to `client/build`).
- Important server env: `PORT, CONNECTION_URL, JWT_SECRET, CLIENT_URL, PUBLIC_BASE_URL, EMAIL_USERNAME, EMAIL_PASSWORD, FROM_NAME, FROM_EMAIL, GOOGLE_CLIENT_ID, SALT_EDGE_APP_ID, SALT_EDGE_SECRET`. `PUBLIC_BASE_URL` is used to build absolute receipt URLs.

### API surface and patterns
- Routes mounted in `server/app.js`:
  - `/api/users` (register, login, profile get/update, password update, Google, forgot/reset)
  - `/api/expenses` (CRUD, `GET /stats`, `GET /chart`)
  - `/api/categories`, `/api/reports`, `/api/receipts`, `/api/analytics`, `/api/goals`, `/api/subscriptions`, `/api/bank`
- Expenses filters: `GET /api/expenses` supports `startDate,endDate,category,categories=a,b,minAmount,maxAmount,hasReceipt=true|false,search,page,limit,sortBy=field:asc|desc`. Charts: `GET /api/expenses/chart?period=monthly|category&startDate&endDate` → `{ labels[], data[] }`.
- Analytics: `GET /api/analytics/{trends|forecasts|anomalies|recommendations}`. Note: controllers call `.populate('category')` but `Expense.category` is a `String`; treat `category` as a label unless the model changes.
- Receipts: `POST /api/receipts` via multer → stored under `server/uploads/receipts` and served at `/uploads`. PDFs scanned (size/JS/embeds) + `pdf-parse`; images preprocessed (sharp) + OCR (`tesseract.js`). Response includes `receiptUrl` and `extractedData`.

### Client conventions
- Use `src/services/api.js` only (deprecated `src/utils/api.js` is a stub pointing here). Auth service stores token in `localStorage` and configures Axios.
- Profile endpoint is `/api/users/profile` (not `/users/me`). When touching `authService.getCurrentUser`, ensure it calls `/users/profile`.
- Routing guards in `client/src/App.jsx` use `useAuth()`; Navbar hidden on `/`, `/login`, `/register`, `/forgot-password`, `/reset-password*`.

### Testing and packaging
- Server tests: `cd server && npm test` (Jest + Supertest, in-memory Mongo; heavy OCR is stubbed in `NODE_ENV=test`). Watch: `npm run test:watch`. CI: `npm run test:ci`.
- Client tests: `cd client && npm test -- --watchAll=false`.
- E2E (Cypress): start API (`npm start` or `npm run start:mem`), serve client build, then `npm run cypress:run`.
- Delivery zips: root has `package:all` to produce source/client build archives in `dist/`.

### Gotchas
- Always include `Authorization: Bearer <token>` on protected calls; server imports require `.js` suffix.
- Choose one Axios helper per feature (use `services/api.js`) to avoid mixed base URLs.
- For absolute receipt URLs, set `PUBLIC_BASE_URL` to API origin (e.g., `http://localhost:5000`).

Key references: `server/app.js`, `server/controllers/*`, `server/models/*`, `server/middleware/*`, `client/src/context/*`, `client/src/services/*`, `client/src/App.jsx`.
