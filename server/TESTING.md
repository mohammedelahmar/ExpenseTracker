Server tests (Jest + Supertest)

Prereqs:
- Node 18+

Install deps:
- npm install

Run tests locally (uses in-memory MongoDB):
- npm test

Watch mode:
- npm run test:watch

CI mode with coverage:
- npm run test:ci

Notes:
- Tests set CONNECTION_URL dynamically to an in-memory MongoDB; your local Mongo is not required.
- Receipt OCR heavy processing is stubbed out in NODE_ENV=test for fast tests.
