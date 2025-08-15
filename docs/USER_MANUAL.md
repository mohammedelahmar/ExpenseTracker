# ExpenseTracker — User & Admin Manual

Version: 1.0 • Platform: Web (React client + Express API)

This manual is designed for end users and operators. It’s formatted for GitHub viewing and ready for export to PDF.

## 1. Project Overview

ExpenseTracker helps you record spending, categorize expenses, track subscriptions, set financial goals, generate reports, analyze trends, and capture receipts with OCR.

Key modules:
- Authentication & Profile
- Expenses & Categories
- Subscriptions
- Goals
- Reports
- Analytics (trends, forecasts, anomalies, recommendations)
- Receipts OCR (PDF/images)
- Bank Connections (Salt Edge)

## 2. Quick Start

Prerequisites:
- Node.js 18+
- MongoDB (local or Atlas)

Setup:
1. Clone the repo
2. Install server and client dependencies
3. Configure environment variables
4. Start API (http://localhost:5000) and client (http://localhost:3000)

See the main README for commands and env keys.

## 3. Sign in, Profile, and Security

- Register with email/password, or use Google sign‑in when enabled
- Login persists a JWT token; protected pages require auth
- Update profile info and password from Profile page
- Forgotten password: request a reset link via email, then set a new password

Security tips:
- Log out on shared devices
- Use a strong password and enable 2FA on your email

## 4. Expense Management

### 4.1 Create an expense
1. Go to Expenses
2. Click Add Expense
3. Enter amount, date, merchant, category, notes
4. Optionally upload a receipt (PDF/JPEG/PNG)
5. Save — it appears in the list

Screenshot: screenshot/add Expense.PNG

### 4.2 Edit or delete
- In the expense list, use Edit to modify fields, or Delete to remove permanently

### 4.3 Filter, search, sort
- Filter by date range, category, amount range
- Search by merchant/notes
- Sort by date or amount

### 4.4 Attach receipts (OCR)
- Upload a receipt when creating or editing
- The server scans for malicious content, extracts text, and auto‑suggests amount/date/merchant
- Review extracted fields before saving

## 5. Categories

- Navigate to Categories
- Create, rename, or delete categories (per‑user uniqueness enforced)

Screenshot: screenshot/Categorie.PNG

## 6. Subscriptions

- Track recurring charges (e.g., streaming services)
- Add subscription with amount, billing cycle, start date, and optional reminders

Screenshot: screenshot/Subscription.PNG

## 7. Goals

- Define monthly or custom goals (e.g., cap dining at $200)
- Monitor progress and adjust as needed

Screenshot: screenshot/Fiancial Goals.PNG

## 8. Reports

- Generate summaries for periods (weekly/monthly/custom)
- Export or view detailed breakdowns

Screenshot: screenshot/Reports.PNG

## 9. Analytics

- Trends: visualize monthly totals
- Forecasts: projected spend for upcoming months
- Anomalies: detect unusual spikes
- Recommendations: personalized saving tips

Screenshot: screenshot/Analytics.PNG

## 10. Bank Connections (Salt Edge)

- Start a connect session to link your bank
- After successful linking, fetch transactions and review imported entries
- Note: availability depends on your region and Salt Edge credentials

## 11. Mobile & Responsiveness

- UI adapts to phones and tablets; navbar hides on auth/reset pages

## 12. Troubleshooting

- Can’t login: check email/password or reset password
- 401 errors: login again; token may be expired
- No charts: ensure there is data for the selected period
- OCR failed: re‑upload a clear image or PDF; verify API URL and PUBLIC_BASE_URL
- Broken images: ensure the API serves /uploads and your client points to the correct base URL

## 13. FAQ

- Where are my files stored? Receipts are stored on the server in uploads/receipts and served via /uploads
- Can I change currency? Not yet; see Roadmap
- Is my bank password stored? Bank linking uses Salt Edge; credentials are not stored by this app

## 14. Support

- Issues: create a GitHub issue or contact the maintainer
- Email: support@example.com (replace in README for distribution)

## 15. Appendix — API Cheat Sheet

Base URL: http://localhost:5000/api

Auth
- POST /users/register
- POST /users/login
- GET /users/profile (Bearer token required)

Expenses
- GET /expenses?startDate&endDate&category&categories=a,b&minAmount&maxAmount&hasReceipt&search&page&limit&sortBy=field:asc|desc
- POST /expenses
- PUT /expenses/:id
- DELETE /expenses/:id
- GET /expenses/stats
- GET /expenses/chart?period=monthly|category&startDate&endDate

Receipts
- POST /receipts (multipart/form‑data)

Analytics
- GET /analytics/trends?period=month&limit=6
- GET /analytics/forecasts?months=3
- GET /analytics/anomalies
- GET /analytics/recommendations

Categories, Reports, Goals, Subscriptions have standard CRUD endpoints under /api.
