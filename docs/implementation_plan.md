# Gelana Implementation Plan

## 1. Development Strategy
The project is built using incremental end-to-end vertical slices.
**One feature → frontend + backend + database + authorization + tests + UI verification → complete → next feature.**

## 2. Vertical Slice Workflow
1. Business Requirements -> 2. Technical Design -> 3. Stitch UI Reference -> 4. Vertical Slice Plan -> 5. Frontend -> 6. Backend/API -> 7. Database -> 8. Authorization -> 9. Tests -> 10. UI Verification -> 11. Documentation / Progress -> 12. Feature Complete.

## 3. Milestone 1 — Foundation & Authentication

### Slice 1.1 — Login (Completed)
### Slice 1.2 — Session / Logout (Completed)
### Slice 1.3 — Protected Application Shell (Completed)

## 4. Milestone 2 — Identity & Branches

### Slice 2.1 — Employees
### Slice 2.2 — Branches
### Slice 2.3 — Branch Assignment

## 5. Milestone 3 — Catalog & Master Data

### Slice 3.1 — Categories
### Slice 3.2 — Products
### Slice 3.3 — Product Units
### Slice 3.4 — Product Prices
### Slice 3.5 — Suppliers
### Slice 3.6 — Payment Methods

## 6. Milestone 4 — Inventory

### Slice 4.1 — Current Inventory
### Slice 4.2 — Inventory Movements
### Slice 4.3 — Opening Stock
### Slice 4.4 — Stock Adjustments
### Slice 4.5 — Stocktake
### Slice 4.6 — Damaged Stock
### Slice 4.7 — Stock Disposal

## 7. Milestone 5 — Receiving

### Slice 5.1 — Receiving
### Slice 5.2 — Receiving History
### Slice 5.3 — Receiving Details

## 8. Milestone 6 — Sales

### Slice 6.1 — New Sale (Completed)
### Slice 6.2 — Sales History (Completed)
### Slice 6.3 — Sale Details (Completed)
### Slice 6.4 — Sales Payments (Completed)
### Slice 6.5 — Discounts (Completed)


## 9. Milestone 7 — Returns & Corrections

### Slice 7.1 — Sales Returns (Completed)
### Slice 7.2 — Return Details (Completed)
### Slice 7.3 — Corrections / Voids (Completed)


## 10. Milestone 8 — Transfers

### Slice 8.1 — Transfer Request (Completed)
### Slice 8.2 — Transfer Details (Completed)
### Slice 8.3 — Approval / Rejection (Completed)
### Slice 8.4 — Dispatch (Completed)
### Slice 8.5 — Receive (Completed)
### Slice 8.6 — Discrepancy (Completed)

## 11. Milestone 9 — Daily Closing

### Slice 9.1 — Current Closing (Completed)
### Slice 9.2 — Closing Submission (Completed)
### Slice 9.3 — Owner Review (Completed)
### Slice 9.4 — Closing History (Completed)

## 12. Milestone 10 — Dashboard & Reports

### Slice 10.1 — Owner Dashboard
### Slice 10.2 — Employee Dashboard
### Slice 10.3 — Sales Reports
### Slice 10.4 — Inventory Reports
### Slice 10.5 — Profit Reports
### Slice 10.6 — Closing Reports

## 13. Milestone 11 — Notifications & Audit (Completed)

### Slice 11.1 — Notifications (Completed)
### Slice 11.2 — Audit Log (Completed)
### Slice 11.3 — Settings & Account Management (Completed)

## 14. Milestone 12 — Offline Mode (**Skipped — Out of Scope by Project Decision**)

Gelana has deliberately adopted an **online-only architecture** to minimize operational risk and maintenance complexity. Offline operation, local storage sync queues, offline conflict resolution, and background sync engines are intentionally skipped and will not be implemented. Milestone 12 is permanently skipped by architectural decision and does not block Milestone 13 or Milestone 14.

## 15. Milestone 13 — Full Verification (Completed)

### Verification Scope:
- **Authentication & Authorization**: Session/cookie authentication, role permissions (Owner vs Employee), backend zero-trust boundary, branch isolation.
- **Master Data & Inventory**: Product/unit/category management, branch balances, receiving, immutable inventory movement ledger, authoritative WAC calculations, stock availability, prevention of negative inventory.
- **Sales & Returns**: Sales checkout, stock reduction, payment allocations, sellable/damaged return routing, refund reconciliation, owner-only voids/corrections with audit records.
- **Stock Transfers**: Complete lifecycle (`REQUESTED` → `APPROVED`/`REJECTED` → `DISPATCHED` → `RECEIVED` → `COMPLETED`), in-transit inventory, discrepancy handling with mandatory reasons.
- **Daily Closing**: Authoritative expected cash calculation, cash discrepancy enforcement, owner approval/rejection workflows, closing history with branch scoping.
- **Dashboards & Reports**: Owner vs Employee dashboards, branch isolation, sales/inventory/profit/closing reports, strict exclusion of cost/WAC/gross profit data from employee payloads.
- **Cross-Module Integration**: End-to-end data consistency across all business contexts.
- **Automated Quality Checks**: Monorepo test suites passing (44 test files, 307/307 tests passing), TypeScript strict typecheck passing (0 errors), Oxlint passing (0 errors), and production build passing.

## 16. Milestone 14 — Production Hardening (Next Active Milestone)

