# Milestone 4 — Inventory Master Plan

## 1. Milestone Overview
Milestone 4 establishes the core inventory system for Gelana. It transitions the application from master data management to active physical tracking. The architecture is built around an immutable **Inventory Movement Ledger** acting as the single source of truth, and a fast-read **Inventory Balance** projection table.

## 2. Existing System & Dependency Analysis
We have reviewed the existing system (Milestones 1–3):
- **Auth & Identity**: Role-based access (OWNER vs EMPLOYEE) is functional. Branch scoping (`req.user.branchId`) is securely enforced.
- **Master Data**: Products, Categories, Units, Suppliers, and Payment Methods are fully implemented.
- **Database Rules**: UUID primary keys, soft-deletes via `isActive`, and `drizzle-orm` are heavily utilized. 
- **Product Units**: The `product_units` and `product_unit_conversions` tables are fully established from Milestone 3.
  - *Constraint*: Inventory is ALWAYS stored and tracked strictly in the product's **BASE** unit.
  - *Constraint*: Alternate selling units are converted dynamically on the frontend/service boundary using the established `conversionQuantity` from `product_unit_conversions`. We will never maintain separate stock buckets for alternate units.

Milestone 4 depends directly on Products, Product Units, and Branches. 
- *Crucial constraint*: Inventory is strictly **branch-specific**. 

## 3. Inventory Architecture
The inventory architecture consists of two main pillars:
1. **Inventory Movements (The Ledger)**: An immutable, append-only table recording every material change to inventory. Transactions are never hard-deleted.
2. **Inventory Balances (The Projection)**: A fast-read table maintaining the current state (Available, Damaged, In-Transit) and the **Weighted Average Cost (WAC)** per Product + Branch.

### WAC (Weighted Average Cost) Strategy
- **Scope**: Calculated independently per `productId` + `branchId`.
- **Triggers**: WAC is *only* recalculated during inbound cost-bearing events (Opening Stock, Receiving).
- **Consumption**: Sales, Adjustments, and Transfers consume stock at the *current* WAC but do not alter the WAC itself.
- **Formula**: `New WAC = ((Current Qty * Current WAC) + (New Qty * New Unit Cost)) / (Current Qty + New Qty)`
- **Precision**: Stored as `numeric(12,2)` (or higher precision internally if necessary, rounding to 2 decimals for UI).

### Inventory Constraints & Offline Resolution
The system must handle inventory constraints gracefully without contradicting offline capabilities:

**1. Normal Inventory Operations (Online)**:
- New operations (e.g., online sales, adjustments) must **not** intentionally create negative available inventory. If requested stock > available stock, the API rejects the request (`400 Bad Request`).

**2. Legitimate Offline Synchronization**:
- A previously recorded legitimate offline sale must **never** be silently deleted or cancelled merely because the central server-side inventory state now creates a conflict.
- The sync service will intentionally accept the sale, allow the server balance to go negative, record the movement, and immediately flag an anomaly/discrepancy for Owner review.
- Therefore, `recordMovement()` must accept a flag (e.g., `isOfflineSync`) that bypasses the normal > 0 constraint.

## 4. Implementation Dependency Order
While the slices are numbered 4.1 through 4.7, the technical implementation order requires a slight logical adjustment for the backend infrastructure:

**Order of Execution:**
1. **Slice 4.1 & 4.2 (Database Foundation)**: The DB schema for both `inventory_balances` and `inventory_movements` must be created simultaneously.
2. **Slice 4.1 (Current Inventory)**: Implement the GET API and the Stitch-compliant UI.
3. **Slice 4.2 (Inventory Movements)**: Implement the GET API, the immutable `InventoryService.recordMovement()` internal ledger function, and the Movement History UI.
4. **Slice 4.3 (Opening Stock)**: The first mutation. Consumes the ledger service to inject initial stock and WAC.
5. **Slice 4.4 (Stock Adjustments)**: Standard mutation for Owner corrections (explicit Delta + Reason).
6. **Slice 4.5 (Stocktake)**: A workflow wrapper that calculates variance from Physical Count and generates Stock Adjustments.
7. **Slice 4.6 (Damaged Stock)**: UI projection of the `damagedQuantity` from balances.
8. **Slice 4.7 (Stock Disposal)**: Mutation that reduces `damagedQuantity` via the ledger.

---

## 5. Data Model & Bucket Behavior

### Table: `inventory_balances`
Tracks the current state of a product in a specific branch.
- `id` (UUID, PK)
- `branchId` (UUID, FK to branches)
- `productId` (UUID, FK to products)
- `availableQuantity` (Integer, default 0, Base Unit)
- `damagedQuantity` (Integer, default 0, Base Unit)
- `inTransitQuantity` (Integer, default 0, Base Unit)
- `wac` (Numeric 12,2, default 0)

### Table: `inventory_movements`
The immutable ledger.
- `id` (UUID, PK)
- `transactionId` (Varchar, Server-generated, nullable for offline pending)
- `branchId` (UUID, FK to branches)
- `productId` (UUID, FK to products)
- `movementType` (Enum)
- `quantity` (Integer, signed delta)
- `unitCost` (Numeric 12,2)
- `referenceId` (UUID, nullable)
- `reason` (Varchar, nullable)
- `createdById` (UUID, FK to users)
- `createdAt` (Timestamp)

### Movement-to-Balance Matrix

| Movement Type | Target Bucket | Delta Sign | Changes WAC? | Implemented In |
| :--- | :--- | :--- | :--- | :--- |
| `OPENING_STOCK` | `availableQuantity` | Positive (+) | Yes | Milestone 4 |
| `ADJUSTMENT` | `availableQuantity` | Positive / Negative | No | Milestone 4 |
| `DISPOSAL` | `damagedQuantity` | Negative (-) | No | Milestone 4 |
| `RECEIVING` | `availableQuantity` | Positive (+) | Yes | Milestone 5 |
| `SALE` | `availableQuantity` | Negative (-) | No | Milestone 6 |
| `TRANSFER_OUT` | `availableQuantity` | Negative (-) | No | Milestone 8 |
| `TRANSFER_IN` | `inTransitQuantity` / `available` | - InTransit, + Available | No | Milestone 8 |
| `RETURN_GOOD` | `availableQuantity` | Positive (+) | No | Milestone 7 |
| `RETURN_DAMAGED`| `damagedQuantity` | Positive (+) | No | Milestone 7 |

*Note on Damaged Stock Lifecycle: Milestone 4 establishes the architecture for `damagedQuantity` and the ability to dispose of it. However, the mechanism that actually populates damaged stock is Sales Returns (`RETURN_DAMAGED`), which belongs entirely to Milestone 7. For testing M4, we will manually seed damaged stock or provide an isolated test endpoint.*

---

## 6. Authorization Matrix
| Operation | Owner | Employee |
| :--- | :--- | :--- |
| View Current Inventory | All branches | Assigned branch only |
| View Movements | All branches | Assigned branch only |
| Opening Stock | Yes (Online only) | No |
| Stock Adjustments | Yes (Online only) | No |
| Stocktake | Yes (Online only) | No |
| View Damaged Stock | All branches | Assigned branch only |
| Stock Disposal | Yes (Online only) | No |

---

## 7. Slice-by-Slice Plan

### Slice 4.1 — Current Inventory
**Objective**: Display the real-time stock levels of products across branches.
**Backend**: 
- Create `inventory_balances` and `inventory_movements` DB schemas.
- GET `/inventory/balances` endpoint.
**Frontend**: 
- Implement `/inventory` page based strictly on the Stitch UI reference.

### Slice 4.2 — Inventory Movements
**Objective**: Provide an audit trail of all inventory changes.
**Backend**: 
- Internal `InventoryService.recordMovement()` method.
- GET `/inventory/movements` endpoint.
**Frontend**: 
- Implement `/inventory/movements` page (Stitch derived table UI).

### Slice 4.3 — Opening Stock
**Objective**: Allow the Owner to inject initial stock and establish base WAC.
**Strict Enforcement**:
- Opening stock is a **one-time setup**. The database/service must explicitly enforce this. 
- If an `OPENING_STOCK` record already exists for a given `productId` + `branchId`, the service must reject the request with `409 Conflict`.
**Backend**: 
- POST `/inventory/opening-stock`.
**Frontend**: 
- UI for entering opening stock (hidden or disabled if already populated).

### Slice 4.4 — Stock Adjustments
**Objective**: Allow Owner to correct inventory discrepancies manually via a Delta.
**Semantics**: 
- The API accepts a `quantityDelta` (e.g., `-3` or `+5`) and a mandatory `reason`. It does NOT accept absolute counts.
**Backend**: 
- POST `/inventory/adjustments` (Requires Delta & Reason).
**Frontend**: 
- "Adjust Stock" dialog explicitly capturing the +/- Delta and Reason.

### Slice 4.5 — Stocktake
**Objective**: A structured workflow to compare system vs. physical counts.
**Semantics**: 
- The Owner provides an explicit `physicalCount` (absolute number).
- The system calculates the variance: `Variance = Physical Count - System Count`.
- The system generates standard Stock Adjustment movements for the calculated variance.
**Backend**: 
- POST `/inventory/stocktake` (array of `{ productId, physicalCount }`).
**Frontend**: 
- A dedicated `/inventory/stocktake` worksheet UI.

### Slice 4.6 — Damaged Stock
**Objective**: Visibility into non-sellable returned/damaged items.
**Lifecycle Definition**: Damaged stock enters the system via Sales Returns (Milestone 7). It sits in `damagedQuantity` until disposed (Slice 4.7).
**Frontend**: 
- View Damaged Stock filter/tab on the Current Inventory page.

### Slice 4.7 — Stock Disposal
**Objective**: Remove damaged stock permanently from the business.
**Backend**: 
- POST `/inventory/disposal` (Requires Quantity & Reason).
**Frontend**: 
- "Dispose" action button on Damaged items in UI.

---

## 8. Verification Strategy & WAC Rules

### WAC Test Scenarios
Automated tests MUST explicitly verify the following behaviors:
1. **Opening**: Insert 100 units @ 10 -> `WAC = 10`, `Available = 100`.
2. **Receiving**: (Mocked for test) Insert 100 units @ 20 -> `WAC = 15`, `Available = 200`.
3. **Sale**: (Mocked for test) Consume 20 units -> `Available = 180`, `WAC` remains 15.
4. **Adjustment**: Adjust -10 units -> `Available = 170`, `WAC` remains 15.
5. **Disposal**: Dispose 5 damaged units -> `Damaged = -5` (or 0 if started at 5), `Available` unchanged, `WAC` unchanged.

### Additional Backend Verifications
- **Atomicity**: Ensure `recordMovement()` wraps ledger insertion and balance update in a strict DB transaction. Rollbacks must be verified.
- **Branch Isolation**: Operations on Branch A must not affect WAC or Balances on Branch B.
- **Precision**: Rounding edge cases for WAC division must be safely handled at `numeric(12,2)`.

---

## 9. Complete Task Checklist

### Slice 4.1 — Current Inventory (11 Tasks)
- [x] 4.1-T01: Define `inventory_balances` and `inventory_movements` schemas and relations.
- [x] 4.1-T02: Create DB migration for new tables.
- [x] 4.1-T03: Implement GET `/inventory/balances` API endpoint (Owner/Employee scoping).
- [x] 4.1-T04: Add API route and controller with Zod validation.
- [x] 4.1-T05: Write backend authorization tests for balances endpoint.
- [x] 4.1-T06: Create frontend `useInventoryBalances` TanStack Query hook.
- [x] 4.1-T07: Implement `/inventory` Page layout (Stitch Reference).
- [x] 4.1-T08: Implement Inventory KPI Cards (Total, In Stock, Low, Out, Damaged, Valuation).
- [x] 4.1-T09: Implement Inventory Table with filtering (Category, Brand, Status).
- [x] 4.1-T10: Implement SlideOver Drawer for Product Details branch breakdown.
- [x] 4.1-T11: Verify frontend typechecks and UI responsiveness.

### Slice 4.2 — Inventory Movements (8 Tasks)
- [x] 4.2-T01: Implement `InventoryService.recordMovement()` internal ledger function (Transaction, Balance Update, WAC calc).
- [x] 4.2-T02: Implement offline-sync bypass logic in `recordMovement()` (accept negative inventory for offline anomalies).
- [x] 4.2-T03: Implement GET `/inventory/movements` API endpoint (with pagination/filters).
- [x] 4.2-T04: Write unit tests for `recordMovement` (WAC calcs, atomicity, branch isolation).
- [x] 4.2-T05: Create frontend `useInventoryMovements` hook.
- [x] 4.2-T06: Implement `/inventory/movements` Page (Audit Ledger UI).
- [x] 4.2-T07: Add filters to Movement UI (Type, Date, Product).
- [x] 4.2-T08: Manual verification of Employee restrictions.

### Slice 4.3 — Opening Stock (8 Tasks)
- [x] 4.3-T01: Implement POST `/inventory/opening-stock` API endpoint.
- [x] 4.3-T02: Add Zod validation (requires product, branch, qty, unitCost).
- [x] 4.3-T03: Implement one-time enforcement service logic (reject if OPENING_STOCK exists for branch+product).
- [x] 4.3-T04: Write API tests ensuring only Owner can execute and 409 Conflict logic works.
- [x] 4.3-T05: Create frontend `useCreateOpeningStock` mutation hook.
- [x] 4.3-T06: Implement Opening Stock Modal/Dialog UI.
- [x] 4.3-T07: Integrate Opening Stock action into Current Inventory page (Owner only).
- [x] 4.3-T08: E2E manual test: Inject stock, verify WAC updates, verify Ledger records insertion.

### Slice 4.4 — Stock Adjustments (6 Tasks)
- [x] 4.4-T01: Implement POST `/inventory/adjustments` API endpoint.
- [x] 4.4-T02: Add Zod validation (requires product, branch, explicit quantityDelta, reason).
- [x] 4.4-T03: Create frontend `useCreateAdjustment` mutation hook.
- [x] 4.4-T04: Implement Stock Adjustment Dialog UI (explicitly requesting Delta and Reason).
- [x] 4.4-T05: Add "Adjust" button to SlideOver Drawer (Owner only).
- [x] 4.4-T06: E2E manual test: Perform adjustment, verify balances update correctly without altering WAC.

### Slice 4.5 — Stocktake (6 Tasks)
- [x] 4.5-T01: Implement POST `/inventory/stocktake` API endpoint (accepts array of `{ productId, physicalCount }`).
- [x] 4.5-T02: Implement Stocktake service logic (calculates variance, calls `recordMovement` in bulk transaction).
- [x] 4.5-T03: Create frontend `useSubmitStocktake` mutation hook.
- [x] 4.5-T04: Implement `/inventory/stocktake` Worksheet Page UI (captures absolute physical counts).
- [x] 4.5-T05: Implement variance preview calculation on the frontend before submission.
- [x] 4.5-T06: E2E manual test: Submit multi-product stocktake, verify variance logic maps to adjustment ledgers.

### Slice 4.6 — Damaged Stock (3 Tasks)
- [x] 4.6-T01: Ensure Damaged Stock KPI card correctly aggregates `damagedQuantity`.
- [x] 4.6-T02: Add "Damaged" status filter to the Current Inventory table.
- [x] 4.6-T03: Manual verification of Damaged stock visibility.

### Slice 4.7 — Stock Disposal (6 Tasks)
- [x] 4.7-T01: Implement POST `/inventory/disposal` API endpoint.
- [x] 4.7-T02: Add Zod validation (quantity must not exceed available `damagedQuantity`).
- [x] 4.7-T03: Create frontend `useCreateDisposal` mutation hook.
- [x] 4.7-T04: Implement Disposal Dialog UI.
- [x] 4.7-T05: Add "Dispose" action button to Damaged items in UI.
- [x] 4.7-T06: E2E manual test: Dispose damaged stock, verify it reduces `damagedQuantity` but not `availableQuantity`.

---

*End of Plan. Total Tasks: 48. Execution should proceed sequentially from Slice 4.1. No slice is complete until every task within it is checked off.*
