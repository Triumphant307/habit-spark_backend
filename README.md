# HabitSpark API

![CI](https://github.com/Triumphant307/habit-spark_backend/actions/workflows/ci.yml/badge.svg)

A REST API for tracking daily habits, managing streaks, and recording completion history. Built with **TypeScript**, **Express 5**, **Prisma 7**, and **PostgreSQL**.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Testing](#testing)
- [CI Pipeline](#ci-pipeline)
- [Scripts Reference](#scripts-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture

The codebase follows a **layered architecture** to keep concerns separated and each layer independently testable:

```
Request
  │
  ▼
Routes          ─ URL mapping + middleware wiring
  │
  ▼
Controllers     ─ HTTP concerns (req/res), ownership checks
  │
  ▼
Services        ─ Business logic, orchestration
  │
  ▼
Repositories    ─ Data access via Prisma
  │
  ▼
Domain          ─ Pure functions (streak calculation, habit factory)
```

**Key design decisions:**

- **Domain layer** contains zero I/O. Functions like `calculateStreak` and `createHabit` are pure, making them trivial to unit test.
- **Validation** is handled by Zod schemas in a dedicated `validators/` layer, applied as Express middleware before controllers execute.
- **Error handling** is centralized via `AppError` and a global error middleware, providing consistent JSON error responses.
- **Authentication** uses JWT Bearer tokens. The `authenticate` middleware attaches `req.userId` to every protected request.

---

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Runtime        | Node.js 22+ (ESM)                         |
| Language       | TypeScript 5.9 (`strict` mode)            |
| Framework      | Express 5                                 |
| ORM            | Prisma 7 with `@prisma/adapter-pg`        |
| Database       | PostgreSQL 16                             |
| Authentication | JSON Web Tokens (`jsonwebtoken`) + bcrypt |
| Validation     | Zod 4                                     |
| Testing        | Jest 30 + ts-jest + Supertest             |
| CI             | GitHub Actions                            |
| Formatting     | Prettier                                  |

---

## Project Structure

```yaml
prisma/:
  schema.prisma: # Data models — User, Habit, HabitEntry, Frequency enum
  migrations/: # Versioned migration history

prisma.config.ts: # Prisma 7 runtime configuration (datasource URL)

src/:
  server.ts: # Entry point — boots env, starts HTTP listener
  app.ts: # Express app factory — middleware + route mounting

  config/:
    env.ts: # Zod-validated environment variables (single source of truth)
    database.ts: # Prisma client singleton (PrismaPg adapter)

  routes/:
    authRoutes.ts: # POST /auth/register, POST /auth/login
    habitRoutes.ts: # CRUD + completion toggle (all authenticated)

  controllers/:
    authController.ts: # Registration and login HTTP handlers
    habitController.ts: # Habit CRUD — delegates ownership to service layer

  services/:
    authService.ts: # Registration/login business logic
    habitService.ts: # Habit orchestration, ownership checks, streak recalculation

  repositories/:
    userRepository.ts: # User persistence (find, create)
    habitRepository.ts: # Habit + HabitEntry persistence

  domain/:
    habit.ts: # Pure functions — createHabit, calculateStreak

  validators/:
    authValidators.ts: # Zod schemas — registerSchema, loginSchema
    habitValidators.ts: # Zod schemas — create, update, complete

  middleware/:
    authenticate.ts: # JWT Bearer token verification
    validate.ts: # Generic Zod validation middleware factory
    requestId.ts: # X-Request-ID generation and propagation
    errorMiddleware.ts: # Global error handler + 404 catch-all

  lib/:
    auth.ts: # Password hashing + JWT sign/verify utilities
    logger.ts: # Structured logging via Pino

  utils/:
    errors.ts: # AppError class (operational error handling)

  types/:
    express.d.ts: # req.userId and req.id augmentation for Express

  test/:
    authenticate.test.ts: # JWT middleware unit tests
    calculateStreak.test.ts: # Pure domain logic tests
    dbConnection.test.ts: # Prisma client connectivity
    habitApi.test.ts: # Integration tests for habit API endpoints
    habitCrud.test.ts: # Service-layer habit CRUD operations
    habitStreak.test.ts: # End-to-end streak behavior

.github/workflows/:
  ci.yml: # Type check + test on push/PR to main

.env.example: # Template for required environment variables
tsconfig.json: # TypeScript config (ES2022, NodeNext, strict)
package.json: # Scripts, dependencies, Jest config
.prettierrc.json: # Formatting rules
```

---

## Prerequisites

- **Node.js** >= 22
- **npm** >= 10
- **PostgreSQL** >= 16 running locally or via Docker

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Triumphant307/habit-spark_backend.git
cd habit-spark_backend
```

### 2. Install dependencies

```bash
npm install
```

This runs `postinstall` automatically, which generates the Prisma client.

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and update the values (see [Environment Variables](#environment-variables)).

### 4. Create and migrate the database

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

The server starts at `http://localhost:5000` (or the port specified in `.env`).

---

## Environment Variables

| Variable             | Description                                            | Default                 |
| -------------------- | ------------------------------------------------------ | ----------------------- |
| `PORT`               | Port the HTTP server listens on                        | `5000`                  |
| `NODE_ENV`           | Environment mode (`development`, `test`, `production`) | `development`           |
| `DATABASE_URL`       | PostgreSQL connection string                           | _(required)_            |
| `JWT_SECRET`         | Secret key for signing JWTs                            | _(required)_            |
| `JWT_EXPIRES_IN`     | Token expiration duration                              | `7d`                    |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor                                     | `10`                    |
| `FRONTEND_URL`       | Allowed CORS origin                                    | `http://localhost:3000` |

> **Security:** Never commit `.env` to version control. Use a long, random string for `JWT_SECRET` in production (minimum 32 characters). The `.env.example` file is the safe template.

---

## Database Setup

The project uses **Prisma 7** with the `@prisma/adapter-pg` driver adapter. The schema defines three models:

| Model        | Purpose                                               |
| ------------ | ----------------------------------------------------- |
| `User`       | Account credentials and profile (email, name, hash)   |
| `Habit`      | Habit metadata, scheduling, reminders, streak count   |
| `HabitEntry` | Individual completion records (one per habit per day) |

**Common Prisma commands:**

```bash
# Apply pending migrations to the database
npx prisma migrate dev

# Reset database and re-apply all migrations (destructive)
npx prisma migrate reset

# Deploy migrations in CI/production (no interactive prompts)
npx prisma migrate deploy

# Regenerate the Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (visual database browser)
npx prisma studio
```

---

## Running the Server

| Mode        | Command         | Description                                     |
| ----------- | --------------- | ----------------------------------------------- |
| Development | `npm run dev`   | Runs via `tsx watch` with hot reload            |
| Production  | `npm start`     | Compiles TypeScript, then runs `dist/server.js` |
| Build only  | `npm run build` | Compiles to `dist/` without starting the server |

---

## API Reference

All responses use JSON. Protected routes require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint         | Body                         | Response (Success)                 |
| ------ | ---------------- | ---------------------------- | ---------------------------------- |
| POST   | `/auth/register` | `{ email, password, name? }` | `201` — `{ message, user, token }` |
| POST   | `/auth/login`    | `{ email, password }`        | `200` — `{ message, user, token }` |

### Habits (all routes require authentication)

| Method | Endpoint               | Body / Params                     | Response (Success)                              |
| ------ | ---------------------- | --------------------------------- | ----------------------------------------------- |
| GET    | `/habits`              | —                                 | `200` — array of habits with completion history |
| GET    | `/habits/:id`          | —                                 | `200` — single habit with completion history    |
| POST   | `/habits`              | `{ title, icon, category, ... }`  | `201` — created habit                           |
| PATCH  | `/habits/:id`          | `{ title?, icon?, target?, ... }` | `200` — updated habit                           |
| PATCH  | `/habits/:id/complete` | `{ date: "YYYY-MM-DD" }`          | `200` — `{ habit, isNowCompleted, streak }`     |
| DELETE | `/habits/:id`          | —                                 | `200` — `{ habitId, message }`                  |

### Error Responses

All errors follow a consistent shape:

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "title: Title is required"
}
```

- `4xx` errors set `status` to `"fail"` (client error).
- `5xx` errors set `status` to `"error"` (server error).
- In `development` mode, the response includes `stack` for debugging.

---

## Testing

Tests are located in `src/test/` and use **Jest** with ESM support via `ts-jest`.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Test suites:**

| File                      | Scope                                     |
| ------------------------- | ----------------------------------------- |
| `authenticate.test.ts`    | JWT middleware unit tests                 |
| `calculateStreak.test.ts` | Pure domain logic (streak calculation)    |
| `dbConnection.test.ts`    | Prisma client database connectivity       |
| `habitApi.test.ts`        | Integration tests for habit API endpoints |
| `habitCrud.test.ts`       | Service-layer habit CRUD operations       |
| `habitStreak.test.ts`     | End-to-end streak behavior via the API    |

> **Note:** Tests that hit the database require a running PostgreSQL instance. Configure `DATABASE_URL` in your `.env` to point to a dedicated test database to avoid polluting development data.

---

## CI Pipeline

GitHub Actions runs on every push to `main`/`dev` and on pull requests to `main`. A **concurrency group** automatically cancels superseded runs on the same branch.

The workflow (`.github/workflows/ci.yml`) runs two parallel jobs:

### Quality (no database)

1. **Install dependencies** via `npm ci`.
2. **Generate Prisma client** (needed for type resolution).
3. **Type check** via `tsc --noEmit`.
4. **Lint** via `eslint`.
5. **Check formatting** via `prettier --check`.
6. **Build** via `tsc`.

### Test Suite (PostgreSQL 16 service)

1. **Install dependencies** via `npm ci`.
2. **Generate Prisma client**.
3. **Apply migrations** to the test database.
4. **Run the full test suite.**

---

## Scripts Reference

| Script         | Command                                          | Purpose                        |
| -------------- | ------------------------------------------------ | ------------------------------ |
| `dev`          | `tsx watch src/server.ts`                        | Development server with reload |
| `build`        | `tsc`                                            | Compile TypeScript to `dist/`  |
| `start`        | `tsc && node dist/server.js`                     | Production build + run         |
| `test`         | `node --experimental-vm-modules jest`            | Run test suite (ESM mode)      |
| `test:watch`   | `node --experimental-vm-modules jest --watchAll` | Tests in watch mode            |
| `format`       | `prettier --write .`                             | Format all files               |
| `format:check` | `prettier --check .`                             | Check formatting (CI-friendly) |
| `postinstall`  | `prisma generate`                                | Auto-generate Prisma client    |

---

## Contributing

1. Create a feature branch from `main`.
2. Write tests for new functionality.
3. Ensure `npm test` and `tsc --noEmit` pass locally.
4. Run `npm run format` before committing.
5. Open a pull request against `main`.

---

## License

ISC
