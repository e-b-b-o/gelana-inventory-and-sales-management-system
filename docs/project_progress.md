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
-   \[Done\] Seed initial branches
-   \[Done\] Seed/create owner account safely
-   \[Done\] Centralized error handling architecture
-   \[In Progress\] Implement authentication
-   \[Todo\] Implement role authorization
-   \[Todo\] Implement branch-scoped authorization
-   \[Todo\] Add auth tests

## Phase 3 --- Products and inventory

-   \[Todo\] Categories
-   \[Todo\] Products and SKU
-   \[Todo\] Branch inventory
-   \[Todo\] Low-stock threshold
-   \[Todo\] Stock receipt
-   \[Todo\] Stock adjustment
-   \[Todo\] Inventory movement ledger
-   \[Todo\] Transaction tests

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

Implement JWT authentication, HTTP-only cookies, and authorization middleware.
