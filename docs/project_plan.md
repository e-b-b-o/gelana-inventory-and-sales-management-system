# Project Plan

## 1. Overview

Gelana Inventory & Sales Management System is a web-based system for
managing inventory, sales, branch transfers, employee activity, daily
reconciliation, and owner reporting across three Gelana branches.

The system must fit the existing business workflow rather than forcing
employees to replace the official receipt machine or adopt a complicated
ERP process.

## 2. Users

### Owner

Can view and manage all branches, inventory, products, employees,
transfers, reports, stock adjustments, and audited corrections.

### Employee

Works within an assigned branch, records sales, views branch inventory
and personal sales history, requests transfers, and completes daily
closing.

## 3. MVP goals

-   Secure owner/employee access.
-   Branch-scoped authorization.
-   Product/category management.
-   Branch-level inventory.
-   Stock receiving and adjustments.
-   Immutable inventory movement ledger.
-   Sales with receipt number and payment method.
-   Historical unit price/unit cost snapshots.
-   Transfer request → approval → dispatch → receipt workflow.
-   Daily closing and receipt/payment reconciliation.
-   Owner dashboard and reporting.
-   Auditability of sensitive actions.
-   Stable online workflow before offline support.

## 4. Long-term goals

-   Offline branch operation using IndexedDB/Dexie.
-   Reliable idempotent synchronization.
-   PWA installation.
-   Better analytics and operational reporting.
-   Optional repair-management module after its workflow is properly
    specified.

## 5. Out of scope for V1

-   Payroll
-   Full accounting/general ledger
-   CRM
-   Supplier portal
-   E-commerce integration
-   AI forecasting
-   Native mobile app
-   Loyalty program
-   Employee attendance
-   Complex purchase-order suite
-   Repair-ticket management until requirements are defined

## 6. Business rules

-   The receipt machine remains the official customer receipt device.
-   A recorded sale captures its receipt number.
-   Owner can add/adjust stock.
-   Employees request transfers; they do not arbitrarily move stock.
-   Destination inventory increases only after physical receipt
    confirmation.
-   Completed sales are immutable except through audited void/reversal.
-   Every inventory change creates an inventory movement record.
-   Profit uses the sale item's captured unit cost, not today's product
    cost.
-   Backend enforces role and branch access.
-   Daily closing reconciles receipt sequence and payment totals.
-   Offline closing will later support local close → sync pending →
    centrally confirmed.

## 7. Technical architecture

``` text
React + TypeScript
        |
        v
Express REST API + TypeScript
        |
        v
Drizzle ORM
        |
        v
PostgreSQL

Later:
Branch browser -> IndexedDB/Dexie -> idempotent sync -> API
```

## 8. Repository architecture

``` text
gelana-inventory-and-sales-management-system/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── shared/
├── docs/
├── AGENTS.md
├── package.json
├── tsconfig.base.json
└── README.md
```

See `src.md` for detailed source structure.

## 9. Major feature modules

-   Authentication
-   Users/employees
-   Branches
-   Categories/products
-   Inventory
-   Sales/payments
-   Transfers
-   Daily closing
-   Reports/dashboard
-   Audit logging
-   Offline synchronization (later)

## 10. Non-functional requirements

### Correctness

Inventory and financial operations must be transactional and auditable.

### Security

Backend authorization, validated input, secret management, secure
password storage, and least privilege.

### Reliability

No partial sale/stock mutations. Offline sync must eventually be
idempotent.

### Maintainability

Strict TypeScript, modular architecture, living documentation, clear
migrations, focused tests.

### Performance

Index common filters and joins; paginate large history/report queries;
avoid unnecessary client refetching.

### Usability

Fast sale entry, clear branch context, visible stock state, clear sync
status when offline support arrives.

## 11. Success criteria

The MVP succeeds when one branch can reliably perform its real daily
workflow end-to-end, reconcile the day, and produce owner-visible
accurate inventory/sales data before rollout to all branches.

## 12. Build order

1.  Project foundation
2.  PostgreSQL + Drizzle
3.  Branches/users/auth
4.  Products/inventory
5.  Sales
6.  Transfers
7.  Daily closing
8.  Dashboard/reports
9.  Audit/security hardening
10. Offline client
11. Sync hardening
12. One-branch pilot
13. Multi-branch rollout
