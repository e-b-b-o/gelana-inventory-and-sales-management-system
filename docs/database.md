# Database Design

**Database:** PostgreSQL\
**Data-access layer:** Drizzle ORM

This document is the intended model. Actual schema changes must be made
through migrations and this file must stay synchronized with
implementation.

## Principles

-   PostgreSQL is the central source of truth.
-   UUID primary keys for records that may later be created offline.
-   Use foreign keys and constraints.
-   Inventory is scoped by branch + product.
-   Historical sale items snapshot price and cost.
-   Inventory mutations append to `inventory_movements`.
-   Multi-step stock/financial writes use transactions.
-   Avoid hard-deleting historical business records.
-   Store timestamps consistently; use UTC in persistence.

## Planned tables

### Identity / organization

-   `branches`
    -   `id`: uuid (PK)
    -   `name`: varchar
    -   `code`: varchar (unique)
    -   `is_active`: boolean
    -   `created_at`, `updated_at`: timestamp with timezone
-   `users`
    -   `id`: uuid (PK)
    -   `name`: varchar
    -   `email`: varchar (unique)
    -   `password_hash`: varchar
    -   `role`: varchar (enum: OWNER, EMPLOYEE)
    -   `branch_id`: uuid (FK to branches, nullable for OWNER)
    -   `is_active`: boolean
    -   `created_at`, `updated_at`: timestamp with timezone

### Catalog

-   `categories`
-   `products`
-   `branch_inventory`

### Sales

-   `sales`
-   `sale_items`
-   `sale_payments`

### Inventory

-   `stock_receipts`
-   `stock_receipt_items`
-   `stock_adjustments`
-   `inventory_movements`

### Transfers

-   `stock_transfers`
-   `stock_transfer_items`

### Operations

-   `daily_closings`
-   `audit_logs`

### Offline/sync --- later

-   `sync_devices`
-   `sync_operations`

## Important constraints

-   Product SKU unique.
-   Branch inventory unique on `(branch_id, product_id)`.
-   Positive/non-negative quantity checks where business rules require
    them.
-   Valid status/payment/movement values.
-   Receipt uniqueness should be enforced according to the final
    receipt-number business rule, likely branch-scoped.
-   Referential integrity for all business relationships.

## Indexing targets

Add indexes based on real query patterns, especially: - sales by
branch + created_at - sales by employee + created_at - inventory by
branch - movement history by product/branch/time - transfers by
source/destination/status - closings by branch/date - audit logs by
actor/time

Do not create speculative indexes without query justification.

## Transaction boundaries

A completed sale transaction should atomically: 1. create sale; 2.
create sale items; 3. create payments; 4. update branch inventory; 5.
append inventory movements.

Transfer dispatch/receipt and sale void/reversal must also be atomic.
