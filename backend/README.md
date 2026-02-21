# FleetFlow API

Minimal authentication and role-based access control for a multi-tenant fleet management system.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Create the database and run the schema:
   ```bash
   psql -d your_database -f schema.sql
   ```
3. Install and run:
   ```bash
   npm install
   npm start
   ```

## API

- **POST /auth/signup** — Register as manager or dispatcher.
  - Manager: `{ "name", "email", "password", "role": "manager", "organisationName" }` — returns `access_code`.
  - Dispatcher: `{ "name", "email", "password", "role": "dispatcher", "accessCode": "123456" }`.
- **POST /auth/login** — `{ "email", "password" }` — returns `{ "token", "user" }`.

Protected routes can use `verifyToken` and `allowRoles(...roles)` from `src/middleware/auth.middleware.js`. JWT payload: `userId`, `role`, `access_code`.
