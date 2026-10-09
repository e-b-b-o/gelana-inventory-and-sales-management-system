# Gelana Technical Design Analysis

## 1. Executive Summary
The Gelana Inventory & Sales Management System requires a robust, transactional, and historically immutable architecture. The current repository provides an acceptable infrastructure foundation (Express, React, Drizzle, PostgreSQL, Monorepo) but lacks the domain architecture required to implement the business rules. This analysis outlines a Modular Monolith architecture centered around an immutable Inventory Movement Ledger, Weighted Average Cost (WAC) tracking, and strict Domain-Driven boundaries to support future offline synchronization and current business requirements.

## 2. Architectural Principles
- **Business-First**: The architecture must explicitly support the finalized `project_decisions.md` (e.g., no receipt-number reconciliation, strict offline closing constraints).
- **Immutability of Financials**: Completed sales, receivings, and inventory movements are never hard-deleted. Mistakes are corrected via audited void/reversal workflows.
- **Source of Truth**: PostgreSQL is the central authority. Frontend state is transient; future offline databases are temporary caches.
- **Transactional Safety**: All multi-table mutations (e.g., Sales, Transfers, Receivings) must be wrapped in ACID database transactions.
- **Idempotency**: The system must tolerate retried requests gracefully, which is a prerequisite for future offline sync.

## 3. Current Architecture Assessment
- **Monorepo / Stack**: Vite/React, Express 5, TypeScript, Drizzle, PostgreSQL. This stack is sound and appropriate.
- **Current State**: The repository is in a scaffolded state (~5% complete).
- **Deficiencies**: 
  - Existing `products` schema violates requirements (lacks required category, price history, unit conversions).
  - Existing `users` schema lacks DB-level enforcement of roles and branch assignments.
  - Authorization middleware exists but requires architectural refinement to enforce branch scoping centrally.
  - No domain boundaries or business logic exist yet.

## 4. Target Architecture
A **Modular Monolith** organized by business domains (Features in React, Modules in Express).
- **Client**: React + Vite (Feature-Sliced Design) using TanStack Query.
- **API**: Express + Node.js using Controller-Service-Repository layers.
- **Database**: PostgreSQL accessed via Drizzle ORM.

## 5. Keep / Refactor / Replace / New
- **KEEP**: The monorepo structure, TypeScript strictness, Drizzle ORM, Express API shell, PostgreSQL.
- **REFACTOR**: The current DB schema (specifically `products` and `users`), and the authorization middleware (`authorizeBranchAccess`).
- **REPLACE**: The dummy Vite UI with the feature-sliced Gelana app shell.
- **NEW**: Inventory movement ledger, WAC calculation engine, domain-based service layers, global error handler format, database transaction boundaries, audit logger.

## 6. Domain Architecture
The backend will be structured around bounded contexts:
- **Identity**: Auth, Users, Branches.
- **Catalog**: Categories, Products, Units, Prices.
- **Inventory**: Balances, Movements, Adjustments, Stocktakes, Receivings.
- **Sales**: Sales, Items, Payments, Returns, Voids.
- **Transfers**: Transfer Requests, Dispatch, Receipt, Discrepancies.
- **Operations**: Daily Closing, Reports, Dashboard, Notifications, Audit.

*Rule: Cross-domain access must occur via Service-to-Service calls (e.g., SalesService calls InventoryService to deduct stock), not by direct cross-repository queries.*

## 7. Database Architecture
Primary Keys will be **UUIDs** (generated at the client/server) to seamlessly support future offline creation without PK collisions.
- **Constraints**: Enforce non-negative inventory via `CHECK (quantity >= 0)` (except for specific ledger rows).
- **Soft Deletes**: Use `is_active` for Master Data (Products, Users).
- **Audit**: Immutable tables for movements, sales, and an `audit_logs` table for sensitive actions.

## 8. Inventory Architecture
Inventory is the core of the system.
- **Inventory Balance**: A projection table `(branch_id, product_id, available_qty, damaged_qty, in_transit_qty)`. This provides fast reads.
- **Inventory Movement Ledger**: The absolute source of truth. Every change (Sale, Receiving, Transfer, Adjustment) inserts an immutable row here. The Balance table is merely a materialization of the Ledger.
- **Integrity**: Negative available stock must be rejected at the DB constraint level unless configured otherwise.

## 9. Weighted Average Cost
WAC is recalculated automatically upon **Receiving**.
- **Calculation**: `(Existing Qty * Current WAC) + (Received Qty * Received Unit Cost) / (Existing Qty + Received Qty)`.
- **Scope**: **Technical Decision Required** (Recommend Business-Wide WAC since prices are global, though inventory is branch-specific).
- **Consumption**: Sales, Transfers, and Adjustments consume the stock at the *current* WAC. They do not alter the WAC.
- **Opening Stock**: Recorded as a specific movement type that establishes the initial WAC.

## 10. Sales Cost Snapshot
To preserve historical profit accuracy:
- When a `SaleItem` is created, the system fetches the *Current Selling Price* and *Current WAC*.
- These values are stored directly on the `sale_items` row as `unit_price` and `unit_cost`.
- Future changes to product prices or receiving costs will **never** alter completed `sale_items`.

## 11. Product Units & Conversions
- **Entities**: Product has a `base_unit`. An optional `alternate_unit` specifies a `conversion_multiplier`.
- **Inventory**: Always tracked in `base_unit`.
- **Sales**: `sale_items` record the `selling_unit` and `multiplier_used`. The deducted inventory is `qty * multiplier_used`.

## 12. Product Price History
Prices are not mutable fields on the `products` table.
- **Model**: A `product_prices` table with `effective_date` or `is_active` flags.
- **Sales**: The API queries the currently active price. If a price is changed, the old price is deactivated and a new one is created.

## 13. Transaction IDs
Human-readable IDs (e.g., `SAL-000123`) are required.
- **Architecture**: A central PostgreSQL sequence or counter table. 
- **Offline Future-Proofing**: Since offline clients cannot safely increment a central sequence, offline sales will generate a UUID. The human-readable `SAL-XXXXX` ID will be assigned by the server *at the moment of synchronization*. The UI will show "Pending Sync" instead of a receipt number until synced.

## 14. Business Date & Time
- **Database**: All timestamps are stored as `TIMESTAMP WITH TIME ZONE` (UTC).
- **Business Date**: Derived using the business's local timezone (e.g., Africa/Addis_Ababa). Delayed/paper sales explicitly capture an `entry_date` (now) and an `actual_sale_date` (user input). Daily closings operate on the local business date.

## 15. Corrections & Historical Integrity
- **Immutability**: Completed sales cannot be `UPDATE`d or `DELETE`d.
- **Correction**: Generates a `SaleVoid` or `SaleCorrection` record.
- **Effects**: Triggers a reverse `InventoryMovement` (e.g., `SALE_VOID`) to restore stock, using the *exact cost snapshot* from the original sale to ensure profit reverses to zero correctly.

## 16. Transfer Architecture
- **State Machine**: `REQUESTED -> APPROVED -> DISPATCHED -> RECEIVED -> COMPLETED` (or `REJECTED`).
- **Inventory Effects**:
  - `DISPATCHED`: Source Branch Available Qty decreases. In-Transit Qty increases.
  - `RECEIVED`: In-Transit Qty decreases. Destination Branch Available Qty increases.
- **Discrepancies**: If Received Qty < Dispatched Qty, the difference remains in a "Discrepancy" state requiring Owner resolution (e.g., write-off to Damaged or Lost).

## 17. Daily Closing Architecture
- **Validation**: Closing is strictly **blocked** if any required pending data (e.g., un-synced offline sales) exists.
- **Reconciliation**: Reconciles expected payment totals (from DB) against actual counted totals (user input).
- **Lifecycle**: `Submitted -> Owner Approved` (or Rejected). Once Approved, the business day is locked for that branch.

## 18. Database Transactions
The following domain actions must be wrapped in `db.transaction()`:
- **Sale**: Create Sale + Sale Items + Payments + Inventory Deduction + Movement Ledger + Cost Snapshot.
- **Receiving**: Create Receiving + Receiving Items + Inventory Addition + Movement Ledger + WAC Recalculation.
- **Transfers**: State changes that move stock between branches/transit.
- **Closing**: Submitting or Approving a daily close.

## 19. Authorization Architecture
- **Role-Based (Owner vs. Employee)**: Enforced via API Middleware (`authorizeRole`).
- **Branch-Scoped**: Employee API requests implicitly use `req.user.branchId`. They must NEVER trust a `branchId` supplied in the request body/query. Owners bypass this check.
- **Field-Level**: Employee responses for Products/Sales must omit `unit_cost` and `profit` fields.

## 20. Validation Architecture
1. **API Input Validation**: Zod schemas in the controller/router level (400 Bad Request).
2. **Authorization**: Middleware checks JWT, Roles, and Branch scopes (401/403).
3. **Business Rule Validation**: Service layer checks state logic (e.g., "Cannot approve an already dispatched transfer") (400/409).
4. **Database Constraints**: PostgreSQL `CHECK` and `UNIQUE` constraints as the final safety net (500/409).

## 21. Error Handling
- **Contract**: All API errors must return `{ error: { code: string, message: string, details?: any } }`.
- **Distinction**: Distinguish between `VALIDATION_ERROR`, `AUTHORIZATION_ERROR`, `BUSINESS_RULE_VIOLATION`, and `INTERNAL_ERROR`.

## 22. Future Offline Architecture
The architecture prepares for offline by:
- Using `UUID`s for all entity Primary Keys.
- Including an `idempotency_key` on POST requests to prevent double-charging on network retries.
- Structuring the frontend to isolate API calls via TanStack Query, allowing a future `Dexie.js` interceptor to queue failed requests and serve cached reads.

## 23. Backup & Recovery
- **Architecture**: Automated nightly PostgreSQL logical backups (pg_dump) stored in cloud object storage (e.g., AWS S3). Point-In-Time-Recovery (PITR) enabled via WAL archiving if supported by the managed DB provider (e.g., Neon/Supabase).

## 24. Frontend Architecture
- **Structure**: Feature-Sliced Design (`features/auth`, `features/sales`, `features/inventory`).
- **State**: TanStack Query for server data caching. Zustand ONLY for global UI state (e.g., active cart, sidebar toggle). React Hook Form + Zod for forms.
- **Routing**: `react-router-dom` with protected layout wrappers based on user role.

## 25. Stitch Integration
- **Strategy**: Stitch designs are visual references. Do not blindly copy HTML/CSS. Extract design tokens (colors, typography, spacing) and build reusable React components (Buttons, Inputs, Tables, Modals) that match the Gelana brand aesthetic. Apply these components to the domain features.

## 26. Technical Decisions Requiring Approval
1. **WAC Scope**: Should Weighted Average Cost be calculated business-wide (Global) or per-branch? (Recommendation: Global, since selling prices are global).
2. **Offline Transaction IDs**: Confirm the strategy to assign human-readable IDs only upon server synchronization for offline-generated sales.
3. **Discount Authority**: Clarify if employees can apply pre-configured discounts, or if all discounts require an Owner override.
4. **Expected Cash Refund Rules**: Clarify if cash refunds from Returns reduce the "Expected Cash" total for that day's closing.

## 27. Recommended Implementation Architecture
**Feature-Driven Modular Monolith**
- Root: `apps/api/src/modules/<domain>/` and `apps/web/src/features/<domain>/`
- Shared Types/Zod: `packages/shared/src/schemas/`

## 28. Recommended Next Phase
**Phase 1: API Hardening, Auth, App Shell, and Users/Branches Schema.**
Focus on resolving the foundational DB schema conflicts for Users and Branches, completing the robust Authorization middleware, and standing up the frontend App Shell with secure login and routing.
