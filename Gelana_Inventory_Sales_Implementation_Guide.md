# Gelana Inventory & Sales Management System

## Professional Architecture & Implementation Guide

**Implementation blueprint:** React + TypeScript + Express + PostgreSQL\
**Recommended status:** BUILDABLE V1

## Purpose

This document converts the original Gelana business specification into
an implementation-ready technical blueprint. It preserves the business
workflow while correcting architectural risks, defining the TypeScript
stack, database rules, offline model, folder structure, and build order.

## Contents

1.  Executive recommendation
2.  What stays from the original specification
3.  What must change before coding
4.  Final technology stack
5.  System architecture
6.  Monorepo and folder structure
7.  Backend module design
8.  Frontend feature design
9.  Database model
10. Inventory and sales rules
11. Offline-first and synchronization design
12. Authentication and authorization
13. Daily closing and reconciliation
14. Dashboard and reporting
15. API design
16. Development phases
17. Testing strategy
18. Deployment and operations
19. What not to build in V1
20. Start checklist

# 1. Executive recommendation

Keep the core stack. React, Express, PostgreSQL and Node.js are fully
capable of delivering this system. The important change is to use
TypeScript across both frontend and backend, organize the code by
business domain, and design inventory and offline synchronization
correctly from the beginning.

  -----------------------------------------------------------------------
  Layer                   Recommendation          Reason
  ----------------------- ----------------------- -----------------------
  Frontend                React + TypeScript +    Internal business app;
                          Vite                    no need for SSR/SEO
                                                  complexity.

  Backend                 Node.js + Express +     Simple, flexible,
                          TypeScript              sufficient for REST API
                                                  and business rules.

  Database                PostgreSQL              Strong transactions,
                                                  constraints, reporting
                                                  and relational
                                                  modeling.

  Offline client          IndexedDB + Dexie + PWA Browser-native offline
                                                  storage without running
                                                  SQLite per branch.

  Data fetching           TanStack Query          Server-state caching,
                                                  invalidation, retries
                                                  and loading/error
                                                  states.

  Validation              Zod                     Shared runtime
                                                  validation and
                                                  TypeScript-friendly
                                                  schemas.

  ORM/query layer         Drizzle (recommended)   Keeps database code
                          or Prisma               maintainable; Drizzle
                                                  stays close to SQL.
  -----------------------------------------------------------------------

# 2. What stays from the original specification

The following business decisions should remain the foundation:

-   Three-branch structure with one or more employees assigned to a
    branch.
-   Owner has visibility across all branches while employees are
    restricted to their assigned branch.
-   The existing receipt machine remains the official customer receipt
    device and is not replaced by this system.
-   Employees manually record sales, with a normal mode and a busy mode
    for later entry.
-   Only the owner can add stock, adjust stock and approve inventory
    movement between branches.
-   Employees request transfers instead of directly moving stock.
-   Daily closing is required and should reconcile sales and payment
    totals.
-   Owner dashboard includes daily/weekly/monthly sales, revenue,
    estimated profit, transaction count, best sellers, slow movers, low
    stock, out-of-stock items and branch/employee comparisons.
-   The system must continue to operate during internet outages.

**Design principle:** The software should adapt to the existing Gelana
workflow instead of forcing staff to change how they serve customers.
The technical design should improve control and traceability without
slowing down sales.

# 3. What must change before coding

## 3.1 Replace per-branch SQLite servers with browser offline storage

The original design proposed React + Express + SQLite at each branch and
a central server. For a first production version, this creates
unnecessary deployment and synchronization complexity.

Use one central Express API and PostgreSQL database, while each branch
browser keeps a local offline cache and pending-operation queue in
IndexedDB.

``` text
Branch Browser
  React + TypeScript
  IndexedDB (Dexie)
  PWA / Service Worker
  Pending Sync Queue
        |
        | internet available
        v
Central Express API
        |
        v
PostgreSQL (source of truth)
```

## 3.2 Fix the daily-closing offline contradiction

A truly offline-first system cannot prevent staff from closing the day
only because the internet is unavailable.

Use closing states:

``` text
OPEN -> LOCAL_CLOSED -> SYNC_PENDING -> CENTRALLY_CONFIRMED
```

If the branch is offline, it can complete a local closing and sync the
closing record later. The owner dashboard must clearly show whether a
closing is locally complete but not yet centrally confirmed.

## 3.3 Add receipt-number reconciliation

Because the receipt machine is not integrated, the system otherwise has
no way to detect a printed receipt that was never entered.

Every sale should capture the receipt number. Daily closing should
compare the expected receipt range with recorded receipt numbers and
flag gaps or duplicates.

``` text
First receipt: 001023
Last receipt:  001057
Expected:      35
Recorded:      34
Missing:       001041
```

## 3.4 Never hard-delete completed sales

Completed financial records should be immutable. A mistake should be
corrected using a VOID/REVERSAL workflow that stores:

-   who voided the sale
-   when it was voided
-   why it was voided
-   the inventory reversal movement

Do not use `DELETE` for completed sales.

## 3.5 Use an immutable inventory movement ledger

Current stock quantity is useful for fast reads, but every change should
also create an inventory movement record.

``` text
+100 STOCK_RECEIVED
  -2 SALE
  -5 TRANSFER_OUT
  +5 TRANSFER_IN
  -1 DAMAGE_ADJUSTMENT
  +2 COUNT_CORRECTION
```

This gives the owner an audit trail and makes discrepancies explainable.

## 3.6 Improve transfer workflow

Approval should not instantly increase destination inventory because the
goods may still be physically in transit.

``` text
REQUESTED -> APPROVED -> IN_TRANSIT -> RECEIVED
       \-> REJECTED
```

Decrease available stock at the source when dispatched. Increase
destination stock only when the receiving branch confirms physical
receipt.

## 3.7 Add payment methods and reconciliation

Support:

-   Cash
-   Telebirr
-   CBE/mobile banking
-   Bank transfer
-   Other
-   Mixed payment when needed

Daily closing should compare system-expected totals with actual
counted/verified totals and record shortages or overages.

## 3.8 Snapshot price and cost on every sale item

Do not calculate historical profit using the product's current price or
current purchase cost.

Store `unit_price` and `unit_cost` on each sale item at the moment the
sale is created. This preserves historical accuracy when prices change.

## 3.9 Add product SKU, units and branch-level low-stock thresholds

-   Every product gets a unique SKU/product code even without barcode
    scanners.
-   Store a simple selling unit such as piece, pack, box, ream or
    carton.
-   Each branch can have its own `minimum_quantity` threshold for
    low-stock alerts.

## 3.10 Add an audit log

Record security-sensitive and business-critical actions such as:

-   price changes
-   stock adjustments
-   transfer approvals
-   voids
-   login events
-   closing overrides

The audit log should be append-only for normal application users.

# 4. Final technology stack

## 4.1 Frontend

-   React + TypeScript
-   Vite
-   React Router
-   TanStack Query
-   Zustand for small global client state only
-   React Hook Form
-   Zod
-   Dexie.js over IndexedDB
-   PWA + service worker
-   Fetch or Axios for HTTP (choose one and keep a single API client
    abstraction)

## 4.2 Backend

-   Node.js + TypeScript
-   Express
-   Zod validation
-   PostgreSQL
-   Drizzle ORM recommended; Prisma acceptable if already preferred
-   PostgreSQL transactions for all multi-step inventory/financial
    operations
-   Structured logging and centralized error handling

## 4.3 Why not Next.js or NestJS for V1?

Next.js adds capabilities such as SSR and public-page rendering that
this internal application does not need.

NestJS is a strong backend framework, but changing frameworks does not
solve the hard parts of this project: inventory correctness,
transactions, authorization and offline synchronization. Express is
sufficient when structured properly.

# 5. System architecture

``` text
                    OWNER
                      |
                      v
             Central Dashboard
                      |
                      v
               Express REST API
                      |
                      v
                 PostgreSQL
                      |
          +-----------+-----------+
          |           |           |
       Branch 1    Branch 2    Branch 3
          |           |           |
      React + TS  React + TS  React + TS
      IndexedDB   IndexedDB   IndexedDB
      Sync Queue  Sync Queue  Sync Queue
```

PostgreSQL is the central source of truth. Each branch stores only the
local data required to continue operating and the unsynchronized
operations it created while offline.

The owner dashboard reads central data and displays branch
synchronization freshness so stale data is never mistaken for real-time
data.

# 6. Monorepo and folder structure

Use one repository because the web client, API and shared contracts are
one product and evolve together. They can still be deployed separately.

``` text
gelana-inventory/
|
+-- apps/
|   |
|   +-- web/                         # React + TypeScript
|   |   +-- public/
|   |   +-- src/
|   |   |   +-- app/
|   |   |   |   +-- router.tsx
|   |   |   |   +-- providers.tsx
|   |   |   +-- features/
|   |   |   |   +-- auth/
|   |   |   |   +-- dashboard/
|   |   |   |   +-- products/
|   |   |   |   +-- inventory/
|   |   |   |   +-- sales/
|   |   |   |   +-- transfers/
|   |   |   |   +-- closing/
|   |   |   |   +-- employees/
|   |   |   |   +-- branches/
|   |   |   +-- components/
|   |   |   |   +-- ui/
|   |   |   |   +-- layout/
|   |   |   +-- offline/
|   |   |   |   +-- db.ts
|   |   |   |   +-- syncQueue.ts
|   |   |   |   +-- syncEngine.ts
|   |   |   |   +-- connectionManager.ts
|   |   |   |   +-- conflictResolver.ts
|   |   |   +-- lib/
|   |   |   |   +-- api.ts
|   |   |   |   +-- queryClient.ts
|   |   |   +-- hooks/
|   |   |   +-- utils/
|   |   |   +-- main.tsx
|   |   |   +-- App.tsx
|   |   +-- package.json
|   |
|   +-- api/                         # Express + TypeScript
|       +-- src/
|       |   +-- config/
|       |   |   +-- env.ts
|       |   |   +-- database.ts
|       |   +-- modules/
|       |   |   +-- auth/
|       |   |   +-- users/
|       |   |   +-- branches/
|       |   |   +-- products/
|       |   |   +-- inventory/
|       |   |   +-- sales/
|       |   |   +-- transfers/
|       |   |   +-- closing/
|       |   |   +-- reports/
|       |   |   +-- sync/
|       |   +-- middleware/
|       |   |   +-- authenticate.ts
|       |   |   +-- authorize.ts
|       |   |   +-- validate.ts
|       |   |   +-- errorHandler.ts
|       |   +-- database/
|       |   |   +-- schema/
|       |   |   +-- migrations/
|       |   |   +-- seeds/
|       |   +-- shared/
|       |   +-- utils/
|       |   +-- app.ts
|       |   +-- server.ts
|       +-- package.json
|
+-- packages/
|   +-- shared/
|       +-- constants/
|       +-- schemas/
|       +-- types/
|       +-- utils/
|
+-- .env.example
+-- .gitignore
+-- package.json
+-- tsconfig.base.json
+-- README.md
```

**Monorepo rule:** One repository does not mean one deployment. The
React app and Express API can deploy independently. The shared package
exists to keep contracts, statuses and validation consistent.

# 7. Backend module design

Organize Express by business domain rather than giant
controller/service/route folders.

``` text
modules/
+-- sales/
|   +-- sale.routes.ts
|   +-- sale.controller.ts
|   +-- sale.service.ts
|   +-- sale.repository.ts
|   +-- sale.schema.ts
|   +-- sale.types.ts
|
+-- inventory/
|   +-- inventory.routes.ts
|   +-- inventory.controller.ts
|   +-- inventory.service.ts
|   +-- inventory.repository.ts
|   +-- inventory.schema.ts
|
+-- transfers/
    +-- transfer.routes.ts
    +-- transfer.controller.ts
    +-- transfer.service.ts
    +-- transfer.repository.ts
    +-- transfer.schema.ts
```

## 7.1 Responsibilities of each layer

  -----------------------------------------------------------------------
  Layer                               Responsibility
  ----------------------------------- -----------------------------------
  Route                               Defines URL, HTTP method and
                                      middleware only.

  Controller                          Translates HTTP request/response.
                                      No SQL and minimal business logic.

  Service                             Contains business rules, domain
                                      authorization, transactions and
                                      orchestration.

  Repository                          Contains database reads/writes
                                      only.

  Schema                              Zod request/response validation and
                                      domain input contracts.

  Types                               Module-specific TypeScript types
                                      not shared across the whole system.
  -----------------------------------------------------------------------

## 7.2 Request flow

``` text
HTTP Request -> Route -> Controller -> Service -> Repository -> PostgreSQL
```

The service layer is the center of the backend. For `createSale`, it
should verify branch access, validate inventory, reject duplicate
receipt numbers, calculate totals, open a database transaction, write
sale/items/payments, reduce inventory, create inventory movements and
then commit.

# 8. Frontend feature design

Do not organize the React app as one huge `components/pages/services`
directory. Group code by feature.

``` text
features/
+-- sales/
    +-- components/
    |   +-- ProductSearch.tsx
    |   +-- Cart.tsx
    |   +-- PaymentForm.tsx
    |   +-- SaleHistoryTable.tsx
    +-- pages/
    |   +-- NewSalePage.tsx
    |   +-- SaleHistoryPage.tsx
    +-- api/
    |   +-- salesApi.ts
    +-- hooks/
    |   +-- useCreateSale.ts
    |   +-- useSales.ts
    +-- schemas/
    +-- utils/
```

## 8.1 State management rules

-   Server state (products, inventory, sales, dashboard, transfers):
    TanStack Query.
-   Small global client state (current branch, POS cart, offline/sync
    state): Zustand only when genuinely shared.
-   Form state: React Hook Form.
-   Validation: Zod.
-   Simple local UI state such as modal/search text: `useState`.
-   Avoid creating a Context for every domain.

# 9. Database model

Recommended core PostgreSQL tables:

``` text
users
branches
categories
products
branch_inventory

sales
sale_items
sale_payments

stock_receipts
stock_receipt_items
stock_adjustments
inventory_movements

stock_transfers
stock_transfer_items

daily_closings
audit_logs
sync_devices
sync_operations
```

## 9.1 Key modeling principles

-   Use UUID primary keys for records that may be created offline.
    Generate them client-side with `crypto.randomUUID()`.
-   Inventory quantity belongs to product + branch, never to product
    alone.
-   Historical sale items store `unit_price` and `unit_cost` snapshots.
-   Use database constraints for unique SKU, unique branch receipt
    number where appropriate, valid quantities and foreign-key
    relationships.
-   Use timestamps consistently. Store UTC in the database and render
    local time in the UI.
-   Prefer soft-deactivation (`is_active`) for products/users that must
    remain referenced by historical records.

## 9.2 Example core tables

``` text
products
- id UUID PK
- sku VARCHAR UNIQUE NOT NULL
- name VARCHAR NOT NULL
- category_id UUID
- unit VARCHAR
- default_selling_price NUMERIC(12,2)
- is_active BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP

branch_inventory
- branch_id UUID
- product_id UUID
- quantity NUMERIC(12,2)
- minimum_quantity NUMERIC(12,2)
- PRIMARY KEY (branch_id, product_id)

sales
- id UUID PK
- branch_id UUID
- employee_id UUID
- receipt_number VARCHAR
- status VARCHAR
- total_amount NUMERIC(12,2)
- total_cost NUMERIC(12,2)
- total_profit NUMERIC(12,2)
- created_at TIMESTAMP
- synced_at TIMESTAMP NULL

sale_items
- id UUID PK
- sale_id UUID
- product_id UUID
- quantity NUMERIC(12,2)
- unit_price NUMERIC(12,2)
- unit_cost NUMERIC(12,2)
- discount NUMERIC(12,2)
- subtotal NUMERIC(12,2)
```

# 10. Inventory and sales rules

## 10.1 Every inventory-changing operation must be transactional

A sale is not just a row in `sales`. It affects items, payments,
inventory and the movement ledger. These changes must either all succeed
or all fail together.

``` text
BEGIN
  create sale
  insert sale items
  insert payments
  decrease branch inventory
  append inventory movements
COMMIT

If any step fails -> ROLLBACK
```

## 10.2 Never trust totals from the browser

The frontend can display calculated totals for usability, but the
backend must recalculate price totals, cost totals and profit using
server-approved product/price data and validated input.

The server owns the final financial result.

## 10.3 Inventory movement types

-   `STOCK_RECEIVED`
-   `SALE`
-   `SALE_VOID`
-   `TRANSFER_OUT`
-   `TRANSFER_IN`
-   `ADJUSTMENT_INCREASE`
-   `ADJUSTMENT_DECREASE`
-   `DAMAGE`
-   `COUNT_CORRECTION`

## 10.4 Void instead of delete

``` text
COMPLETED SALE
      |
      v
VOID REQUEST
      |
      v
store reason + actor + timestamp
      |
      v
create reverse inventory movement
      |
      v
status = VOIDED
```

# 11. Offline-first and synchronization design

Build the online workflow first, then add offline support after the core
business rules are stable. Offline behavior multiplies failure cases; it
should not be developed simultaneously with basic CRUD.

## 11.1 Local IndexedDB responsibilities

-   Products needed by the assigned branch
-   Branch inventory snapshot
-   Current employee/session data required for operation
-   Locally created unsynchronized sales
-   Relevant transfer information
-   Pending daily closing
-   Sync operation queue

## 11.2 Do not download the whole company to every branch

An employee at Branch 2 should not receive Branch 1 and Branch 3
financial details simply because offline mode exists.

The server should send only data required for the user and assigned
branch.

## 11.3 Offline sale flow

``` text
Employee creates sale
        |
        v
Generate UUID in browser
        |
        v
Save sale + items locally
        |
        v
Update local branch inventory
        |
        v
Add CREATE_SALE to sync queue
        |
        v
UI shows PENDING_SYNC
```

When online:

``` text
Sync queue -> Express API -> PostgreSQL -> ACK -> mark SYNCED
```

## 11.4 Idempotency is mandatory

A branch may send the same offline operation more than once if the
network fails after the server saved it but before the client received
the response.

The server must recognize the operation UUID/idempotency key and return
the existing successful result instead of creating a duplicate sale.

## 11.5 Conflict strategy for V1

Keep V1 conflict rules simple and explicit.

Sales created offline are append-only operations. Product/price/employee
master-data edits should remain owner-controlled and generally occur
online.

If an offline sale references a product that has since been deactivated
or repriced, keep the sale snapshot and flag the operation for review
only when server invariants are violated.

## 11.6 Sync user experience

``` text
ONLINE - ALL SYNCED
OFFLINE - 17 PENDING
SYNCING - 8 / 17
SYNC ERROR - ACTION REQUIRED
```

Use automatic background synchronization for safe queued operations when
connectivity returns, plus a visible **Sync Now** control and a final
sync verification at closing.

Do not make employees manually approve every normal synchronization.

# 12. Authentication and authorization

Start with two roles: `OWNER` and `EMPLOYEE`.

Permissions must be enforced on the backend, not merely by hiding
buttons in React.

  Capability                OWNER          EMPLOYEE
  ------------------------- -------------- ----------------------
  View all branches         Yes            No
  Record sale               Yes            Yes, assigned branch
  Add stock                 Yes            No
  Adjust inventory          Yes            No
  Request transfer          Yes            Yes
  Approve/reject transfer   Yes            No
  Manage products           Yes            No
  Manage users/branches     Yes            No
  Void completed sale       Yes, audited   No by default
  View own sales history    Yes            Yes

In addition to role authorization, always enforce branch ownership on
the backend. Changing a URL or request body must never allow an employee
to access another branch.

# 13. Daily closing and reconciliation

Daily closing should become an accountability workflow rather than a
simple "close" button.

1.  Verify receipt-number sequence and flag missing/duplicate receipts.
2.  Verify all known sales have been entered.
3.  Calculate expected cash and electronic-payment totals from
    `sale_payments`.
4.  Employee enters actual counted cash and verified payment totals.
5.  Record variance (shortage/overage) with optional/required reason
    according to threshold.
6.  Record pending transfer issues if relevant.
7.  Save local closing even while offline.
8.  Sync later and mark centrally confirmed.

``` text
OPEN
  -> LOCAL_CLOSED
      -> SYNC_PENDING
          -> CENTRALLY_CONFIRMED
```

# 14. Dashboard and reporting

The owner dashboard should query PostgreSQL, not the branch IndexedDB.
It should always display data freshness by branch.

-   Daily / weekly / monthly revenue
-   Estimated profit from sale-item cost snapshots
-   Transaction count
-   Average transaction value
-   Best-selling products
-   Slow-moving products
-   Low-stock and out-of-stock products
-   Sales by branch
-   Sales by employee
-   Inventory levels by branch
-   Closing discrepancies
-   Pending/in-transit transfers
-   Last synchronization time for each branch

**Important:** If Branch 3 last synchronized three hours ago, the
dashboard should say so. Never present stale central data as if it were
real-time.

# 15. API design

Use a versioned REST API. Keep endpoints resource-oriented and let
services enforce business rules.

``` text
/api/v1/auth
/api/v1/users
/api/v1/branches
/api/v1/products
/api/v1/inventory
/api/v1/sales
/api/v1/transfers
/api/v1/closings
/api/v1/reports
/api/v1/sync
```

## 15.1 Example actions

-   `POST /sales` - create completed sale
-   `POST /sales/:id/void` - void/reverse sale
-   `POST /inventory/receipts` - receive stock
-   `POST /inventory/adjustments` - owner adjustment
-   `POST /transfers` - create transfer request
-   `POST /transfers/:id/approve` - owner approval
-   `POST /transfers/:id/dispatch` - mark goods in transit
-   `POST /transfers/:id/receive` - destination confirms receipt
-   `POST /closings` - create local/central closing record
-   `POST /sync/batch` - submit queued offline operations
-   `GET /reports/dashboard` - owner summary

# 16. Development phases

**Phase 1 - Foundation:** Monorepo, TypeScript configuration, React
shell, Express API, environment validation, PostgreSQL connection,
migrations, users, branches, login and backend authorization.

**Phase 2 - Products & Inventory:** Categories, products, SKUs, branch
inventory, stock receiving, adjustments and immutable movement ledger.

**Phase 3 - Sales:** POS/search/cart, receipt numbers, sale items,
payment methods, PostgreSQL transaction logic, stock deduction and sale
history.

**Phase 4 - Transfers:** Request, approval/rejection,
dispatch/in-transit and receipt confirmation.

**Phase 5 - Daily Closing:** Receipt reconciliation, payment
reconciliation, discrepancy tracking and closing state machine.

**Phase 6 - Dashboard & Reports:** Revenue, profit, transactions,
branch/employee comparisons, stock warnings and sync freshness.

**Phase 7 - Offline Client:** Dexie/IndexedDB schema, local cache,
offline sales, local inventory updates, PWA and network status.

**Phase 8 - Sync Hardening:** UUIDs, idempotency, batching, retry
policy, conflict handling, sync status and audit events.

**Phase 9 - Security & Reliability:** Audit logs, sale voids, permission
review, validation hardening, backups and structured logging.

**Phase 10 - Production Pilot:** Deploy, test in one branch, observe
real employee usage, fix workflow friction, then expand to remaining
branches.

> **Build-order rule:** Do not begin with offline synchronization. First
> make React -\> Express -\> PostgreSQL correct and reliable. Then add
> IndexedDB and synchronization on top of stable business logic.

# 17. Testing strategy

## 17.1 Backend tests that matter most

-   Sale transaction rolls back if any item fails.
-   Cannot sell more stock than allowed by the business rule.
-   Duplicate receipt number is rejected according to branch/day rule.
-   Employee cannot access or mutate another branch.
-   Transfer does not increase destination stock before receipt
    confirmation.
-   Voiding a sale creates the exact reverse movement once.
-   Same sync operation sent twice does not create duplicates.
-   Closing totals and discrepancies are calculated correctly.

## 17.2 Frontend tests

-   Critical form validation
-   POS/cart calculations
-   Permission-driven navigation
-   Offline/online status transitions
-   Sync queue behavior
-   Closing reconciliation UI

## 17.3 Real-world pilot tests

-   Disconnect internet mid-sale.
-   Refresh browser while offline.
-   Reconnect after many queued sales.
-   Simulate duplicate sync submission.
-   Use busy-mode delayed entry and reconcile receipts.
-   Create transfer, dispatch it, then delay physical receipt.
-   Change price after an old sale and confirm historical profit stays
    unchanged.

# 18. Deployment and operations

Keep deployment simple but production-safe. A monorepo can still have
independent build/deploy pipelines.

``` text
Web (React/Vite) -> Vercel / Cloudflare Pages / static hosting
API (Express)    -> Render / Railway / VPS / container host
Database         -> Managed PostgreSQL (Neon/Supabase/RDS/etc.)
Backups          -> Automated scheduled PostgreSQL backups
```

-   Use HTTPS only.
-   Store secrets only in environment variables.
-   Use separate development/staging/production databases when possible.
-   Enable automated backups before real sales data is entered.
-   Add centralized error logging before multi-branch rollout.
-   Keep database migrations in source control.
-   Test restore procedure, not only backup creation.

# 19. What not to build in V1

Avoid turning the first version into a complete ERP. Keep these out
unless the business proves an immediate need:

-   Payroll
-   Accounting/general ledger
-   CRM
-   Supplier portal
-   Automatic supplier integration
-   E-commerce integration
-   Barcode scanner integration
-   AI forecasting
-   Complex purchase-order system
-   Repair-ticket management
-   Customer loyalty
-   Employee attendance
-   Native mobile application

Laptop repair management can be a future module. It is mentioned in the
business background, but the current workflow is focused on inventory
and sales, so combining repair operations now would increase scope
without a defined process.

# 20. Start checklist

-   [ ] Create the monorepo with `apps/web`, `apps/api` and
    `packages/shared`.
-   [ ] Enable strict TypeScript settings and shared base `tsconfig`.
-   [ ] Set up Vite React TypeScript frontend.
-   [ ] Set up Express TypeScript backend.
-   [ ] Add environment validation and PostgreSQL connection.
-   [ ] Choose Drizzle or Prisma and create migration workflow.
-   [ ] Define roles, statuses, payment methods and shared Zod schemas.
-   [ ] Implement branches/users/authentication before business modules.
-   [ ] Implement products and `branch_inventory`.
-   [ ] Implement `inventory_movements` before sales.
-   [ ] Implement sale creation as one PostgreSQL transaction.
-   [ ] Add `receipt_number` and sale-item unit price/cost snapshots.
-   [ ] Implement transfer lifecycle through `RECEIVED`.
-   [ ] Implement daily closing and reconciliation.
-   [ ] Implement dashboard from central PostgreSQL.
-   [ ] Only then add IndexedDB/Dexie and PWA offline behavior.
-   [ ] Add idempotent sync with UUID operations.
-   [ ] Pilot in one branch before rolling out to every branch.

# Final recommendation

Recommended production direction:

**React + TypeScript + Vite** on the frontend, **Express + TypeScript**
on the backend, **PostgreSQL** as the central database,
**IndexedDB/Dexie** for branch offline storage, and a **monorepo
organized by business feature/module**.

The success of Gelana will depend less on switching frameworks and more
on enforcing four things correctly:

1.  Database transactions
2.  Inventory auditability
3.  Branch authorization
4.  Idempotent offline synchronization

If those are designed well, the chosen stack is more than capable of
supporting the business.

------------------------------------------------------------------------

*Source basis: Original Gelana Inventory & Sales Management System
project specification, combined with the technical architecture
recommendations documented during review.*
