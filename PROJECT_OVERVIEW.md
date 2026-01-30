# Project Overview & Codebase Analysis

## 1. Project Identity
**Name:** ExpenseTracker (Monorepo)
**Type:** Full-Stack Web Application (MERN Stack variant)
**Purpose:** A comprehensive personal finance management tool allowing users to track expenses, categorize spending, monitor subscriptions, set financial goals, and digitize receipts using OCR technology.

## 2. Technology Stack

### Core
- **Language:** JavaScript (ES6+), Node.js
- **Package Manager:** npm
- **Monorepo Structure:** Separate `client` and `server` directories with root-level management scripts.

### Client (Frontend)
- **Framework:** React 19 (via Create React App)
- **Routing:** React Router DOM v6
- **State Management:** React Context API (`AuthContext`, `AnalyticsContext`)
- **Styling:** 
  - **Tailwind CSS v3** (Utility-first styling)
  - **Bootstrap 5 & React-Bootstrap** (Component library)
  - **Emotion** (CSS-in-JS styling)
- **HTTP Client:** Axios
- **Visualization:** Chart.js, React-Chartjs-2
- **Icons:** Lucide React, MUI Icons Material
- **Utilities:** Moment.js (Time), SweetAlert2 (Modals), React-Toastify (Notifications)
- **Special Features:** `react-webcam` (Camera access), `lottie-react` (Animations)

### Server (Backend)
- **Runtime:** Node.js
- **Framework:** Express v5 (ESM)
- **Database:** MongoDB (via Mongoose ORM)
- **Authentication:** JWT (JSON Web Tokens), Google Auth Library
- **Security:** Bcryptjs (Hashing), CORS
- **File Handling:** Multer (Uploads), Sharp (Image processing)
- **OCR Engine:** Tesseract.js, PDF-Parse (Receipt scanning)
- **Integrations:** Plaid (Banking), Nodemailer (Email services)
- **Validation:** Express-Validator

## 3. Architecture & Project Structure

The project follows a standard **Client-Server** architecture.

### Directory Breakdown
- **Root**: Orchestration scripts (`package.json`), Docker configuration (`docker-compose.yml`, `Dockerfile`), and documentation (`docs/`).
- **`client/`**: The React frontend application.
  - `src/pages`: Main view components (Dashboard, Expenses, Login, etc.).
  - `src/components`: Reusable UI blocks (Forms, Charts, Cards).
  - `src/services`: API service layers.
  - `src/context`: Global state management.
- **`server/`**: The Express backend API.
  - `controllers`: Business logic for each feature.
  - `models`: Mongoose database schemas.
  - `routes`: API endpoint definitions.
  - `middleware`: Auth checks, error handling, upload processing.
  - `services`: Helper logic (e.g., OCR processing).

## 4. Key Features

### 1. User Management & Auth
- **Functionality:** Sign up, login, password reset, profile management.
- **Tech:** JWT for session management, Google OAuth integration.
- **Code Reference:** `authController.js`, `User.js`, `middleware/auth.js`.

### 2. Expense Tracking
- **Functionality:** Create, Read, Update, Delete (CRUD) expenses.
- **Details:** Supports filtering, sorting, searching, and attaching receipts.
- **Code Reference:** `expenseController.js`, `Expense.js`.

### 3. Receipt Scanning (OCR)
- **Functionality:** Upload image or PDF receipts to automatically extract data (Merchant, Date, Amount).
- **Tech:** Tesseract.js (Optical Character Recognition), Multer (uploads).
- **Code Reference:** `receiptController.js`.

### 4. Analytics & Reports
- **Functionality:** Visual dashboards showing spending trends, category breakdowns, and forecasts. Generate downloadable reports.
- **UI:** Interactive charts using Chart.js.
- **Code Reference:** `analyticsController.js`, `reportController.js`.

### 5. Bank Integration
- **Functionality:** Connect bank accounts to import transactions.
- **Tech:** Plaid API / Salt Edge integration references.
- **Code Reference:** `bankIntegrationController.js`.

### 6. Subscriptions & Goals
- **Functionality:** 
  - Manage recurring subscriptions (Netflix, Spotify, etc.).
  - Set financial goals (Search for a house, Vacation fund) and track progress.
- **Code Reference:** `subscriptionController.js`, `goalController.js`.

## 5. UI/UX & Styling
- **Design System:** A hybrid approach using **Bootstrap** for grid/layout/components and **Tailwind CSS** for fine-grained utility styling.
- **Responsiveness:** Fully mobile-responsive design tailored for both desktop and mobile viewports.
- **User Feedback:** 
  - **Toast Notifications** (`react-toastify`) for success/error messages.
  - **SweetAlert2** for confirmation dialogs (e.g., "Are you sure you want to delete?").
  - **Loaders/Skeletons** for async states.
- **Interactive Elements:**
  - Dynamic Charts (Bar, Line, Doughnut).
  - Modal popups for forms (Add Expense, Edit Category).
  - Drag-and-drop file uploads.

## 6. Testing & Quality Assurance
- **Unit/Integration Testing:** Jest (Backend & Frontend).
- **E2E Testing:** Cypress for full user journey testing.
- **CI/CD:** GitHub Actions workflows configured in `.github/`.
