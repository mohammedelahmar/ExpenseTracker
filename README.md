# 💸 ExpenseTracker

Full‑stack expense tracking app to manage personal finances, categorize spending, analyze trends, and digitize receipts with OCR.

Quick links:
- Live docs: `docs/USER_MANUAL.md` (PDF‑ready)
- Client: `client/` (React 19 + React Router)
- Server: `server/` (Express 5 + MongoDB + JWT)

## Overview

ExpenseTracker helps users record expenses, organize them by categories, monitor subscriptions, set goals, generate reports, analyze trends/forecasts/anomalies, and scan receipts (PDF/images) using OCR. The UI is responsive and optimized for desktop and mobile.

### Main features
- Expense management: add, edit, delete, filter, search, sort
- Categories: CRUD with per‑user uniqueness
- Subscriptions: track recurring payments and reminders
- Goals: create savings/budget goals and monitor progress
- Reports: generate and view downloadable reports
- Analytics: trends, forecasts, anomalies, recommendations
- OCR for receipts: PDF/image uploads with parsing and text recognition
- Bank integration: Salt Edge connect session and transaction fetch
- Authentication: email/password + Google sign‑in, JWT protected API
- Responsive design: mobile‑friendly UI

## Architecture
- Client (`client/`): CRA, React 19, React Router, Contexts (`AuthContext`, `AnalyticsContext`). Axios helpers in `src/services/api.js` and `src/utils/api.js`. JWT stored in `localStorage`.
- Server (`server/`): Express 5 (ESM), MongoDB via Mongoose, JWT auth, multer uploads, OCR via pdf-parse and tesseract.js. Routes mounted in `server/app.js`.

API route mounts:
- `/api/users` (auth/profile/password/google/forgot/reset)
- `/api/expenses` (CRUD, `GET /stats`, `GET /chart`)
- `/api/categories`
- `/api/reports`
- `/api/receipts` (uploads + OCR)
- `/api/analytics`
- `/api/goals`
- `/api/subscriptions`
- `/api/bank`

## Installation and setup

Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

1) Clone
```bash
git clone https://github.com/mohammedelahmar/ExpenseTracker.git
cd ExpenseTracker
```

2) Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

3) Configure environment
- Server: copy `server/.env.example` to `server/.env` and fill values
- Client: copy `client/.env.example` to `client/.env` and fill values

Key server env vars
- `PORT` (default 5000)
- `CONNECTION_URL` Mongo URI
- `JWT_SECRET` strong secret
- `CLIENT_URL` e.g., http://localhost:3000
- `PUBLIC_BASE_URL` e.g., http://localhost:5000
- Email creds: `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `FROM_NAME`, `FROM_EMAIL`
- Google: `GOOGLE_CLIENT_ID`
- Bank: `SALT_EDGE_APP_ID`, `SALT_EDGE_SECRET`

4) Run locally
```bash
# Terminal A
cd server
npm run dev

# Terminal B
cd client
npm start
```
The client runs on http://localhost:3000 and proxies API to http://localhost:5000.

## Usage guide (highlights)

Screenshots are in `screenshot/` — the full step‑by‑step manual with images is in `docs/USER_MANUAL.md`.

- Welcome and sign in: create an account or log in (email/password or Google)
- Dashboard: view total spend, recent expenses, charts
	- ![Dashboard](screenshot/Dashboard.PNG)
- Expenses: list, filter, search, sort; add/edit/delete and attach receipts
	- ![Add Expense](screenshot/add%20Expense.PNG)
- Categories: manage custom categories
	- ![Categories](screenshot/Categorie.PNG)
- Subscriptions: track recurring charges
	- ![Subscriptions](screenshot/Subscription.PNG)
- Goals: set targets and monitor progress
	- ![Goals](screenshot/Fiancial%20Goals.PNG)
- Reports & Analytics
	- Reports: ![Reports](screenshot/Reports.PNG)
	- Analytics: ![Analytics](screenshot/Analytics.PNG)
- OCR Receipts: upload PDF/JPEG/PNG; server scans, parses, and extracts merchant/date/amount

## Testing

Server (Jest + Supertest)
```bash
cd server
npm test          # run all tests locally using in-memory MongoDB
npm run test:watch
npm run test:ci   # with coverage (used in CI)
```

Client (Jest via react-scripts)
```bash
cd client
npm test -- --watchAll=false
```

End‑to‑end (Cypress)
```bash
# In one terminal start API
cd server
# Option A: use real Mongo
CONNECTION_URL=mongodb://localhost:27017/expense_e2e JWT_SECRET=dev npm start
# Option B: use in-memory Mongo (no Mongo install needed)
npm run start:mem

# In another terminal build & serve client
cd client
npm run build
npx serve -s build -l 3000

# Then run Cypress in headless mode
npm run cypress:run
```

OCR verification
- Upload a known sample receipt and verify extracted fields on the form preview before saving.

GitHub Actions
- Workflow `.github/workflows/ci.yml`:
	- Installs and tests server with Jest on Node 18
	- Installs and tests client with Jest
	- Builds client, starts API and static server, runs Cypress E2E in headless mode
	- Uses a MongoDB service in CI; workflow fails if any test fails

## Deployment

Build
```bash
cd client && npm run build
```

Host the API
- Render, Railway, Fly.io, or a VPS. Expose port `PORT`, set env vars, and persist `uploads/` (use a volume or S3‑style storage).

Host the client
- Vercel or Netlify: deploy `client/build` and set `REACT_APP_API_URL` to your API’s public URL (or configure a proxy).

Security considerations
- Use HTTPS everywhere (client and API)
- Keep `JWT_SECRET` strong and private
- Validate and sanitize all inputs (server uses validators)
- Limit upload size; scan PDFs/images (receipts pipeline already checks size/JS/embeds)
- Configure CORS to your domains
- Store JWT in memory or localStorage with care (avoid XSS)

## Troubleshooting
- Server won’t start: check `CONNECTION_URL`, MongoDB availability, and `.env`
- 401/403 errors: ensure `Authorization: Bearer <token>` header is present; re‑login
- CORS blocked: set `CLIENT_URL` and redeploy; verify origin matches
- OCR fails: ensure PDFs/images are clear; keep `eng.traineddata` available; set `PUBLIC_BASE_URL`
- Broken images: verify `/uploads` is served and `PUBLIC_BASE_URL` points to API origin

## Roadmap
- Expand Cypress E2E coverage (more user journeys, OCR fixtures)
- Multi‑currency support and FX conversion
- Shared budgets and household accounts
- Plaid alternative connector in addition to Salt Edge

## Known limitations
- OCR accuracy depends on receipt quality; manual corrections may be needed
- Bank integration requires valid Salt Edge credentials and may be region‑limited

## Packaging for delivery
See `docs/DELIVERY.md` for step‑by‑step instructions to produce clean source and distribution archives.

## License

MIT — see `LICENSE`.

—
Maintainer: [Mohammed El Ahmar](https://github.com/mohammedelahmar)

