# Gelana — Multi-Branch Inventory & Sales Management System

A multi-branch stationery inventory and sales management system built for high data integrity, strict branch isolation, and multi-month business analytics.

Developed with **React 19**, **TypeScript**, **Tailwind CSS**, **Express 5**, **Drizzle ORM**, and **PostgreSQL (Neon)**.

---

## Portfolio Live Demo & Access

The portfolio demonstration is prepared for hosting on **Vercel** (Frontend) and **Render** (Backend API), backed by a shared **Neon PostgreSQL** database.

- **Deployed Frontend Web App:** `[PENDING: Configure after deploying to Vercel — e.g. https://gelana-inventory.vercel.app]`
- **Deployed Backend API:** `[PENDING: Configure after deploying to Render — e.g. https://gelana-api.onrender.com]`
- **API Health Check:** `[PENDING: https://<render-url>/api/v1/health]`

### Demo Access Credentials

The demo database is pre-seeded with multi-month sales history, returns, inventory transfers, daily closing records, notifications, and four role-based accounts:

| Role | Email | Password | Assigned Branch | Scope / What to Test |
|---|---|---|---|---|
| **System Owner** | `owner@gelana.com` | `password123` | *Global (All)* | Multi-branch analytics, global search (`Ctrl+K`), closing approvals, branch transfers, user management, audit logs, system settings |
| **Main Branch Employee** | `employee@gelana.com` | `password123` | Main Branch | POS sales terminal, returns processing, product catalog search, shift closing |
| **Downtown Employee** | `downtown@gelana.com` | `password123` | Downtown Branch | Downtown branch sales, branch-isolated stock balances and returns |
| **Warehouse Employee** | `warehouse@gelana.com` | `password123` | Warehouse Branch | Warehouse stock management, branch inventory transfers, goods receiving |

> **Note:** These credentials are intentionally documented for portfolio demonstration testing. Passwords in the database are hashed with Argon2id.

---

## System Architecture

```
[ Visitor Browser ]
        │
        ▼ (HTTPS)
[ Vercel — React Vite SPA ]
        │
        ├── SPA Pages: /dashboard, /catalog, /sales, /closing, /reports, /settings
        │
        └── Same-Origin API Rewrites: /api/v1/:path*
                │
                ▼ (HTTPS JSON)
        [ Render — Express API Service ]
                │
                ▼ (TLS / SSL with certificate validation)
        [ Neon — PostgreSQL Database ]
```

- **Same-Origin API Routing:** Browser requests go to `/api/v1/...`, forwarded by Vercel edge rewrites to Render. Cookies remain first-party, avoiding third-party cookie blocking.
- **Strict Role & Branch Authorization:** Backend verifies roles and enforces branch scoping on all queries and mutations.
- **Graceful Shutdown:** Express gracefully terminates HTTP listeners and releases database pool connections.

---

## Local Development Quickstart

### 1. Prerequisites
- Node.js 20+ and npm 10+
- PostgreSQL instance (local or Neon PostgreSQL)

### 2. Setup
```bash
# Clone the repository
git clone <repo-url>
cd gelana-inventory-and-sales-management-system

# Install dependencies across all workspaces
npm install

# Configure backend environment variables
cp apps/api/.env.example apps/api/.env
```

Configure `DATABASE_URL` in `apps/api/.env`:
- Local Postgres: `postgresql://postgres:postgres@localhost:5432/inventory_db`
- Neon Demo: `postgresql://<user>:<password>@<neon-endpoint>.neon.tech/<dbname>?sslmode=require`

### 3. Initialize & Seed Database
```bash
# Apply database migrations
npm run db:migrate

# Seed demo dataset (branches, products, test accounts, 3 months sales & transfers)
npm run seed:demo
```

### 4. Run Development Servers
```bash
# Terminal 1 — Start Express API server (runs on http://0.0.0.0:3000)
npm run dev:api

# Terminal 2 — Start React Vite frontend (runs on http://localhost:5173)
npm run dev:web
```

Open `http://localhost:5173` in your browser and log in with any test account above. Vite automatically proxies `/api` requests to `http://localhost:3000`.

---

## Deployment Documentation

For the step-by-step production deployment runbook covering **Neon PostgreSQL**, **Render API**, and **Vercel Frontend**, see:

📄 **[Comprehensive Deployment Guide (docs/deployment.md)](docs/deployment.md)**

---

## Workspace Scripts Reference

| Command | Action |
|---|---|
| `npm run dev:web` | Start frontend Vite development server |
| `npm run dev:api` | Start backend Express development server with tsx |
| `npm run build` | Build all workspaces for production |
| `npm run build:web` | Build Vite frontend into `apps/web/dist` |
| `npm run build:api` | Compile API TypeScript into `apps/api/dist` |
| `npm run start:api` | Start compiled production API server |
| `npm run typecheck` | Run TypeScript compiler checks across all workspaces |
| `npm run lint` | Run oxlint across all workspaces |
| `npm test` | Run complete automated test suite (51 test files) |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run seed:demo` | Safely and idempotently seed demo accounts and business history |
