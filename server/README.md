# MEMMIC Backend (Node.js / Express / Prisma)

A 1:1 Node.js port of the Python FastAPI backend in `../Backend`. Same routes,
same request/response JSON shapes (snake_case, matching the Frontend's
expectations), same auth model, same business logic — implemented with
Express, Prisma (PostgreSQL), Zod and JWT instead of FastAPI/SQLAlchemy/Pydantic.

The original Python backend is untouched; this lives side by side in
`Backend-Node/` so you can run either one against the Frontend.

## Tech stack

- [Express](https://expressjs.com/) 4 — HTTP framework
- [Prisma](https://www.prisma.io/) — ORM + migrations (PostgreSQL), replacing SQLAlchemy + Alembic
- [Zod](https://zod.dev/) — request validation, replacing Pydantic schemas
- `jsonwebtoken` + `bcryptjs` — JWT auth + password hashing, replacing python-jose + passlib
- `nodemailer` — SMTP email, replacing smtplib
- `express-rate-limit` — rate limiting, replacing slowapi
- TypeScript throughout

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL (can be the same database the Python backend uses, or a fresh one — table/column names are mapped to match the original schema)

### Setup

```bash
cd Backend-Node
npm install

cp .env.example .env
#   -> fill in DATABASE_URL, SECRET_KEY, REDIS_URL, and SMTP mail settings

# create the database schema
npx prisma migrate dev --name init

# seed roles (Invester, Admin, Manager, plus the 4 client-portal roles
# evaluation_client / investment_client / marketplace_client / management_client
# — the Python app seeds these last 4 via an Alembic data migration instead)
npm run seed:roles

# start the API server (auto-reload)
npm run dev
```

The API will be available at `http://localhost:8000`, matching the Python
backend's default port, so the existing Frontend (`NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`)
works against it unmodified.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with auto-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type-check without emitting |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run seed:roles` | Seed the `roles` table |

## Project structure

```
Backend-Node/
  prisma/
    schema.prisma        # models — mirrors Backend/app/models exactly (mapped column/table names)
  src/
    app.ts                # Express app: security headers, CORS, rate limiting, router mount
    server.ts              # entrypoint
    config.ts              # env loading (mirrors app/config.py)
    db.ts                  # Prisma client singleton
    logger.ts
    core/
      security.ts           # JWT + bcrypt (mirrors app/core/security.py)
      credentials.ts         # random client credential generator
      apiError.ts
    middleware/
      auth.ts                # getCurrentUser (mirrors app/dependencies.py)
      requireRoles.ts         # role guard (mirrors app/core/premissions.py)
      rateLimit.ts
      validate.ts
      errorHandler.ts
    services/
      email.ts                # nodemailer (mirrors smtplib usage in admin.py/client.py)
      sse.ts                   # SSE broadcast manager (mirrors SSEManager in admin.py)
      portalSeed.ts             # demo dashboard data generator (mirrors app/services/portal_seed.py)
    schemas/                   # Zod request schemas + output serializers (mirror app/schemas/*.py)
    routes/
      auth.routes.ts            # mirrors app/api/v1/auth.py
      client.routes.ts          # mirrors app/api/v1/client.py
      admin.routes.ts           # mirrors app/api/v1/admin.py
    scripts/
      seedRoles.ts               # mirrors seed_roles.py (+ the 4 portal roles)
```

## API overview

Identical routes and prefixes to the Python backend:

- `POST /api/v1/auth/*` — register, login, refresh
- `/api/v1/admin/*` — admin endpoints (enquiries, clients, categories, portal dashboards, system logs, SSE stream)
- `/api/v1/client/*` — public contact/enquiry forms + authenticated client portal endpoints

## Known quirks preserved from the original

Ported faithfully rather than "fixed", to keep behavior identical:

- `GET /api/v1/admin/enquiry-categories/user` has no auth guard, despite living under `/admin`.
- `DELETE /api/v1/admin/client/messages/:id` allows a `super_admin` role that is never seeded anywhere.
- Rate limiting is in-memory (not Redis-backed), matching the Python `Limiter` which is constructed without `storage_uri` despite `REDIS_URL` being configured.
- `User.clientMessageId` has no DB-level uniqueness constraint even though the app treats it as one-to-one.
