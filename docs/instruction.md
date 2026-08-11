# Project Instructions

## Project identity

**Name:** `gelana-inventory-and-sales-management-system`

A multi-branch inventory and sales management system for Gelana
Stationery and Laptop Repair.

## Agent workflow

Every coding session must start by reading: `AGENTS.md`, this file,
`project_plan.md`, `project_progress.md`, `project_decisions.md`, and
`src.md`.

The project documentation is authoritative project memory. Keep it
current.

## Approved stack

### Frontend

-   React
-   TypeScript
-   Vite
-   React Router
-   TanStack Query
-   Zustand only for genuinely shared client state
-   React Hook Form
-   Zod
-   Oxlint

### Backend

-   Node.js
-   Express
-   TypeScript
-   Zod
-   PostgreSQL
-   Drizzle ORM
-   `pg`
-   `tsx` in development

### Later offline layer

-   IndexedDB
-   Dexie.js
-   PWA/service worker
-   idempotent sync queue

Do **not** introduce the offline layer until the online React → Express
→ PostgreSQL system is reliable.

## Architecture rules

-   npm workspaces monorepo.
-   Feature-oriented React structure.
-   Domain/module-oriented Express structure.
-   HTTP flow: route → controller → service → repository → PostgreSQL.
-   Business logic belongs in services, not controllers.
-   Database access belongs in repositories.
-   Shared cross-app contracts belong in `packages/shared` only when
    truly shared.
-   Avoid premature abstractions.

## TypeScript rules

-   Keep `strict: true`.
-   Avoid `any`; use `unknown` plus narrowing when necessary.
-   Prefer explicit domain types at important boundaries.
-   Do not duplicate types that can safely be inferred from Zod/Drizzle.
-   Do not silence compiler errors instead of fixing them.

## API rules

-   Version routes under `/api/v1`.
-   Validate request params/body/query at the API boundary.
-   Return consistent error shapes.
-   Do not leak stack traces or database internals to clients.
-   Authentication and branch authorization are backend
    responsibilities.

## Database rules

-   PostgreSQL is the central source of truth.
-   Drizzle is the typed data-access layer, not the database.
-   Use UUIDs for records that may eventually originate offline.
-   Use database constraints, foreign keys, and indexes intentionally.
-   Inventory belongs to product + branch.
-   Every stock mutation must create an immutable inventory movement.
-   Multi-step inventory/financial operations must use transactions.
-   Sale items snapshot unit price and unit cost.
-   Completed sales are voided/reversed, never hard-deleted.

## Frontend rules

-   TanStack Query: server state.
-   Zustand: small shared client state only.
-   React Hook Form + Zod: forms.
-   `useState`: local UI state.
-   Avoid Context-per-feature architecture.
-   Keep feature-specific code inside the feature directory.
-   Shared UI components must be genuinely reusable.

## Security

-   Never commit `.env` files.
-   Never expose secrets to Vite/client code.
-   Hash passwords with a proven password-hashing library when
    authentication is implemented.
-   Apply least privilege.
-   Treat all client input as untrusted.
-   Log security-sensitive business actions in the audit log when that
    phase is implemented.

## Change discipline

Before adding a dependency: 1. Check whether an existing dependency
solves the problem. 2. Explain why the dependency is needed. 3. Prefer
stable, focused libraries. 4. Avoid overlapping libraries that solve the
same job.

Before changing architecture: 1. Stop. 2. Document the proposed decision
and tradeoffs. 3. Ask for approval. 4. Record the approved result in
`project_decisions.md`.

## Git discipline

-   Small, focused commits.
-   Conventional-style messages are preferred: `feat:`, `fix:`,
    `chore:`, `docs:`, `refactor:`, `test:`.
-   Do not commit broken builds intentionally.
-   Do not commit generated secrets, local databases, `node_modules`, or
    build artifacts.
