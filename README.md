# Gelana — Multi-Branch Inventory & Sales Management System

A production-ready multi-branch stationery inventory and sales management system built for high data integrity, strict branch isolation, point-of-sale (POS) operations, and multi-month business analytics.

Developed with **React 19**, **TypeScript**, **Tailwind CSS**, **Express 5**, **Drizzle ORM**, and **PostgreSQL (Neon)**.

---

## Live Portfolio Demonstration

The hosted portfolio demonstration is running online:

- **Web Application (Vercel):** [https://gelana-inventory-and-sales-manageme.vercel.app](https://gelana-inventory-and-sales-manageme.vercel.app)
- **Backend API (Render):** [https://gelana-inventory-and-sales-management.onrender.com](https://gelana-inventory-and-sales-management.onrender.com)
- **API Health Check:** [https://gelana-inventory-and-sales-management.onrender.com/api/v1/health](https://gelana-inventory-and-sales-management.onrender.com/api/v1/health)

### Demo Access Credentials

The demo database is pre-seeded with multi-month sales history, returns, inventory transfers, daily closing shifts, and four role-based accounts:

| Role | Email | Password | Assigned Branch | Scope / What to Test |
|---|---|---|---|---|
| **System Owner** | `owner@gelana.com` | `password123` | *Global (All Branches)* | Multi-branch analytics, global search (`Ctrl+K`), closing reviews, branch transfers, user management, audit logs, system settings |
| **Main Branch Employee** | `employee@gelana.com` | `password123` | Main Branch | POS sales terminal, returns processing, product catalog search, shift closing |
| **Downtown Employee** | `downtown@gelana.com` | `password123` | Downtown Branch | Branch-isolated sales, stock balances, returns, shift closing |
| **Warehouse Employee** | `warehouse@gelana.com` | `password123` | Warehouse Branch | Warehouse stock management, inter-branch transfers, goods receiving |

> **Note:** These credentials are for portfolio demonstration purposes only. Passwords in the database are securely hashed using Argon2id. Seeded demonstration data is disposable.

---

## Core Features

- **Multi-Branch Inventory Control:** Real-time stock tracking across branches, weighted average cost (WAC) calculations, stock adjustments, damage disposals, opening stock initialization, and physical stocktake reconciliations.
- **Point of Sale (POS) & Checkout:** Fast sales checkout supporting base and packaged unit conversions (e.g., piece vs. pack/box/carton), multiple payment methods (Cash, Telebirr, Card, Bank Transfer), receipt generation, and sales history.
- **Returns & Refund Workflows:** Strict sale-linked item returns, automatic inventory restock, and payment refund accounting.
- **Branch Stock Transfers:** Multi-step transfer workflow (`PENDING` → `DISPATCHED` → `RECEIVED`) with built-in discrepancy resolution for damaged or missing items.
- **Daily Shift Closing:** Cashier shift reconciliation, expected vs. counted cash tracking, variance computation, event audit trail, and owner review/approval.
- **Analytics & Reporting:** Multi-month revenue and gross profit charts, sales trends by category, branch comparisons, inventory valuation, and top-performing products.
- **Global Search (`Ctrl+K`):** System-wide command palette to find products, categories, transactions, transfers, and navigation shortcuts filtered by branch permissions.
- **Security & Authorization:** HTTP-only secure cookie sessions, JWT authentication, rate limiting, and server-side RBAC ensuring branch isolation for employees.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query (React Query), React Router 7, React Hook Form, Zod, Zustand |
| **Backend API** | Node.js, Express 5, TypeScript, Drizzle ORM, Argon2id, jsonwebtoken, Helmet, CORS, Morgan |
| **Database** | PostgreSQL 16 (Neon Serverless PostgreSQL with connection pooling and SSL) |
| **Hosting & CI** | Vercel (Frontend SPA with edge API rewrites), Render (API Web Service), Vitest, Oxlint |

---

## System Architecture

```
[ Visitor Browser ]
        │
        ▼ (HTTPS)
[ Vercel — React Vite SPA ]
        │
        ├── Client Routes: /dashboard, /catalog, /sales, /transfers, /closing, /reports
        │
        └── Same-Origin API Rewrites: /api/v1/:path*
                │
                ▼ (HTTPS JSON Proxy)
        [ Render — Express API Service ]
                │
                ▼ (TLS / SSL via pooled connection)
        [ Neon — Serverless PostgreSQL ]
```

- **Same-Origin API Routing:** Browser requests go to `/api/v1/...`, transparently proxied to Render by Vercel edge rewrites. Cookies remain first-party, eliminating third-party cookie restrictions.
- **Strict Role & Branch Authorization:** Backend verifies roles and enforces branch scoping on all queries and mutations.
- **Graceful Shutdown:** Express gracefully terminates HTTP listeners and releases database pool connections.

---

## Environment Variables Reference

### Backend (`apps/api/.env` and Render Dashboard)

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | Yes | HTTP listening port (Render sets automatically) | `3000` (local) / `10000` (Render) |
| `NODE_ENV` | Yes | Runtime mode | `development` / `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string with SSL | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Yes | Secret key for signing session tokens (min 32 chars) | `openssl rand -hex 32` |
| `FRONTEND_URL` | Yes (prod) | Production URL of Vercel frontend for CORS | `https://your-app.vercel.app` |
| `ALLOWED_ORIGINS` | Optional | Additional allowed CORS origins (comma-separated) | `http://localhost:5173` |
| `ALLOW_DEMO_SEED` | Optional | Safety switch allowing demo seeding in production | `true` |

### Frontend (`apps/web/.env.local` and Vercel Dashboard)

| Variable | Required | Description | Default |
|---|---|---|---|
| `VITE_API_URL` | Optional | Base API URL. Leave unset to use `/api/v1` same-origin proxy | `/api/v1` |
| `VITE_DEV_API_TARGET` | Optional | Target for local Vite dev proxy | `http://localhost:3000` |

---

## Local Development Quickstart

### 1. Prerequisites
- **Node.js** 20+ and **npm** 10+
- A running **PostgreSQL** instance (local Postgres or Neon cloud database)

### 2. Installation
```bash
# Clone repository
git clone git@github.com:e-b-b-o/gelana-inventory-and-sales-management-system.git
cd gelana-inventory-and-sales-management-system

# Install dependencies
npm install

# Configure backend environment
cp apps/api/.env.example apps/api/.env
```

Configure `DATABASE_URL` in `apps/api/.env` with your PostgreSQL connection string.

### 3. Database Initialization & Demo Seeding
```bash
# Run database migrations
npm run db:migrate

# Seed demo dataset (branches, products, demo accounts, 3 months history)
npm run seed:demo
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend Express API server (http://localhost:3000)
npm run dev:api

# Terminal 2: Start frontend Vite development server (http://localhost:5173)
npm run dev:web
```

Open `http://localhost:5173` in your browser and log in with any demo account listed above. Vite automatically proxies `/api` calls to `http://localhost:3000`.

---

## Scripts & Verification

| Command | Action |
|---|---|
| `npm run dev:web` | Start frontend Vite development server |
| `npm run dev:api` | Start backend Express development server |
| `npm run build` | Build all workspaces for production |
| `npm run build:web` | Build Vite frontend into `apps/web/dist` |
| `npm run build:api` | Compile API TypeScript into `apps/api/dist` |
| `npm run start:api` | Start compiled production API server |
| `npm run typecheck` | Run TypeScript compiler checks across all workspaces |
| `npm run lint` | Run oxlint across all workspaces |
| `npm test` | Run complete automated test suite |
| `npm run db:migrate` | Apply Drizzle database migrations |
| `npm run seed:demo` | Safely and idempotently seed demo data and accounts |
