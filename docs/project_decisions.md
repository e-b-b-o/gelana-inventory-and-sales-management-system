# Project Decisions

Record significant product/architecture decisions here. Do not rewrite
old decisions; append a new dated decision if something changes.

## 2026-08 --- React + Express + PostgreSQL retained

**Decision:** Keep React for the frontend, Express for the API, and
PostgreSQL as the central database.

**Reason:** The hard problems are business correctness, inventory
transactions, authorization and synchronization---not framework
capability.

**Alternatives considered:** Next.js, NestJS.

**Consequence:** Architecture quality must come from modular design
rather than framework conventions.

------------------------------------------------------------------------

## 2026-08 --- TypeScript on frontend and backend

**Decision:** Use TypeScript from day one for both React and Express.

**Reason:** Shared contracts, domain entities, API boundaries and future
offline synchronization benefit from static typing.

**Consequence:** Strict TypeScript remains enabled; compiler errors
should be fixed rather than suppressed.

------------------------------------------------------------------------

## 2026-08 --- Drizzle ORM with PostgreSQL

**Decision:** Use Drizzle as the typed database/query layer over
PostgreSQL.

**Reason:** It remains close to SQL while providing TypeScript
integration and is suitable for transaction/report-heavy business logic.

**Alternative considered:** Prisma, raw `pg`.

**Consequence:** PostgreSQL remains the actual database and source of
truth.

------------------------------------------------------------------------

## 2026-08 --- npm workspaces monorepo

**Decision:** Keep web, API and shared contracts in one repository.

**Workspace names:** -
`@gelana-inventory-and-sales-management-system/web` -
`@gelana-inventory-and-sales-management-system/api` -
`@gelana-inventory-and-sales-management-system/shared`

**Reason:** They form one product and evolve together while still
allowing separate deployment.

------------------------------------------------------------------------

## 2026-08 --- Feature/domain-oriented folders

**Decision:** React is organized by features and Express by domain
modules.

**Reason:** Related code stays together and avoids giant global
`controllers`, `services`, `pages`, or `components` folders.

------------------------------------------------------------------------

## 2026-08 --- Browser offline storage instead of per-branch SQLite servers

**Decision:** Future offline operation will use IndexedDB + Dexie in
branch browsers.

**Reason:** Avoid operating a separate Express + SQLite deployment at
every branch.

**Consequence:** Offline functionality is postponed until the online
system is stable.

------------------------------------------------------------------------

## 2026-08 --- Inventory movement ledger

**Decision:** Every stock-changing event creates an immutable movement
record.

**Reason:** Current quantity alone cannot explain discrepancies or
provide a reliable audit trail.

------------------------------------------------------------------------

## 2026-08 --- Void/reversal instead of hard-delete

**Decision:** Completed sales are never hard-deleted.

**Reason:** Financial and stock history must remain auditable.

------------------------------------------------------------------------

## 2026-08 --- Transfer requires receipt confirmation

**Decision:** Transfer lifecycle is
`REQUESTED -> APPROVED -> IN_TRANSIT -> RECEIVED` (or `REJECTED`).

**Reason:** Destination inventory must not increase before goods
physically arrive.

------------------------------------------------------------------------

## 2026-08 --- Oxlint

**Decision:** Use Oxlint for project linting.

**Reason:** It is the selected Vite linter and avoids maintaining a
second overlapping linter initially.
