# Delivery guide

Use this checklist to prepare a clean handoff to the client: code, instructions, and optional prebuilt assets.

## 1) Verify tests and build
- Server tests (Jest):
  - `cd server && npm ci && npm run test:ci`
- Client tests (Jest):
  - `cd client && npm ci && npm test -- --watchAll=false`
- E2E (Cypress):
  - Option A (no Mongo install): `cd server && npm run start:mem` in one terminal
  - Option B (local Mongo): `CONNECTION_URL=mongodb://localhost:27017/expense_e2e JWT_SECRET=dev npm start`
  - Then: `cd client && npm run build && npx serve -s build -l 3000`
  - Then: `npm run cypress:run`

## 2) Environment files
- Copy and fill:
  - `server/.env.example` -> `server/.env`
  - `client/.env.example` -> `client/.env`

## 3) Create archives
Produce two zip files: full source and built client.

- Source archive (excluding node_modules, uploads, build, and large docs):
  - `npm run package:source`
  - Result: `dist/expense-tracker-source.zip`

- Client build archive (static site):
  - `cd client && npm run build`
  - `npm run package:client`
  - Result: `dist/expense-tracker-client-build.zip`

## 4) Hand‑off contents
Include:
- The two zip files above
- This repository README and `docs/USER_MANUAL.md`
- A short environment guide with required variables and sample values

## 5) Post‑delivery notes
- Set `PUBLIC_BASE_URL` to the API public URL so receipt links are absolute
- For hosting, ensure `server/uploads/` persists or point uploads to an object store
- For OAuth and Salt Edge, the client must provide production credentials
