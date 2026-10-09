# Gelana Technical Design

## 1. Purpose
This document defines how the Gelana Inventory & Sales Management System should technically work. It translates the finalized business requirements from `project_decisions.md` into an authoritative technical architecture.

## 2. Technical Design Principles
- **Business-First**: The architecture strictly serves the business rules.
- **Immutability of Financials**: Completed sales and inventory movements are never hard-deleted. Mistakes are corrected via audited void/reversal workflows.
- **Source of Truth**: The central PostgreSQL database is the ultimate authority.
- **Transactional Safety**: All multi-step mutations must be wrapped in ACID transactions.
- **Idempotency**: The system must tolerate retried requests gracefully, enabling future offline sync.

## 3. Target Architecture
A **Modular Monolith** organized by business domains.
- **Client**: React + TypeScript + Vite.
- **API**: Node.js + Express + TypeScript.
- **Database**: PostgreSQL accessed via Drizzle ORM.

## 4. Architecture: Keep / Refactor / Replace / New
- **KEEP**: The monorepo structure, TypeScript strictness, Drizzle ORM, Express API shell, PostgreSQL.
- **REFACTOR**: The current DB schema (specifically `products` and `users`), and the authorization middleware.
- **REPLACE**: The dummy Vite UI with a feature-sliced React architecture.
- **NEW**: Inventory movement ledger, WAC engine, domain service layers, transaction boundaries, audit logs.

## 5. Monorepo Structure
- Frontend domains: `apps/web/src/features/<domain>`
- Backend domains: `apps/api/src/modules/<domain>`
- Shared contracts: `packages/shared/src/schemas`

## 6. Backend Domain Architecture
Organized by bounded contexts (Auth, Identity, Catalog, Inventory, Sales, Transfers, Operations). Service layers are responsible for business logic.

## 7. Frontend Architecture
Feature-sliced design. TanStack Query for server state caching. Zustand for minimal global UI state.

## 8. Authentication & Authorization
- **Authentication**: JWT stored in HTTP-only cookies.
- **Authorization**: Role-based (Owner/Employee) and Branch-scoped. Branch scope is securely derived from the authenticated context (`req.user.branchId`), not from client payloads.

## 9. Database Architecture
Primary Keys are UUIDs to support offline generation without collisions. Soft Deletes (`is_active` flag) are used for Master Data instead of hard deletions.

### 9.1 Indexing Targets
Add indexes based on real query patterns, especially:
- sales by branch + created_at
- sales by employee + created_at
- inventory by branch
- movement history by product/branch/time
- transfers by source/destination/status
- closings by branch/date
- audit logs by actor/time
Do not create speculative indexes without query justification.

## 10. Master Data
### 10.1 Branches
Location and operational details.
### 10.2 Users
Strict DB constraints to ensure valid roles.
### 10.3 Branch Assignments
Employees are strictly assigned to a branch ID at the DB level.
### 10.4 Categories
Required for all products.
### 10.5 Products
### 10.6 Product Units
Base unit, optional alternate unit, and fixed conversion multipliers.
### 10.7 Product Prices
Prices are versioned/history-preserving. Selling price is global across branches.
### 10.8 Suppliers
### 10.9 Payment Methods
Configurable by the Owner.

## 11. Inventory Architecture
### 11.1 Inventory Balance
A fast-read projection table tracking Available, Damaged, and In-Transit quantities per Branch and Product.
### 11.2 Inventory Movement Ledger
The absolute source of truth. Every material inventory change inserts an immutable row here.
### 11.3 Inventory Cost Records
Tracks historical cost basis.
### 11.4 Opening Stock
Establishes initial inventory and base WAC.
### 11.5 Stock Adjustments
### 11.6 Stocktakes
### 11.7 Damaged Stock
### 11.8 Stock Disposal

## 12. Weighted Average Cost
Calculated **independently per Product + Branch**. WAC changes only on Receiving or Opening Stock. Sales and Transfers consume stock at the current WAC but do not alter it.

## 13. Receiving
Multi-item receiving. Captures purchase cost per event and recalculates WAC for the receiving branch.

## 14. Sales
### 14.1 Sale
### 14.2 Sale Items
### 14.3 Price Snapshot
Completed sales preserve the actual selling price used. Future catalog price changes do not rewrite history.
### 14.4 Cost Snapshot
Stores the branch WAC used at sale time to freeze gross profit natively.
### 14.5 Payments
### 14.6 Split Payments
### 14.7 Discounts
Owner-controlled only. Employees cannot invent arbitrary discounts or override product pricing.

## 15. Returns
Sales returns restore inventory. Cash refunds reduce the "Expected Cash" total for the **current business date** on which the refund is processed.

## 16. Corrections & Voids
Creates a separate reversal record. The original transaction remains intact for auditability.

## 17. Transfers
Lifecycle: `Requested → Approved → Dispatched → Received → Completed`. Dispatched decreases source stock and increases in-transit stock. Received decreases in-transit stock and increases destination stock.

## 18. Daily Closing
Blocked if pending offline data exists. Reconciles payment method totals. Requires Owner approval to lock the business day.

## 19. Reports
Driven by the immutable cost snapshots and ledgers.

## 20. Notifications
System alerts for low stock, pending transfers, and rejected closings.

## 21. Audit Log
Immutable table tracking sensitive business actions.

## 22. Transaction IDs
**UUIDs** are the permanent technical identities. **Human-readable IDs** (`SAL-000123`) are assigned strictly by the central server (upon synchronization for offline events).

## 23. Business Date & Time
Stored as UTC timestamps. Business date is derived using the local business timezone. Delayed/paper sales preserve their actual occurrence date alongside the entry date.

## 24. Database Transaction Boundaries
Operations that must succeed or fail together inside `db.transaction()`:
- Sales, Receivings, Returns, Transfers, Adjustments, Closings.

## 25. Validation
Flow: API Input Validation (Zod) → Authorization → Business Logic Validation (Service) → DB Constraints.

## 26. Error Handling
Standardized JSON format: `{ error: { code, message, details } }`.

## 27. Future Offline Architecture
React app → Local storage cache (IndexedDB) → Pending Sync Queue → Central Server. Source of truth is always PostgreSQL.

## 28. Backup & Recovery
Automated daily PostgreSQL logical backups.

## 29. Data Integrity & Historical Preservation
Achieved via append-only ledgers and preventing `UPDATE` statements on completed financial records.

## 30. API Architecture
Versioned REST API, resource-oriented and domain-structured.

## 31. Frontend Data Flow
TanStack Query manages data fetching, caching, and background sync.

## 32. UI / Stitch Integration
Stitch designs act as visual references, translated into reusable React components progressively.

## 33. Security Principles
Backend zero-trust. All access logic is evaluated on the server based on signed tokens.

## 34. Technical Decisions That Remain Open
- **Backup Provider**: Exact infrastructure for automated backups (e.g., AWS S3, Neon native).
- **Image Storage**: Provider/strategy for optional product images.

## 35. Architecture Summary
A strict, modular monolith that guarantees financial immutability and precise inventory tracking through a ledger-first design.
