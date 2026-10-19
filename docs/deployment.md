# Gelana — Deployment & Production Readiness Runbook

This guide documents the complete architecture, configuration, deployment, and verification procedure for the **Gelana Inventory & Sales Management System** (Milestone 14 — Production Hardening & Portfolio Deployment).

---

## 1. System Architecture & Request Flow

Gelana supports both **local development** and a **hosted portfolio demonstration** using identical application logic, database schemas, and API contracts.

### Hosted Architecture (Production)

```
[ Browser / Visitor ]
        │
        ▼ (HTTPS)
[ Vercel — React Vite SPA ]
        │
        ├── Static assets & SPA routes (/dashboard, /settings, /catalog, etc.)
        │
        └── Same-Origin API Rewrites (/api/v1/:path*)
                │
                ▼ (HTTPS JSON)
        [ Render — Express API Service ]
                │
                ▼ (TLS / SSL with certificate validation)
        [ Neon — PostgreSQL Database ]
```

### Local Development Architecture

```
[ Browser ]
        │
        ▼ (HTTP)
[ Vite Dev Server (localhost:5173) ]
        │
        ├── Web UI & Hot Module Replacement
        │
        └── Dev Proxy (/api -> localhost:3000)
                │
                ▼ (HTTP JSON)
        [ Express API (localhost:3000) ]
                │
                ▼ (TLS for Neon OR plaintext for local Postgres)
        [ Neon PostgreSQL OR Local PostgreSQL ]
```

### Why Same-Origin API Routing?
1. **First-Party Cookies:** Browser authentication cookies are scoped to the frontend origin, preventing cross-site cookie restrictions in modern browsers (Chrome Privacy Sandbox, Safari ITP).
2. **Clean SPA Routing:** Vercel rewrites forward `/api/v1/:path*` directly to Render while routing all other page requests (`/dashboard`, `/catalog`, etc.) to `/index.html`.
3. **No Leaked HTML on Error:** When an API endpoint fails, Render returns structured JSON error responses rather than Vercel serving `index.html` disguised as API output.
4. **Cache Protection:** API routes carry strict `Cache-Control: no-store, no-cache, must-revalidate` headers so private business data and user sessions are never cached by edge CDNs.

---

## 2. Portfolio Demo Test Accounts

The portfolio database is seeded with four shared demonstration accounts, representing each system role and branch scope:

| Role | Email | Password | Assigned Branch | Permissions Scope |
|---|---|---|---|---|
| **System Owner** | `owner@gelana.com` | `password123` | *All Branches* (Global) | Full administrative access: multi-branch dashboard, closing reviews, transfers, user management, audit logs, system settings |
| **Main Branch Employee** | `employee@gelana.com` | `password123` | Main Branch | Branch-isolated sales, returns, shift closing, product catalog, branch inventory |
| **Downtown Employee** | `downtown@gelana.com` | `password123` | Downtown Branch | Branch-isolated sales, returns, shift closing, product catalog, branch inventory |
| **Warehouse Employee** | `warehouse@gelana.com` | `password123` | Warehouse Branch | Inventory transfers, receiving, warehouse stock management, shift closing |

> [!NOTE]
> These credentials are intentionally documented for portfolio demonstration testing. In the Neon demo database, passwords are securely hashed using Argon2id.

---

## 3. Environment Variables Reference

### Backend (`apps/api/.env` and Render Dashboard)

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | Yes | HTTP listening port (Render sets this automatically) | `3000` (local) / `10000` (Render) |
| `NODE_ENV` | Yes | Runtime mode (`development` or `production`) | `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Yes | Secret key for signing session tokens (min 32 chars in production) | Generate via `openssl rand -hex 32` |
| `FRONTEND_URL` | Yes (hosted) | Production URL of Vercel frontend for CORS validation | `https://your-portfolio-app.vercel.app` |
| `ALLOWED_ORIGINS` | Optional | Additional allowed CORS origins (comma-separated) | `https://your-domain.com,http://localhost:5173` |
| `ALLOW_DEMO_SEED` | Optional | Safety switch allowing demo seeding in production | `true` (for portfolio demo) |
| `COOKIE_SAME_SITE` | Optional | Cookie SameSite policy | `lax` (dev) / `none` (cross-origin prod) |
| `COOKIE_SECURE` | Optional | Require HTTPS for cookies | `true` (prod) / `false` (local dev) |

### Frontend (`apps/web/.env.local` and Vercel Dashboard)

| Variable | Required | Description | Default |
|---|---|---|---|
| `VITE_API_URL` | Optional | Base URL for API requests. Leave unset to use `/api/v1` same-origin proxy | `/api/v1` |
| `VITE_DEV_API_TARGET` | Optional | Target for local Vite dev proxy | `http://localhost:3000` |

---

## 4. Step-by-Step Deployment Runbook

### Step 1: Provision Neon PostgreSQL

1. Log in to [Neon Console](https://console.neon.tech/).
2. Click **Create Project**:
   - **Name:** `gelana-portfolio`
   - **Postgres version:** 16 or 15
   - **Region:** Select the region closest to where you will host Render (e.g., `AWS US East (Ohio)` or `AWS EU (Frankfurt)`).
3. Under the **Dashboard** for your default branch (`main`), find **Connection Details**:
   - Choose **Pooled connection** (or Direct connection).
   - Ensure the connection string includes `?sslmode=require`.
   - The connection string will look like:
     `postgresql://<user>:<password>@<endpoint-id>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require`
4. **Apply Migrations and Seed Demo Data from Local Terminal:**
   ```bash
   # In apps/api/.env, set DATABASE_URL to your Neon connection string:
   DATABASE_URL="postgresql://<user>:<password>@<endpoint-id>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require"
   
   # Apply migrations to create the schema
   npm run db:migrate
   
   # Seed the demo dataset (accounts, 3 months history, sales, inventory, closings)
   npm run seed:demo
   ```
   > Both commands are completely idempotent and non-destructive.

---

### Step 2: Deploy Backend to Render

You can deploy using either the included `render.yaml` Blueprint or manually via the Render Web Service wizard.

#### Option A: Deploy via Blueprint (`render.yaml`)
1. In the [Render Dashboard](https://dashboard.render.com/), click **New** -> **Blueprint**.
2. Select your repository `gelana-inventory-and-sales-management-system`.
3. Render reads `render.yaml` and will prompt for the sync variables:
   - `DATABASE_URL`: Paste your Neon connection string (`?sslmode=require`).
   - `FRONTEND_URL`: Enter your anticipated Vercel URL (e.g., `https://gelana-inventory.vercel.app`).
4. Click **Apply**.

#### Option B: Manual Web Service Setup
1. In the Render Dashboard, click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name:** `gelana-api`
   - **Region:** Same region as Neon (e.g., Ohio or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `.` (leave at repository root)
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npm run build:api`
   - **Start Command:** `npm run start:api`
   - **Plan:** `Free`
4. Under **Advanced**:
   - **Health Check Path:** `/api/v1/health`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://<user>:<password>@<endpoint-id>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require`
   - `JWT_SECRET`: *(Generate a strong 32+ character random string)*
   - `FRONTEND_URL`: `https://your-app.vercel.app`
   - `ALLOW_DEMO_SEED`: `true`
6. Click **Create Web Service**.
7. Once deployed, note your service URL: `https://gelana-api-xxxx.onrender.com`.
8. Verify health endpoint in your browser: `https://gelana-api-xxxx.onrender.com/api/v1/health` returns `{"status":"ok","message":"Gelana API is running"}`.

---

### Step 3: Deploy Frontend to Vercel

1. In the [Vercel Dashboard](https://vercel.com/), click **Add New** -> **Project**.
2. Import the `gelana-inventory-and-sales-management-system` repository.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `apps/web` (or keep `.` with root `vercel.json`).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Configure API Rewrite Destination:**
   In `apps/web/vercel.json` (and root `vercel.json`), update the rewrite destination with your real Render URL:
   ```json
   {
     "source": "/api/v1/:path*",
     "destination": "https://gelana-api-xxxx.onrender.com/api/v1/:path*"
   }
   ```
   Commit and push this change to your repository.
5. Click **Deploy**.
6. Once deployed, copy your assigned Vercel URL (e.g., `https://gelana-inventory.vercel.app`).
7. Return to the Render dashboard and update the `FRONTEND_URL` environment variable with this Vercel URL.

---

## 5. Local Development Quickstart

To run Gelana locally on your workstation:

1. **Clone and Install:**
   ```bash
   cd gelana-inventory-and-sales-management-system
   npm install
   ```

2. **Configure API Environment:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Edit `apps/api/.env` with your database credentials (either your local PostgreSQL or the Neon demo database).

3. **Initialize Database & Seed Data:**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed test accounts and multi-month business data
   npm run seed:demo
   ```

4. **Start Development Servers:**
   - In Terminal 1 (API server):
     ```bash
     npm run dev:api
     ```
     API will listen on `http://0.0.0.0:3000`.
   
   - In Terminal 2 (Web client):
     ```bash
     npm run dev:web
     ```
     Vite will start on `http://localhost:5173`.

5. **Open Browser:**
   Navigate to `http://localhost:5173` and log in with any of the demo accounts from Section 2.

---

## 6. Hosted Acceptance & Smoke-Test Checklist

Once deployed to Render and Vercel:

- [ ] **SSL / HTTPS:** Both Vercel frontend and Render API load securely over HTTPS.
- [ ] **Health Endpoint:** `GET https://<render-url>/api/v1/health` returns HTTP 200 with `status: ok`.
- [ ] **API Rewrites:** Opening `https://<vercel-url>/api/v1/health` forwards to Render and returns HTTP 200.
- [ ] **SPA Navigation & Refresh:** Directly opening and refreshing `/dashboard`, `/catalog`, `/settings`, and `/notifications` loads the React app without 404 errors.
- [ ] **Owner Authentication:** Log in as `owner@gelana.com` (`password123`). The multi-branch dashboard, closing reviews, and audit logs load populated charts and tables.
- [ ] **Employee Authentication:** Log in as `employee@gelana.com` (`password123`). Only Main Branch sales and stock are visible.
- [ ] **Branch Isolation:** Log in as `downtown@gelana.com` (`password123`). Verify that Downtown Branch data is isolated from Main Branch.
- [ ] **Warehouse Isolation:** Log in as `warehouse@gelana.com` (`password123`). Verify inventory transfer and receiving access.
- [ ] **Global Search:** Press `Ctrl+K` (or click search bar). Search for "Paper" or "Notebook". Scoped results appear instantly with keyboard navigation.
- [ ] **Catalog Search:** Filter by category and search by SKU or name in `/catalog`.
- [ ] **Session Persistence:** Browser refresh maintains authentication status via HTTP-only cookie.
- [ ] **Logout Flow:** Clicking logout successfully clears the cookie and redirects to `/login`.
