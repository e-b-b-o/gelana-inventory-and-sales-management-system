# Project Progress

Status vocabulary: `[Done]`, `[In Progress]`, `[Todo]`, `[Blocked]`.

> Keep this file factual. It tracks implementation, not ideas.

## Phase 1 --- Project foundation

-   \[Done\] Configure npm workspaces monorepo
-   \[Done\] Configure React + TypeScript + Vite frontend
-   \[Done\] Configure Express + TypeScript backend
-   \[Done\] Configure strict TypeScript
-   \[Done\] Configure Oxlint
-   \[Done\] Configure root `.gitignore`
-   \[Done\] Configure environment examples
-   \[Done\] Configure Drizzle + PostgreSQL client
-   \[Done\] Verify frontend dev command
-   \[Done\] Verify API health endpoint
-   \[Done\] Verify typecheck
-   \[Done\] Verify lint
-   \[Done\] Verify build
-   \[Done\] Commit clean bootstrap
-   \[Done\] Normalize documentation structure

## Phase 2 --- Branches, users and authentication

-   \[Done\] Design `branches` table
-   \[Done\] Design `users` table
-   \[Done\] Create migrations
-   \[Done\] Apply migrations
-   \[Done\] Seed initial branches (3 branches + OWNER account)
-   \[Done\] Seed/create owner account safely (Argon2 hash, no plaintext)
-   \[Done\] Centralized error handling (`AppError`, `asyncHandler`, `errorHandler` middleware)
-   \[Done\] JWT signing and verification (`apps/api/src/modules/auth/jwt.ts`)
-   \[Done\] HTTP-only cookie login/logout (`POST /api/v1/auth/login`, `POST /api/v1/auth/logout`)
-   \[Done\] `authenticate` middleware (`apps/api/src/middleware/authenticate.ts`)
-   \[Done\] `req.user` TypeScript declaration merging (`apps/api/src/types/`)
-   \[Done\] `GET /api/v1/auth/me` protected route
-   \[Done\] `authorizeRole` middleware (`apps/api/src/middleware/authorize.ts`)
-   \[Done\] `authorizeBranchAccess` middleware
-   \[Done\] Manual testing --- all scenarios pass (valid login, wrong password, nonexistent email, invalid body, /me with/without cookie, logout)
-   \[Todo\] API hardening (Helmet, CORS, Morgan, rate limiting)
-   \[Todo\] Add auth integration tests

## Phase 3 --- Products and inventory

-   \[Todo\] Categories schema + migration
-   \[Todo\] Products schema + migration
-   \[Todo\] Category CRUD (OWNER-only write)
-   \[Todo\] Product CRUD (OWNER-only write)
-   \[Todo\] Branch inventory schema + migration
-   \[Todo\] Inventory movements schema + migration
-   \[Todo\] Stock receiving
-   \[Todo\] Stock adjustments
-   \[Todo\] Inventory transaction tests


## Phase 4 --- Sales

-   \[Todo\] Product search/cart
-   \[Todo\] Receipt number
-   \[Todo\] Sale items
-   \[Todo\] Payment methods
-   \[Todo\] Price/cost snapshots
-   \[Todo\] Transactional stock deduction
-   \[Todo\] Sale history
-   \[Todo\] Void/reversal workflow
-   \[Todo\] Sale tests

## Phase 5 --- Transfers

-   \[Todo\] Transfer request
-   \[Todo\] Approval/rejection
-   \[Todo\] Dispatch / in-transit
-   \[Todo\] Destination receipt confirmation
-   \[Todo\] Inventory movements
-   \[Todo\] Transfer tests

## Phase 6 --- Daily closing

-   \[Todo\] Receipt sequence reconciliation
-   \[Todo\] Expected payment totals
-   \[Todo\] Actual payment totals
-   \[Todo\] Variance/shortage/overage
-   \[Todo\] Closing states
-   \[Todo\] Closing tests

## Phase 7 --- Dashboard and reports

-   \[Todo\] Revenue
-   \[Todo\] Estimated profit
-   \[Todo\] Transaction count
-   \[Todo\] Average transaction value
-   \[Todo\] Best sellers
-   \[Todo\] Slow movers
-   \[Todo\] Low/out-of-stock
-   \[Todo\] Branch comparison
-   \[Todo\] Employee comparison
-   \[Todo\] Closing discrepancies

## Phase 8 --- Offline client

-   \[Todo\] Dexie/IndexedDB schema
-   \[Todo\] Local branch cache
-   \[Todo\] Offline sales
-   \[Todo\] Local inventory projection
-   \[Todo\] Network/sync status
-   \[Todo\] PWA

## Phase 9 --- Sync hardening

-   \[Todo\] Operation UUID/idempotency
-   \[Todo\] Batch sync
-   \[Todo\] Retry strategy
-   \[Todo\] Conflict rules
-   \[Todo\] Duplicate submission tests
-   \[Todo\] Closing sync confirmation

## Phase 10 --- Production hardening and pilot

-   \[Todo\] Audit log coverage
-   \[Todo\] Backup strategy
-   \[Todo\] Restore test
-   \[Todo\] Structured logging
-   \[Todo\] Security review
-   \[Todo\] Pilot one branch
-   \[Todo\] Fix workflow friction
-   \[Todo\] Roll out remaining branches

## Current next task

API hardening: Helmet, CORS, Morgan, rate limiting. Then categories + products schema and CRUD.
