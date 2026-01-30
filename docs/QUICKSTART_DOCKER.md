# Quickstart (Docker Compose)

Run MongoDB, API (Express), and Client (React) in containers with auto-reload, plus a demo seed.

## Prerequisites
- Docker Desktop 4+

## Start

From repository root:

```
docker compose up --build
```

- Client: http://localhost:3000
- API: http://localhost:5000 (health: /api/health)
- MongoDB: localhost:27017 (container name: mongo)

A seed job creates a demo user and default categories:
- Email: demo@demo.com
- Password: Password123!

## Environment
The compose file sets:
- CONNECTION_URL=mongodb://mongo:27017/expense_tracker
- JWT_SECRET=dev_local_jwt_secret_change_me
- CLIENT_URL=http://localhost:3000
- PUBLIC_BASE_URL=http://localhost:5000

Add Google OAuth, email, or Salt Edge credentials by editing docker-compose.yml.

## Common tasks
- Reseed via HTTP:
  ```
  docker compose run --rm seed
  ```
- Stop:
  ```
  docker compose down
  ```
- Reset Mongo data:
  ```
  docker compose down -v
  docker compose up --build
  ```

## Troubleshooting
- Ports 3000/5000/27017 in use: stop other apps or change ports in compose.
- CORS: adjust CLIENT_URL if hosting elsewhere.
- OCR: large/low-quality receipts may take longer; try clearer images.
