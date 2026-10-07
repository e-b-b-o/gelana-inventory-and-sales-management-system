# Gelana Inventory & Sales Management System

## Final Business Workflow Decisions — Questions 1–60

**Purpose:**
This document contains the business workflow decisions finalized during requirements analysis for the Gelana Inventory & Sales Management System.

**IMPORTANT:**
These are finalized business decisions. Do not reinterpret, remove, simplify, or replace them with assumptions. Technical implementation details may be designed later, but the business behavior described here must be preserved.

---

# 1. Business Context

Gelana is a medium-scale physical stationery business with **3 branches**.

Current branch structure:

* Main Branch:

  * Owner/Manager
  * 1 sales employee
* Branch 2:

  * 1 sales employee
* Branch 3:

  * 1 sales employee

The owner normally works from the main branch and is also involved in laptop repair/business management.

The business is not assumed to be highly technology-adopting, so the system should be practical and simple enough for employees to use during real shop operations.

The system is primarily an:

* Inventory management system
* Internal sales recording system
* Branch management system
* Stock transfer system
* Daily closing/reconciliation system
* Reporting/monitoring system

It is **NOT** intended to replace the existing physical receipt/cash machine.

---

# QUESTIONS 1–60 AND FINAL DECISIONS

## 1. Who can receive/add new stock?

### Decision

Only the **Owner** can add/receive stock.

Employees cannot independently add stock to inventory.

---

## 2. Can one receiving transaction contain multiple products?

### Decision

Yes.

One receiving transaction can contain multiple different products.

Example:

* 20 notebooks
* 1 laptop charger
* 5 calculators
* 10 A4 paper packs

These can all belong to one receiving transaction if they came from the same supplier.

---

## 3. Should the supplier/vendor be recorded when receiving stock?

### Decision

Yes.

Every receiving transaction records its supplier/vendor.

---

## 4. Should purchase cost be recorded?

### Decision

Yes.

The purchase cost must be recorded when stock is received.

---

## 5. Should purchase cost be preserved separately for each receiving event/batch?

### Decision

Yes.

The system must preserve the purchase cost associated with each receiving event/batch.

Do not simply overwrite the old purchase cost when new stock is purchased.

---

## 6. Should receiving history be permanently retained?

### Decision

Yes.

Every receiving transaction must remain permanently available in inventory/history/audit records.

Inventory should never change without a traceable movement record.

---

## 7. Does the existing physical receipt/cash process get replaced?

### Decision

No.

The existing physical/manual receipt and cash process remains separate.

Gelana records the internal sale and inventory movement. It does not replace or integrate the existing receipt machine in Version 1.

---

## 8. What is the normal sales workflow?

### Decision

Normal workflow:

1. Customer is served.
2. Existing physical receipt/cash process is performed.
3. Employee records the sale in Gelana.
4. Gelana updates inventory automatically.

---

## 9. What happens when employees are too busy to enter sales immediately?

### Decision

Employees can temporarily write sales on paper and enter them later when the shop is less busy.

However:

**Every sale must be entered into Gelana before daily closing.**

---

## 10. When should inventory decrease for a sale?

### Decision

When the sale is recorded/confirmed in Gelana, the branch's inventory decreases automatically by the sold quantity.

---

## 11. Can employees freely change selling prices?

### Decision

No.

The configured product selling price is used.

Employees cannot freely change selling prices.

Only the Owner can authorize discounts or change the standard selling price.

---

## 12. Can completed sales be freely edited or deleted?

### Decision

No.

Completed sales cannot be freely edited or deleted.

If a mistake occurs, the system must use a controlled correction/void/return workflow.

The original sale remains preserved.

---

## 13. Can employees correct simple data-entry mistakes before daily closing?

### Decision

Yes.

Employees can correct straightforward data-entry mistakes before daily closing.

However, the history of the correction must still be preserved.

The system should record:

* Original creator
* Person making correction
* Date/time
* What was changed
* Correction details/reason where required

---

## 14. What happens when a completed sale needs correction?

### Decision

The original transaction must remain intact.

A correction/void creates a separate record/audit trail and records the reason and resulting inventory effect.

Do not overwrite the original transaction.

---

## 15. Should payment method be recorded for every sale?

### Decision

Yes.

Payment method information must be recorded.

---

## 16. Who controls the available payment methods?

### Decision

Only the **Owner** controls available payment methods.

The Owner can:

* Add payment methods
* Edit payment methods
* Activate/deactivate payment methods

Examples may include:

* Cash
* Telebirr
* CBE
* Other banks

The list is configurable and must not be hard-coded to only a few methods.

Employees cannot create a new payment method during a sale.

---

## 17. Should every sale receive an internal system number?

### Decision

Yes.

Every Gelana sale receives a unique system-generated internal sale number.

This is separate from the physical receipt number.

---

# STOCK TRANSFERS

## 18. Are stock requests and stock transfers separate workflows?

### Decision

No.

They are one workflow.

An employee needs stock → creates a transfer request → Owner approves/rejects → physical stock moves → destination receives it.

---

## 19. Who can request stock transfers?

### Decision

Employees can request stock transfers.

---

## 20. Who can approve/reject transfers?

### Decision

Only the Owner can approve or reject transfers.

---

## 21. Does creating or approving a transfer request immediately change inventory?

### Decision

No.

Creating a request does not change inventory.

Approval also does not immediately change inventory.

Inventory changes according to the physical movement:

* Source dispatch → source stock decreases
* In transit → stock is represented as in transit
* Destination receipt → destination stock increases

---

## 22. What is the transfer lifecycle?

### Decision

Normal lifecycle:

**Requested → Approved → Dispatched/Transferred → Received → Completed**

Rejected lifecycle:

**Requested → Rejected**

Rejected requests remain permanently in history.

---

## 23. Is approval the same as physical receipt?

### Decision

No.

Approval only authorizes the transfer.

Physical dispatch and physical receipt are separate stages.

---

## 24. Can destination quantity differ from sent/expected quantity?

### Decision

Yes.

The system preserves:

* Expected/sent quantity
* Actual received quantity

The destination employee records the actual received quantity.

If there is a difference, the system creates a transfer discrepancy for Owner review.

---

## 25. Can rejected transfers be deleted?

### Decision

No.

Rejected requests remain permanently in transfer history, including:

* Status
* Rejection reason
* Who rejected
* Date/time

No inventory change occurs from a rejected request.

---

## 26. Can the Owner approve a partial transfer?

### Decision

Yes.

The Owner can approve less than the requested quantity.

---

## 27. Can one transfer request use multiple source branches?

### Decision

Yes.

One transfer request can be fulfilled using stock from multiple source branches when needed.

---

## 28. Can the Owner cancel an approved transfer?

### Decision

Yes, but only **before physical dispatch**.

After physical dispatch, it must follow the actual transfer/receipt process rather than being treated as a simple cancellation.

---

## 29. Can the Owner create a transfer directly?

### Decision

Yes.

The Owner can initiate a transfer without an employee request.

---

## 30. Can transfers happen between any branches?

### Decision

Yes.

Transfers are not restricted to Main Branch → Branch 2/3.

Any branch can be the source or destination.

---

# DAILY CLOSING

## 31. Can daily closing happen if there are unentered sales?

### Decision

No.

Daily closing must be blocked if required/unentered sales remain.

All sales must be entered before closing.

---

## 32. Does daily closing include cash reconciliation?

### Decision

Yes.

Employee physically counts cash.

System calculates expected cash from recorded cash sales and compares it with actual counted cash.

Difference is displayed.

---

## 33. Does the employee need to explain a cash discrepancy?

### Decision

Yes.

A cash discrepancy requires an explanation/reason.

---

## 34. Can payment methods be reconciled separately?

### Decision

Yes.

Closing can show/reconcile totals by payment method.

---

## 35. Must offline pending data synchronize before closing?

### Decision

Yes.

Required pending offline data must synchronize before closing.

If required pending synchronization remains, closing is blocked.

---

## 36. Who submits and who finally approves closing?

### Decision

Employee performs and submits the branch closing.

However, the closing is **not finally closed until the Owner reviews the money and approves it**.

---

## 37. What information does the employee see before submitting closing?

### Decision

The closing summary must show:

* Total sales
* Transaction count/summary as appropriate
* Payment method totals
* Expected cash
* Actual counted cash
* Discrepancy

The employee reviews this before submission.

---

## 38. Can the Owner approve a closing with a discrepancy?

### Decision

Yes.

The Owner can approve a submitted closing even if there is a discrepancy after reviewing it.

---

## 39. Can the Owner reject a closing?

### Decision

Yes.

The Owner can reject a submitted closing and send it back to the employee for correction.

The Owner must provide a reason.

---

## 40. Can an approved closing be edited normally?

### Decision

No.

Once Owner-approved, the closing becomes locked.

Later changes require an Owner-authorized correction process.

The original closing remains preserved.

---

## 41. What date defines a business day?

### Decision

The business day follows the local calendar date.

---

## 42. What happens if yesterday's closing wasn't completed?

### Decision

The next day's sales are still allowed.

The system reminds the employee and Owner that the previous day is overdue/unclosed.

---

## 43. Is closing branch-specific?

### Decision

Yes.

Each branch has an independent daily closing.

The Owner can later see combined business-wide reports.

---

# STOCK ADJUSTMENTS AND STOCKTAKE

## 44. Can the Owner adjust stock when physical stock differs from system stock?

### Decision

Yes.

The Owner can make stock adjustments.

---

## 45. Is an adjustment reason required?

### Decision

Yes.

Every stock adjustment requires a reason.

---

## 46. Can employees adjust stock?

### Decision

No.

Employees cannot manually adjust inventory.

---

# PAYMENT & SPLIT PAYMENT WORKFLOW

## 47. Can a sale use multiple payment methods?

### Decision

Yes.

Split payments are supported.

Employees can add multiple payment methods and amounts until the sale total is completely covered.

However, employees can only select payment methods configured by the Owner.

Example:

Sale total = 500 birr

* Cash = 200
* Telebirr = 300

Total = 500.

---

## 48. Can an employee complete a sale with an incorrect payment total?

### Decision

No.

The system must prevent:

* Underpayment
* Overpayment

It must show the:

* Remaining amount, or
* Excess amount

and block completion until the payment total is valid.

---

## 49. Can payment methods be changed before sale confirmation?

### Decision

Yes.

Before confirmation, the employee can:

* Add payment methods
* Change amounts
* Remove payment methods

After confirmation, payment information follows the established correction/return workflow and cannot be freely edited.

---

# PRODUCT & PRICE MANAGEMENT

## 50. Are prices global across branches?

### Decision

Yes.

All three branches use one standard/global selling price per product.

There are no branch-specific prices in Version 1.

---

## 51. What happens when a product price changes?

### Decision

A new price applies only to future sales.

Historical sales preserve the actual selling price used at the time.

Changing the current product price must never rewrite historical transactions.

---

## 52. Can the Owner create/edit product information?

### Decision

Yes.

Owner can create and edit product information.

Employees cannot manage the product catalog.

---

## 53. Can historical transactions be changed when product information changes?

### Decision

No.

Editing product information must not rewrite historical sales, receiving, transfers, etc.

---

## 54. Should products be deleted?

### Decision

No normal deletion.

Products use:

**Active / Inactive**

Deactivation is preferred over deletion.

Inactive products remain in the database and historical records.

They cannot be used for normal new sales/receiving.

---

## 55. Must a product exist before receiving stock?

### Decision

Yes.

Workflow:

**Owner creates product → product exists → Owner receives stock**

Product creation and stock receiving are separate operations.

---

## 56. Who generates SKUs?

### Decision

The system automatically generates unique SKUs.

The Owner does not manually invent SKU codes.

SKU remains available for internal identification/search.

Duplicate SKU creation must be blocked.

---

## 57. Must every product have a category?

### Decision

Yes.

Every product must belong to a category.

---

## 58. Are description, brand, and image required?

### Decision

They are optional.

Product supports:

* Optional description
* Optional brand
* Optional image

---

## 59. How are product units handled?

### Decision

Use:

**Base unit + optional alternate selling unit with fixed conversion quantity.**

Inventory is maintained in the base unit.

Example:

Blue Pen:

* Base unit = piece
* Alternate unit = pack
* 1 pack = 10 pieces

An employee can sell either:

* 1 piece
* 1 pack

The system converts the sale into the base inventory quantity.

Conversions are simple and fixed.

---

## 60. What product search/filtering is required?

### Decision

Product search supports:

* Product name
* SKU

Filtering supports:

* Category
* Brand

Barcode scanning is **not included in the initial system**.

---

# ADDITIONAL FINALIZED BUSINESS DECISIONS

The following decisions were also finalized during the requirements process and are part of the same approved workflow specification.

---

# Inventory Rules

## Inventory is branch-specific

Each branch maintains its own available quantity.

Example:

* Branch 1: 100 notebooks
* Branch 2: 25 notebooks
* Branch 3: 40 notebooks

A sale at Branch 1 decreases Branch 1 stock only.

A sale at Branch 2 decreases Branch 2 stock only.

Branches do not share one physical stock quantity.

---

## Negative inventory is strictly prohibited

The system must never allow a normal sale or inventory movement to reduce available inventory below zero.

If available stock is 0:

* Product remains visible
* Shows **Out of Stock / 0**
* Employee cannot sell it
* Employee cannot manipulate inventory
* Employee can notify the Owner

---

# Product Units

Employees can sell using either:

* Base unit
* Configured alternate unit

The system converts the quantity into the base inventory unit.

Unit conversions are versioned/preserved so changing a conversion later does not rewrite historical transactions.

Different selling units can have different configured selling prices.

---

# Minimum Stock

Owner sets minimum stock levels.

Minimum-stock levels are **branch-specific**.

Example:

Notebook minimum stock:

* Branch 1 = 20
* Branch 2 = 10
* Branch 3 = 15

Low-stock alerts are generated based on these thresholds.

---

# Inventory History

Owner can view complete inventory movement history including:

* Product
* Branch
* Quantity change
* Movement type
* Date/time
* Responsible user
* Related transaction

Employees can view limited inventory history for their assigned branch.

Employees must not see sensitive information such as purchase cost or management-sensitive data.

Owner can filter history by:

* Branch
* Product
* Movement type
* Date range
* User

---

# Sales History & Reports

Employees can view their own sales history.

Employees cannot view other employees' sales history.

Owner sales reports can be filtered by:

* Date range
* Branch
* Employee
* Product
* Payment method
* Total sales

Owner can export reports.

Sales reports include:

* Total sales
* Transaction count
* Sales by branch
* Sales by employee
* Sales by product
* Sales by payment method
* Date range

Owner can also see:

* Best-selling products
* Sales trends by day
* Sales trends by week
* Sales trends by month
* Custom date-range trends

---

# Inventory Reports

Version 1 inventory reporting includes:

1. Current Stock
2. Low/Out-of-Stock
3. Stock Movement
4. Inventory Valuation
5. Stocktake/Discrepancy
6. Damaged Stock
7. Purchase/Receiving

Owner can see total current stock value based on recorded purchase costs.

---

# Inventory Costing

Use:

**Weighted Average Cost**

The completed sale must preserve:

* Its cost basis
* Calculated gross margin/profit

Later purchases or cost changes must not rewrite historical sale profit.

Sales returns reverse the relevant financial/profit effect.

Inventory effect depends on whether the returned item is:

* Sellable
* Damaged

---

# Stocktake

Owner has a Stocktake feature.

It compares:

**System quantity vs Physical counted quantity**

and shows differences.

Stocktake can help create the corresponding stock adjustments.

Every resulting adjustment still requires:

* Reason
* Owner
* Date/time
* Permanent history

Stocktake is approximately once every 2 months OR whenever the Owner needs it.

It is not a mandatory fixed schedule.

---

# Damaged Stock & Disposal

Returned products have a condition:

* Good/Sellable
* Damaged/Not Sellable

Sellable returned products go back to available inventory.

Damaged returned products do not go back into normal sellable stock.

Damaged stock is tracked separately.

Owner has a Stock Disposal/Write-off action.

Disposal requires:

* Quantity
* Reason

Disposal decreases damaged stock and creates a permanent inventory/audit record.

---

# Sales Returns

Customer sales returns are supported.

Employees can record returns.

Owner reviews/tracks returns.

Returns should normally be linked to the original system sale.

If no original sale exists:

* Return can still be recorded
* Owner authorization is required

Partial returns are supported.

Returned quantity cannot exceed the quantity originally sold minus quantities already returned.

Returns record:

* Related sale
* Returned product
* Quantity
* Refund amount
* Refund payment method
* Return condition
* Processor
* Date/time

Refund payment method is required and must use an Owner-configured payment method.

---

# Discounts

Discounts are supported.

Every discount is recorded for Owner visibility.

Only Owner can apply/authorize discounts.

Only Owner can change the standard product selling price.

---

# Employees

Only Owner can:

* Create employee accounts
* Manage employee accounts
* Change employee assigned branch
* Deactivate employees
* Reset employee passwords

Employees are not deleted when they leave; they are deactivated so historical records remain intact.

Owner can view employee sales history and filter it by:

* Date
* Branch

Roles remain simple in Version 1:

* Owner
* Employee

Employees are normally restricted to their assigned branch.

Owner has access across all branches.

Employee branch changes are recorded as formal branch assignment/transfer history.

---

# Branches

Owner can:

* Create branches
* Edit branches
* Deactivate branches

Branches are not deleted.

Branch information includes:

* Name
* Code
* Address/location
* Phone number
* Active/inactive status

All branch management actions are Owner-only.

Owner can switch/work across all branches.

---

# Owner Dashboard

Owner has an overall business dashboard.

Owner can also view branch-specific dashboards.

Dashboard should prioritize information requiring attention instead of becoming one giant report page.

Important dashboard information includes:

* Today's sales
* Branch sales
* Pending/overdue closings
* Low-stock products
* Out-of-stock products
* Transfer activity
* Returns/corrections
* Inventory value
* Estimated profit
* Important notifications

---

# Employee Dashboard

Employee dashboard is different and restricted to the employee's role and branch.

It can include:

* Employee's own sales
* Assigned branch stock
* Low-stock/out-of-stock products
* Transfer requests
* Closing status
* Offline/synchronization status
* Relevant notifications

Employees do not see:

* Purchase costs
* Profit/margin
* Other employees' private sales information
* Unrelated branches' inventory

---

# Notifications

Owner should receive notifications for **important and critical business events**, not every individual sale.

Examples:

* Transfer requests
* Low stock
* Out of stock
* Closing awaiting approval
* Significant discrepancies
* Important corrections
* Important returns
* Critical inventory/business events

Normal individual sales belong in dashboards/reports, not notifications.

Notification priority levels:

* Informational
* Important
* Critical

Important notifications remain in the notification center until opened/acknowledged.

Employees receive only important/critical notifications relevant to their role/branch.

Owner/relevant users can access notification history.

Notification history is separate from the audit log.

---

# Audit Log

Important actions record:

* Who performed the action
* Date/time
* Action/details

Owner can access the audit/history log.

Audit records are:

* Permanent
* Non-deletable

Corrections create new records rather than destroying the original record.

---

# Offline Mode

Employees can perform normal sales fully offline when the internet temporarily disappears.

Offline sales can:

* Use locally available product data
* Record sales
* Update local branch stock
* Continue normal work

Offline mode is intended for temporary outages lasting hours, not prolonged routine offline operation.

Data synchronizes with the central system when connectivity returns.

Employees can also create transfer requests offline.

If internet is unavailable, the request can be communicated manually by phone/etc. so business can act, while the official request is still recorded in Gelana and synchronized later.

---

# Owner-Critical Actions

The following Owner-critical actions are online-only in Version 1:

* Receiving stock
* Stock adjustments
* Stocktake adjustments
* Approving/rejecting transfers
* Product changes
* Price changes
* Employee management
* Branch management

Employees can work offline for:

* Sales
* Transfer requests

---

# Synchronization

If an offline sale fails to synchronize:

**NEVER silently lose it.**

It remains safely stored locally as pending/failed and is retried until synchronization succeeds.

Offline transactions use unique transaction IDs/idempotency protection so repeated synchronization attempts cannot create duplicate transactions.

The system should show synchronization status simply.

Possible statuses:

* Online / All synced
* Offline / Pending changes
* Sync Pending / Internet available
* Syncing / X remaining
* Sync Failed / Pending retry

When internet returns, the system can show:

**"Internet connection detected. Would you like to synchronize now?"**

Options:

* Sync Now
* Sync Later

Sync Later allows the employee to continue working.

However, required pending data must be synchronized before daily closing.

---

# Offline Stock Conflict Principle

Branches have separate inventory, so normal simultaneous sales between branches are not conflicts.

Example:

* Branch 1 has 100
* Branch 2 has 25

Branch 1 sells from Branch 1's stock.

Branch 2 sells from Branch 2's stock.

These are independent.

The relevant conflict is an offline synchronization conflict involving the same branch's inventory or transactions.

If synchronization creates an inventory inconsistency:

**Never silently delete or cancel a legitimate recorded sale.**

Preserve the sale and create an inventory discrepancy for Owner review/resolution.

---

# Offline Transfer Requests

An offline transfer request synchronizes as a request.

It does not reserve or reduce stock while offline.

If another action later affects the available stock, the Owner decides whether the request can still be fulfilled.

---

# Opening Stock

Version 1 includes a one-time Opening Stock process.

When the system goes live, the Owner enters the actual physical starting stock for each branch.

Opening stock must be clearly identified as initial/opening stock.

After go-live, normal inventory changes use:

* Receiving
* Sales
* Transfers
* Returns
* Adjustments

---

# Opening Stock Cost

For opening stock, the Owner can enter the best known or estimated purchase cost when the original purchase information is unavailable.

This must be clearly identified as:

**Opening Stock Cost**

The system must not falsely represent an estimated opening cost as a normal historical receiving transaction.

---

# Suppliers

Supplier management is included.

Owner can:

* Create suppliers
* Edit suppliers
* Deactivate suppliers

Supplier information:

* Name — required
* Phone — optional
* Address/location — optional
* Contact person — optional
* Notes — optional
* Active/inactive status

Inactive suppliers remain connected to historical receiving records.

Historical receiving records must still show the supplier even after deactivation.

Receiving can optionally record:

* Supplier invoice/reference number

This is optional because not every purchase necessarily has a useful/formal reference.

Each receiving transaction uses one supplier.

If products came from different suppliers, create separate receiving transactions.

---

# Owner Receiving Branch

Owner can receive stock directly into any branch.

Receiving is not restricted to Main Branch.

---

# Bulk Import

Owner can bulk-import multiple products.

Owner can also bulk-enter opening stock for multiple:

* Products
* Branches

Imported/opening data must be validated before becoming official.

Invalid or incomplete records must be clearly identified and corrected.

They must never be silently accepted as valid data.

For a bulk import with some invalid records:

**Valid records may be imported while invalid records are separately reported**, provided the system clearly identifies the failed records for correction/re-import.

---

# Transaction Records

Major business transactions should receive human-readable unique identifiers.

Examples:

* `SAL-000123` — Sale
* `REC-000045` — Receiving
* `TRF-000018` — Transfer
* `RET-000007` — Return
* `ADJ-000012` — Adjustment
* `CLS-000031` — Closing

Exact numbering implementation can be designed later.

The identifiers must be unique and useful for searching/auditing.

---

# Permanent Business History

Business transaction records must not be permanently deleted.

This includes:

* Sales
* Returns
* Receiving
* Transfers
* Stock adjustments
* Closing records
* Audit records

When something needs correction, create a new corrective record and preserve the original.

---

# Owner Override Principle

The Owner may perform exceptional overrides only where the established business workflow already permits Owner intervention.

There must NOT be a generic "bypass everything" mechanism that destroys system controls.

Where an Owner authorization/override is allowed:

* Require a reason when appropriate
* Record who performed it
* Record date/time
* Preserve the original record
* Preserve the resulting change in audit/history

---

# FINAL BUSINESS PRINCIPLES

The system must follow these principles throughout implementation:

1. **Inventory must always be traceable.**
2. **Historical transactions must never be silently rewritten.**
3. **Negative inventory is prohibited.**
4. **Employees cannot perform Owner-only inventory-management actions.**
5. **Each branch has its own physical inventory.**
6. **The product catalog is shared globally across all branches.**
7. **Selling price is global across branches.**
8. **Historical sale prices remain unchanged after future price changes.**
9. **Purchase costs must be preserved for costing/history.**
10. **Weighted Average Cost is the selected costing method.**
11. **Every important inventory/business action must have an audit trail.**
12. **Offline transactions must never be silently lost.**
13. **Duplicate synchronization must not create duplicate transactions.**
14. **The physical receipt/cash process remains separate from Gelana.**
15. **Every sale must be entered before daily closing.**
16. **Owner approval is required for final daily closing.**
17. **Important/critical business events generate notifications.**
18. **Employees only access information relevant to their assigned branch/role.**
19. **Owner has business-wide access.**
20. **Deactivation is preferred over deletion for master data.**
21. **Transaction history is permanent.**
22. **Owner-critical actions are online-only in Version 1.**
23. **The system should remain practical and simple for real shop employees.**
24. **Do not introduce features that were not decided as part of the business requirements.**

---

# CURRENT REQUIREMENTS STATUS

## Step 1 — Business Workflows

**COMPLETE.**

These decisions should now be treated as the approved business workflow foundation for the next requirements stages.

## Next planned stages

1. Finalize business workflows — **DONE**
2. Finalize business rules — **NEXT**
3. Create complete entity/data model
4. Determine modules
5. Determine exact pages/screens
6. Determine navigation and permissions
7. Design UI in Stitch
8. Create finalized implementation specification for Anti-gravity

**Important:** Do not skip directly into major implementation based on assumptions. The remaining requirements/design stages should be completed first so the implementation is based on finalized business rules and data structures.





Bussiness Rules 




# Gelana Inventory & Sales Management System

## Step 2 — Business Rules Specification (Professional Draft)

**Status:** Draft for Owner/Business Review

**Purpose:**
This document converts the finalized Step 1 business workflows into explicit rules that the software must enforce.

These rules are derived from the approved business workflows and professional inventory-system practices.

**Review principle:**
The rules in this document are proposed for review. Any rule that introduces a new business policy rather than simply enforcing an already-decided workflow should be treated as a recommendation until approved.

---

# 1. General System Rules

## BR-001 — Single Business

Gelana is one business operating multiple physical branches.

The system must maintain one central business record while maintaining branch-specific inventory and operational records.

---

## BR-002 — Three Branches

The initial deployment supports the three existing branches.

The architecture must allow additional branches to be created later by the Owner.

---

## BR-003 — Central Source of Truth

The central PostgreSQL database is the authoritative source of truth for synchronized business data.

Offline local data is temporary operational data and must eventually synchronize with the central system.

---

## BR-004 — Branch-Specific Inventory

Inventory quantity belongs to a specific branch.

The same product can have different quantities at different branches.

Example:

* Branch 1 = 100
* Branch 2 = 25
* Branch 3 = 40

A sale at Branch 1 affects Branch 1 inventory only.

---

## BR-005 — Global Product Catalog

Products belong to one global catalog shared by all branches.

A product is not separately created for each branch.

---

## BR-006 — Global Standard Selling Price

A product has one standard selling price across branches.

Branch-specific selling prices are not supported in Version 1.

---

## BR-007 — Owner Authority

The Owner is the highest business authority in the system.

Owner permissions must not be restricted by ordinary employee branch permissions.

---

## BR-008 — Employee Branch Restriction

An Employee normally operates only within their assigned branch.

Their normal operational access must be limited to that branch.

---

## BR-009 — Owner Cross-Branch Access

The Owner can view and manage information across all branches.

The Owner can switch between branches when performing branch-specific operations.

---

# 2. User & Authentication Rules

## BR-010 — Roles

Version 1 has only two roles:

* Owner
* Employee

Do not introduce unnecessary additional roles unless a future business requirement requires them.

---

## BR-011 — Employee Account Creation

Only the Owner can create employee accounts.

---

## BR-012 — Employee Deactivation

Employees must be deactivated rather than deleted.

Historical transactions created by the employee must remain connected to that employee.

---

## BR-013 — Employee Branch Assignment

Each Employee has an assigned branch.

Changing the assigned branch does not rewrite historical records.

The employee's previous branch assignments must remain historically traceable.

---

## BR-014 — Password Reset

Only the Owner can reset an employee's password through the management workflow.

---

## BR-015 — Inactive Users

Inactive employees cannot log into the system or perform new business operations.

Their historical records remain available to authorized users.

---

# 3. Product Rules

## BR-016 — Product Creation

Only the Owner can create products.

---

## BR-017 — Product Category

Every product must belong to a category.

A product cannot become active for normal use without a valid category.

---

## BR-018 — SKU Uniqueness

Every product must have a unique system-generated SKU.

The Owner does not manually create the SKU.

Duplicate SKUs are prohibited.

---

## BR-019 — Product Name

A product must have a meaningful product name.

---

## BR-020 — Product Active Status

Products have:

* Active
* Inactive

No Discontinued status is required in Version 1.

---

## BR-021 — Inactive Product

An inactive product:

* Remains in the database
* Remains visible in historical transactions
* Cannot normally be sold
* Cannot normally be received as new stock

---

## BR-022 — Historical Product Integrity

Changing product information must not modify historical transaction snapshots.

Historical sales must retain the information relevant at the time of the transaction.

---

## BR-023 — Product Description

Description is optional.

---

## BR-024 — Product Brand

Brand is optional.

---

## BR-025 — Product Image

Product image is optional.

---

# 4. Product Unit Rules

## BR-026 — Base Unit

Every product must have one base inventory unit.

Inventory quantities are stored in the base unit.

---

## BR-027 — Alternate Unit

A product may optionally have an alternate selling unit.

Example:

* Base unit = piece
* Alternate unit = pack
* 1 pack = 10 pieces

---

## BR-028 — Fixed Conversion

Alternate-unit conversion must use a fixed quantity.

Example:

1 pack = 10 pieces.

---

## BR-029 — Base Conversion

The base unit always has a conversion quantity of 1.

---

## BR-030 — Inventory Storage Unit

Inventory quantity is maintained in base units regardless of which selling unit the employee uses.

---

## BR-031 — Sales Unit Conversion

If an employee sells an alternate unit, the system converts it into the corresponding base quantity before applying the inventory movement.

Example:

2 packs × 10 pieces = 20 pieces deducted.

---

## BR-032 — Unit Price Independence

Base and alternate selling units may have different configured selling prices.

Example:

* Piece = 10 birr
* Pack = 90 birr

---

## BR-033 — Unit Conversion History

Unit conversion information used by a historical transaction must be preserved.

Changing a future conversion must not rewrite previous transactions.

---

# 5. Product Price Rules

## BR-034 — Owner Price Authority

Only the Owner can change the standard product selling price.

---

## BR-035 — Global Price Change

A price change applies globally to all branches for future sales.

---

## BR-036 — Historical Sale Price

A completed sale permanently preserves the actual selling price used at the time of sale.

Changing the product's current price must never rewrite that sale.

---

## BR-037 — Future Price Rule

A new product price applies only to transactions created after the price becomes effective.

---

## BR-038 — Employee Price Restriction

Employees cannot freely override the configured selling price.

---

# 6. Category Rules

## BR-039 — Category Ownership

Only the Owner can manage product categories.

---

## BR-040 — Category History

A category should not be permanently deleted if products or historical transactions depend on it.

Deactivation should preserve historical relationships.

---

# 7. Inventory Receiving Rules

## BR-041 — Owner-Only Receiving

Only the Owner can create official stock-receiving transactions.

---

## BR-042 — Receiving Destination

The Owner can receive stock directly into any branch.

---

## BR-043 — Receiving Supplier

Every receiving transaction must identify one supplier.

---

## BR-044 — One Supplier Per Receiving

One receiving transaction cannot contain products from multiple suppliers.

If products come from different suppliers, separate receiving transactions must be created.

---

## BR-045 — Receiving Multiple Products

A single receiving transaction may contain multiple products from the same supplier.

---

## BR-046 — Purchase Cost

Each received product quantity must have a recorded purchase cost.

---

## BR-047 — Receiving Cost History

Purchase cost associated with each receiving event must be preserved permanently.

Later purchases must not overwrite earlier receiving costs.

---

## BR-048 — Receiving Inventory Effect

When receiving is confirmed:

**Branch stock increases by the received quantity.**

The movement must create an inventory history record.

---

## BR-049 — Receiving Finalization

A receiving transaction must be reviewed/confirmed before it becomes an official inventory movement.

---

## BR-050 — Receiving History

Receiving records are permanent business records.

They cannot be silently deleted.

---

## BR-051 — Receiving Reference

Supplier invoice/reference number is optional.

---

# 8. Supplier Rules

## BR-052 — Supplier Name

Supplier name is required.

---

## BR-053 — Supplier Contact Information

Supplier may contain:

* Phone
* Address/location
* Contact person
* Notes

These fields are optional.

---

## BR-054 — Supplier Status

Supplier supports:

* Active
* Inactive

---

## BR-055 — Inactive Supplier

Inactive suppliers cannot normally be selected for new receiving transactions.

They remain visible in historical records.

---

## BR-056 — Supplier History

Deactivating a supplier must never disconnect it from previous receiving transactions.

---

# 9. Opening Stock Rules

## BR-057 — Opening Stock

The system supports a one-time Opening Stock process for inventory physically present when Gelana goes live.

---

## BR-058 — Opening Stock By Branch

Opening stock must be recorded separately for each branch.

---

## BR-059 — Opening Stock Quantity

The Owner enters the actual physical starting quantity.

---

## BR-060 — Opening Stock Identification

Opening stock must be clearly identified as an opening-stock movement and must not be confused with ordinary receiving.

---

## BR-061 — Opening Stock Cost

The Owner may provide the best-known or estimated cost when historical purchase cost is unavailable.

---

## BR-062 — Estimated Cost Identification

Estimated opening cost must be identified as opening-stock cost rather than falsely represented as a normal historical purchase.

---

# 10. Inventory Quantity Rules

## BR-063 — No Negative Inventory

Inventory available for sale must never become negative.

---

## BR-064 — Sale Stock Validation

A sale cannot be confirmed if the required quantity exceeds available branch stock.

---

## BR-065 — Stock Display

Employees can see the available quantity for their branch.

---

## BR-066 — Zero Stock

A product with zero stock remains visible but is marked:

**Out of Stock / 0**

---

## BR-067 — Zero Stock Sale

Employees cannot complete a sale when available stock is zero.

---

## BR-068 — Minimum Stock

Owner sets a minimum stock threshold for each product at each branch.

---

## BR-069 — Low Stock

A product becomes low-stock when its branch quantity reaches or falls below its configured minimum threshold.

---

## BR-070 — Branch-Specific Threshold

Minimum stock levels can differ between branches.

---

# 11. Inventory Adjustments

## BR-071 — Owner-Only Adjustment

Only the Owner can perform inventory adjustments.

---

## BR-072 — Adjustment Reason

Every stock adjustment requires a reason.

---

## BR-073 — Immediate Adjustment

Once the Owner confirms an adjustment, it takes effect immediately.

No second approval is required.

---

## BR-074 — Adjustment History

Every adjustment permanently records:

* Product
* Branch
* Old quantity
* Adjustment quantity
* New quantity
* Reason
* Date/time
* Owner

---

## BR-075 — Adjustment Cannot Create Negative Stock

An adjustment must not result in available sellable stock becoming negative.

---

# 12. Stocktake Rules

## BR-076 — Owner Stocktake

Only the Owner can perform official stocktake operations.

---

## BR-077 — Physical Count

Stocktake records the physical quantity counted at a branch.

---

## BR-078 — Stocktake Comparison

The system compares:

**System quantity vs physical quantity**

and displays the difference.

---

## BR-079 — Stocktake Adjustment

If the Owner chooses to correct inventory based on a stocktake, the resulting change becomes a normal stock adjustment.

---

## BR-080 — Stocktake Reason

Every resulting stock adjustment requires a reason.

---

## BR-081 — Stocktake Frequency

Stocktake is not a mandatory fixed scheduled operation.

The Owner may perform it approximately every two months or whenever necessary.

---

# 13. Sales Rules

## BR-082 — Sale Creation

Employees can create sales for their assigned branch.

Owner can create/manage sales according to Owner permissions.

---

## BR-083 — Sale Building

A sale must be built and reviewed before confirmation.

---

## BR-084 — Sale Line Calculation

The system automatically calculates each line total:

**Quantity × Selling Price**

---

## BR-085 — Sale Total

The system automatically calculates the complete sale total.

---

## BR-086 — Available Stock During Entry

Available stock is shown while adding products to the sale.

---

## BR-087 — Quantity Validation

Requested quantity cannot exceed available branch stock.

---

## BR-088 — Sale Confirmation

A sale becomes final when confirmed.

---

## BR-089 — Inventory Deduction

After confirmation, the system deducts the appropriate base-unit quantity from the branch inventory.

---

## BR-090 — Sale Number

Every sale receives a unique internal sale number.

Example:

`SAL-000123`

---

## BR-091 — Physical Receipt Separation

The internal Gelana sale number is separate from the existing physical receipt number.

---

## BR-092 — Physical Payment Process

The existing physical cash/receipt process remains outside Gelana.

Gelana records the internal business transaction and inventory movement.

---

# 14. Delayed/Paper Sales

## BR-093 — Delayed Entry

Employees may temporarily record sales on paper when busy.

---

## BR-094 — Mandatory Entry Before Closing

All paper-recorded sales must be entered into Gelana before branch daily closing.

---

## BR-095 — Actual Sale Time

Delayed sales must preserve the actual sale date/time separately from the time they were entered into Gelana.

---

## BR-096 — Delayed Entry Identification

Delayed/paper sales should be identifiable as delayed entries.

---

## BR-097 — Entry Timestamp

The system separately preserves when the delayed transaction was entered into Gelana.

---

# 15. Sales Price Rules

## BR-098 — Configured Price

The normal sale uses the configured selling price for the selected product/unit.

---

## BR-099 — Employee Price Override

Employee cannot freely change the selling price.

---

## BR-100 — Owner Discount

Owner can authorize/apply discounts.

---

## BR-101 — Discount Recording

Discounts must be explicitly recorded rather than silently changing the product price.

---

## BR-102 — Historical Price Preservation

The final price actually used on a sale is permanently preserved.

---

# 16. Payment Rules

## BR-103 — Payment Required

A completed sale must have valid payment coverage.

---

## BR-104 — Owner Payment Method Management

Only Owner can:

* Add payment methods
* Edit payment methods
* Activate payment methods
* Deactivate payment methods

---

## BR-105 — Employee Payment Selection

Employees can only select from currently available Owner-configured payment methods.

---

## BR-106 — No Employee Payment Method Creation

Employee cannot create a new payment method during a sale.

---

## BR-107 — Split Payments

One sale may contain multiple payment methods.

---

## BR-108 — Split Payment Amounts

Each payment method has an amount.

The sum must equal the sale total before confirmation.

---

## BR-109 — Underpayment

If payment total is below sale total, the system displays the remaining amount and blocks confirmation.

---

## BR-110 — Overpayment

If payment total exceeds sale total, the system displays the excess and blocks confirmation.

---

## BR-111 — Payment Editing Before Confirmation

Employee may add, remove, or modify payment methods and amounts before confirmation.

---

## BR-112 — Payment Finalization

After sale confirmation, payment information cannot be freely edited.

Changes must follow the controlled correction/return workflow.

---

# 17. Sales Correction Rules

## BR-113 — No Destructive Editing

Completed sales cannot be freely edited or deleted.

---

## BR-114 — Employee Pre-Closing Correction

Employees may correct straightforward data-entry mistakes before daily closing within the permitted correction workflow.

---

## BR-115 — Correction History

Corrections preserve the original transaction.

The system records:

* Original creator
* Correction user
* Date/time
* Changed information
* Reason/details where required

---

## BR-116 — Owner Correction

Owner can authorize corrections/voids to completed sales.

---

## BR-117 — Correction Reason

Owner-authorized completed-sale corrections require a reason.

---

## BR-118 — Correction Inventory Effect

A correction must create the appropriate inventory movement rather than silently rewriting stock history.

---

# 18. Sales Return Rules

## BR-119 — Returns Supported

Customer sales returns are supported.

---

## BR-120 — Employee Returns

Employees may record returns.

Returns remain visible for Owner review.

---

## BR-121 — Original Sale Link

A normal return should be linked to the original sale whenever possible.

---

## BR-122 — Partial Return

Partial returns are supported.

---

## BR-123 — Maximum Return Quantity

A customer cannot return more units than were sold and not already returned.

---

## BR-124 — Return Condition

Each returned item must be classified as:

* Good/Sellable
* Damaged/Not Sellable

---

## BR-125 — Sellable Return

Sellable returned quantity goes back into available branch inventory.

---

## BR-126 — Damaged Return

Damaged returned quantity does not return to available sellable inventory.

It goes into damaged stock.

---

## BR-127 — Return Refund Amount

Return records must preserve the refund amount.

---

## BR-128 — Refund Payment Method

Refund payment method is required.

It must be selected from Owner-configured payment methods.

---

## BR-129 — No-Original-Sale Return

A return without an original Gelana sale is permitted only with Owner authorization.

---

## BR-130 — No-Original-Sale Return Audit

Such a return must record the Owner authorization and reason.

---

## BR-131 — Return History

Returns cannot be silently deleted.

---

# 19. Damaged Stock Rules

## BR-132 — Separate Damaged Stock

Damaged products are tracked separately from sellable available stock.

---

## BR-133 — Damaged Stock Cannot Be Sold

Damaged/non-sellable stock cannot be included in normal sales.

---

## BR-134 — Stock Disposal

Owner can dispose/write off damaged or unsellable stock.

---

## BR-135 — Disposal Reason

Stock disposal requires:

* Quantity
* Reason

---

## BR-136 — Disposal Inventory Effect

Disposal decreases damaged stock and creates a permanent history record.

---

# 20. Transfer Rules

## BR-137 — Transfer Request

Employee can create a transfer request.

---

## BR-138 — Owner Direct Transfer

Owner can create a transfer directly without an employee request.

---

## BR-139 — Transfer Approval

Only Owner can approve or reject a transfer request.

---

## BR-140 — Request Does Not Change Stock

Creating a transfer request does not change inventory.

---

## BR-141 — Approval Does Not Change Stock

Approving a transfer does not immediately deduct or add available stock.

---

## BR-142 — Transfer Dispatch

When stock physically leaves the source branch:

Source inventory decreases.

---

## BR-143 — In-Transit State

Between dispatch and receipt, transferred stock is represented as in transit.

---

## BR-144 — Transfer Receipt

When destination physically receives the goods:

Destination inventory increases by the actual received quantity.

---

## BR-145 — Expected vs Actual Quantity

The system preserves:

* Requested quantity
* Approved quantity
* Sent/dispatched quantity
* Actual received quantity

where applicable.

---

## BR-146 — Partial Approval

Owner may approve less than requested.

---

## BR-147 — Multiple Sources

One transfer request can be fulfilled from multiple source branches.

---

## BR-148 — Any Branch Pair

Transfers may occur between any two branches.

---

## BR-149 — Receipt Discrepancy

If actual received quantity differs from expected/sent quantity, the system creates a transfer discrepancy.

---

## BR-150 — Destination Cannot Rewrite Original Quantity

Destination employee cannot silently change the original requested/approved/sent quantities.

They only record actual receipt.

---

## BR-151 — Rejection

Rejected transfers remain permanently in history.

---

## BR-152 — Rejection Information

Rejected transfer records preserve:

* Reason
* Rejecting user
* Date/time
* Original request

---

## BR-153 — Approved Transfer Cancellation

Owner may cancel an approved transfer before physical dispatch.

---

## BR-154 — Post-Dispatch Cancellation

After physical dispatch, the transfer cannot simply be cancelled.

It must follow the actual transfer/receipt process.

---

# 21. Daily Closing Rules

## BR-155 — Branch Closing

Each branch has an independent daily closing.

---

## BR-156 — Closing Submission

Employee submits the branch's daily closing.

---

## BR-157 — Closing Approval

Owner reviews and approves the submitted closing.

---

## BR-158 — Closing Summary

Before submission, the system displays:

* Total sales
* Payment-method totals
* Expected cash
* Actual counted cash
* Difference/discrepancy

---

## BR-159 — Cash Reconciliation

Expected cash is calculated from recorded cash sales.

---

## BR-160 — Actual Cash

Employee enters physically counted cash.

---

## BR-161 — Cash Difference

The system calculates:

**Actual Cash − Expected Cash**

---

## BR-162 — Cash Discrepancy Explanation

A cash discrepancy requires an explanation/reason.

---

## BR-163 — Payment Method Reconciliation

Payment methods can be reconciled separately.

---

## BR-164 — Pending Sales Block

Daily closing cannot be completed if required sales have not been entered.

---

## BR-165 — Pending Sync Block

Daily closing cannot be completed while required offline transactions remain unsynchronized.

---

## BR-166 — Previous Closing Overdue

An unclosed previous day does not block the next day's sales.

The system displays a reminder that the previous closing is overdue.

---

## BR-167 — Owner Approval With Discrepancy

Owner may approve a closing despite a discrepancy after review.

---

## BR-168 — Owner Rejection

Owner may reject a submitted closing.

Rejection requires a reason.

---

## BR-169 — Rejected Closing

Rejected closing returns to the employee for correction/resubmission.

---

## BR-170 — Approved Closing Lock

Once Owner approves a closing, normal employee editing is prohibited.

---

## BR-171 — Closed-Day Correction

Later changes to an approved closing require an Owner-authorized correction process.

Original closing remains preserved.

---

## BR-172 — Business Date

Closing belongs to the local business calendar date.

---

# 22. Reporting Rules

## BR-173 — Owner Sales Reports

Owner can report sales by:

* Date range
* Branch
* Employee
* Product
* Payment method

---

## BR-174 — Sales Summary

Owner sales reporting includes:

* Total sales
* Transaction count
* Branch totals
* Employee totals
* Product totals
* Payment-method totals

---

## BR-175 — Best Sellers

Owner can identify best-selling products.

---

## BR-176 — Sales Trends

Owner can view sales trends by:

* Day
* Week
* Month
* Custom date range

---

## BR-177 — Employee Sales History

Employee can view their own sales history.

---

## BR-178 — Employee Sales Privacy

Employee cannot normally view another employee's sales history.

---

# 23. Inventory Reporting Rules

## BR-179 — Current Stock Report

Owner can view current stock.

---

## BR-180 — Low/Out-of-Stock Report

Owner can view low-stock and out-of-stock products.

---

## BR-181 — Stock Movement Report

Owner can view inventory movements.

---

## BR-182 — Inventory Valuation

Owner can view current inventory value based on recorded costs.

---

## BR-183 — Stocktake Report

Owner can view stocktake differences/discrepancies.

---

## BR-184 — Damaged Stock Report

Owner can view damaged inventory.

---

## BR-185 — Receiving Report

Owner can view purchase/receiving history.

---

# 24. Costing & Profit Rules

## BR-186 — Weighted Average Cost

Inventory costing uses Weighted Average Cost.

---

## BR-187 — Cost Update

When new stock is received, the weighted-average cost is recalculated according to the applicable inventory-costing calculation.

---

## BR-188 — Historical Sale Cost

A completed sale preserves the cost basis used for its profit calculation.

---

## BR-189 — Historical Profit

Later purchases and cost changes do not rewrite historical sale profit.

---

## BR-190 — Gross Profit

Owner can view estimated gross profit/margin.

---

## BR-191 — Branch Profit

Owner can compare estimated gross profit by branch.

---

## BR-192 — Product Profit

Owner can view estimated gross profit by product.

---

## BR-193 — Employee Cost Privacy

Purchase cost and profit/margin information are Owner-only.

---

# 25. Dashboard Rules

## BR-194 — Owner Dashboard

Owner dashboard prioritizes important business information requiring attention.

It includes, as appropriate:

* Today's sales
* Branch sales
* Pending/overdue closings
* Low/out-of-stock products
* Transfer activity
* Returns/corrections
* Inventory value
* Estimated profit
* Important notifications

---

## BR-195 — Employee Dashboard

Employee dashboard is branch-specific and role-specific.

It can include:

* Own sales
* Branch stock
* Low/out-of-stock items
* Transfer requests
* Closing status
* Sync status
* Relevant notifications

---

## BR-196 — Dashboard Is Not Full Reporting

Dashboards provide high-level operational information.

Detailed analysis belongs in reports.

---

# 26. Notification Rules

## BR-197 — Important Events

Notifications are for important and critical business events.

Normal individual sales do not generate Owner notifications.

---

## BR-198 — Notification Examples

Potential notification events include:

* Transfer request
* Low stock
* Out of stock
* Closing awaiting approval
* Significant discrepancy
* Important correction
* Important return
* Critical inventory/business event

---

## BR-199 — Notification Priority

Notifications have:

* Informational
* Important
* Critical

---

## BR-200 — Notification Persistence

Important notifications remain available until opened/acknowledged.

They must not silently disappear.

---

## BR-201 — Employee Notification Scope

Employees receive only notifications relevant to their:

* Role
* Branch
* Responsibilities

---

## BR-202 — Notification History

Authorized users can access notification history.

Notification history is separate from the audit log.

---

# 27. Audit Rules

## BR-203 — Important Action Audit

Important business actions must record:

* User
* Date/time
* Action
* Relevant details

---

## BR-204 — Owner Audit Access

Owner can access the audit/history log.

---

## BR-205 — Permanent Audit

Audit records cannot be deleted.

---

## BR-206 — Correction Creates History

A correction creates a new history record.

The original action remains preserved.

---

# 28. Offline Rules

## BR-207 — Employee Offline Sales

Employees can perform normal sales while temporarily offline.

---

## BR-208 — Local Product Data

Offline sales use locally available product information.

---

## BR-209 — Local Stock

Offline sales update the employee's local branch stock representation.

---

## BR-210 — Offline Transfer Requests

Employees can create transfer requests while offline.

---

## BR-211 — Owner-Critical Offline Restriction

The following Owner-critical operations require online central connectivity in Version 1:

* Receiving
* Stock adjustments
* Stocktake adjustments
* Transfer approval/rejection
* Product changes
* Price changes
* Employee management
* Branch management

---

## BR-212 — Offline Transaction Preservation

An offline transaction must never be silently lost.

---

## BR-213 — Sync Retry

Failed synchronization remains pending and is retried until successful.

---

## BR-214 — Idempotency

Every offline transaction must have a unique transaction identifier.

Repeated synchronization attempts must not create duplicate business transactions.

---

## BR-215 — Sync Status

The user should be able to see whether the system is:

* Online / Synced
* Offline / Pending
* Sync Pending
* Syncing
* Sync Failed

---

## BR-216 — Sync Before Closing

Required pending transactions must synchronize before daily closing.

---

# 29. Offline Conflict Rules

## BR-217 — No Silent Transaction Deletion

If synchronization produces an inventory inconsistency, the system must not silently delete a legitimate recorded sale.

---

## BR-218 — Conflict Preservation

The legitimate transaction remains preserved.

The system creates an appropriate discrepancy/problem for Owner review.

---

## BR-219 — Branch Separation

Normal sales from different branches do not conflict merely because they occur at the same time.

Each branch maintains its own inventory.

---

## BR-220 — Offline Transfer Request

An offline transfer request does not reserve stock.

It synchronizes as a request.

---

## BR-221 — Owner Decision After Sync

If an offline transfer request arrives after available stock has changed, the Owner decides whether and how it can be fulfilled.

---

# 30. Import Rules

## BR-222 — Product Bulk Import

Owner can bulk-import products.

---

## BR-223 — Opening Stock Bulk Entry

Owner can bulk-enter opening stock for multiple products and branches.

---

## BR-224 — Import Validation

Imported records must be validated before becoming official business data.

---

## BR-225 — Invalid Import Records

Invalid records must be clearly identified.

They must not be silently accepted.

---

## BR-226 — Partial Import

Valid records may be imported while invalid records are separately reported for correction/re-import.

---

# 31. Transaction ID Rules

## BR-227 — Major Transaction Identifiers

Major transaction types receive unique human-readable identifiers.

Examples:

* `SAL-000123`
* `REC-000045`
* `TRF-000018`
* `RET-000007`
* `ADJ-000012`
* `CLS-000031`

---

## BR-228 — Transaction ID Immutability

Once assigned, a business transaction identifier must not be reused for another transaction.

---

# 32. Data Retention Rules

## BR-229 — No Destructive Business History

Business transactions must not be permanently deleted through normal application functionality.

---

## BR-230 — Protected Records

This applies at minimum to:

* Sales
* Returns
* Receiving
* Transfers
* Stock adjustments
* Closing records
* Audit records

---

## BR-231 — Master Data Deactivation

Master data such as products, employees, branches, and suppliers should normally be deactivated instead of deleted when historical relationships exist.

---

# 33. Owner Override Rules

## BR-232 — Controlled Owner Override

Owner authority may override a workflow only where the established business workflow permits Owner intervention.

---

## BR-233 — No Universal Bypass

There must not be a generic "bypass all rules" button.

---

## BR-234 — Override Audit

Owner-authorized exceptional actions must record:

* Owner
* Date/time
* Reason
* Original state
* Resulting state

---

# 34. Backup & Recovery Rules

## BR-235 — Automatic Backup

The central business database must have an automatic backup mechanism.

---

## BR-236 — Recovery

The system must have a defined method for restoring business data from backups.

---

## BR-237 — Backup Independence

Backups should not depend solely on the live production database remaining available.

**Implementation details such as backup frequency, retention period, storage location, encryption, and restoration procedure will be finalized during technical design.**

---

# 35. Cross-Cutting Data Integrity Rules

## BR-238 — Inventory Movement Traceability

Every change to stock must have a traceable business reason/movement.

Expected movement types include:

* Opening stock
* Receiving
* Sale
* Return
* Transfer out
* Transfer in
* Adjustment
* Stock disposal

---

## BR-239 — No Silent Quantity Changes

The system must never directly change inventory quantity without producing the corresponding movement/history record.

---

## BR-240 — Historical Integrity

Historical transactions must preserve the values needed to understand what happened at the time.

This includes relevant:

* Product
* Quantity
* Unit
* Conversion
* Selling price
* Cost basis
* Payment information
* User
* Branch
* Date/time

---

## BR-241 — Branch Integrity

A normal Employee operation must not accidentally affect another branch's inventory.

---

## BR-242 — Authorization Before Mutation

The system must check user authorization before performing a protected business operation.

---

## BR-243 — Transaction Atomicity

Where a business operation contains multiple related changes, they must succeed or fail together where appropriate.

Example:

A confirmed sale should not be recorded without its corresponding inventory deduction.

---

## BR-244 — Duplicate Prevention

The same business transaction must not be created twice because of:

* Double clicking
* Network retry
* Offline synchronization retry
* API retry

---

# 36. Business-Day Rules

## BR-245 — Local Business Date

Business-day calculations use the business's local calendar/date.

---

## BR-246 — Delayed Entry Date

A delayed sale preserves its actual sale date separately from its system-entry timestamp.

---

## BR-247 — Closing Association

Each sale must be associated with the appropriate business date/branch closing.

---

# 37. Employee Visibility Rules

## BR-248 — Branch Stock Visibility

Employee can see product quantities for their assigned branch.

---

## BR-249 — Employee Selling Price Visibility

Employee can see applicable selling prices.

---

## BR-250 — Employee Low-Stock Visibility

Employee can see low/out-of-stock status relevant to their branch.

---

## BR-251 — Employee Cost Restriction

Employee cannot see purchase cost unless a future explicit business requirement authorizes it.

---

## BR-252 — Employee Profit Restriction

Employee cannot see profit/margin reports.

---

# 38. Owner Visibility Rules

## BR-253 — Business-Wide Visibility

Owner can access information across all branches.

---

## BR-254 — Purchase Cost Visibility

Owner can view purchase costs.

---

## BR-255 — Profit Visibility

Owner can view gross profit/margin information.

---

## BR-256 — Historical Inventory Visibility

Owner can view complete inventory movement history.

---

# 39. System Behavior Principles

## BR-257 — Preserve History

When a business event changes, the system should preserve what happened rather than rewrite history.

---

## BR-258 — Explicit State Changes

Important workflows should use explicit statuses rather than ambiguous database flags.

Examples:

* Transfer: Requested, Approved, Dispatched, Received, Completed, Rejected
* Product: Active, Inactive
* User: Active, Inactive
* Supplier: Active, Inactive
* Closing: Submitted, Approved, Rejected
* Synchronization: Pending, Syncing, Synced, Failed

---

## BR-259 — Business Validation Before Confirmation

Important transactions must be validated before becoming official.

---

## BR-260 — User-Friendly Errors

When a business rule prevents an action, the system should clearly explain:

* What is wrong
* Why it cannot continue
* What the user should do next

---

# 40. Rules That Still Need Technical Design Rather Than More Business Questions

The following are intentionally **not being invented at this stage** because they require the entity/data model and technical architecture to be designed correctly:

* Exact weighted-average-cost calculation implementation
* Exact inventory ledger/database structure
* Exact sale-item snapshot structure
* Exact return accounting structure
* Exact synchronization queue schema
* Exact conflict-resolution database model
* Exact transaction ID generation implementation
* Exact backup frequency/retention
* Exact database transaction boundaries
* Exact API validation structure
* Exact offline local database technology
* Exact synchronization protocol
* Exact audit table structure

These will be designed in the later stages while respecting the approved business rules above.

---







Final /Entity Data Model 




Absolutely. We’ll now move to **Step 3: Complete Entity/Data Model**.

And yes — for this step, I will **not let the currently implemented tables constrain us**. We are designing the model from the **finalized business workflows + approved business rules**, as if we were designing the system from scratch professionally.

The goal is not merely to list database tables. We need to define **what information the business actually needs to preserve**, how entities relate, and what historical information must never be lost.

---

# STEP 3 — COMPLETE ENTITY / DATA MODEL

## 3.1 Purpose

The data model must support:

* 3 branches
* owner and employees
* products and categories
* suppliers
* branch-specific inventory
* receiving stock
* opening stock
* stock adjustments
* stocktakes
* sales
* split payments
* sales returns
* damaged stock
* stock disposal/write-offs
* inter-branch transfers
* daily closing
* weighted-average-cost profit calculation
* notifications
* audit history
* offline synchronization
* historical integrity
* reporting

The most important principle is:

> **The database must preserve what happened, not just the current state.**

For example, if a product's price changes from 50 to 60, the system cannot simply store `60` and forget `50`, because old sales were made at 50.

Likewise, if stock changes from 100 → 95 → 120 → 117, we need to know **why each change happened**, not only that the current stock is 117.

---

# 3.2 Entity Classification

I recommend dividing the entities into six groups.

### A. Master Data

Information that defines the business.

1. Branch
2. User
3. Category
4. Product
5. Product Unit
6. Product Price
7. Supplier
8. Payment Method

### B. Inventory

Information about physical stock.

9. Inventory Balance
10. Inventory Movement
11. Inventory Cost Layer / Cost Record
12. Stock Adjustment
13. Stocktake
14. Stocktake Item
15. Damaged Stock / Damaged Inventory
16. Stock Disposal

### C. Purchasing / Receiving

17. Receiving
18. Receiving Item

### D. Sales

19. Sale
20. Sale Item
21. Sale Payment
22. Sale Correction / Void

### E. Returns & Transfers

23. Sales Return
24. Sales Return Item
25. Stock Transfer
26. Stock Transfer Item

### F. Closing, Reporting & System Control

27. Daily Closing
28. Daily Closing Payment Summary
29. Notification
30. Audit Log
31. Synchronization Record / Sync Operation

Some of these may eventually be implemented as tables, some may be represented differently technically. **For now we are defining the business entities**, not prematurely deciding the exact PostgreSQL schema.

---

# 3.3 Core Master Data

## Entity 1 — Branch

Represents a physical business branch.

### Required information

| Field            | Required | Purpose                    |
| ---------------- | -------- | -------------------------- |
| Branch ID        | Yes      | Internal unique identifier |
| Branch Name      | Yes      | Human-readable name        |
| Branch Code      | Yes      | Short unique identifier    |
| Address/Location | No       | Physical location          |
| Phone            | No       | Branch contact             |
| Active Status    | Yes      | Active/Inactive            |
| Created At       | Yes      | History                    |
| Updated At       | Yes      | History                    |

### Important rules

* Branch cannot simply be deleted.
* Deactivated branches remain in historical records.
* Owner can create/manage branches.
* Every inventory balance belongs to a branch.
* Every employee has an assigned branch.
* Owner can work across branches.

---

# 3.4 User

Represents people who use the system.

### Required information

| Field               | Required                       |
| ------------------- | ------------------------------ |
| User ID             | Yes                            |
| Name                | Yes                            |
| Email/Username      | Yes                            |
| Password credential | Yes                            |
| Role                | Yes                            |
| Assigned Branch     | Employee: Yes / Owner: special |
| Active Status       | Yes                            |
| Created At          | Yes                            |
| Updated At          | Yes                            |

### Role

Version 1 has:

* `OWNER`
* `EMPLOYEE`

We should **not create unnecessary roles** such as accountant, cashier, branch manager, etc. unless the business later needs them.

### Historical consideration

The user who performed a transaction must remain identifiable even if that employee is later deactivated.

---

# 3.5 User Branch Assignment History

This is important.

We should not simply overwrite:

> Employee A → Branch 1

with:

> Employee A → Branch 2

because we need to know where the employee was assigned historically.

### Entity: Branch Assignment

Stores:

* Assignment ID
* User
* Branch
* Start date/time
* End date/time
* Assigned by
* Reason/notes if necessary

This allows reports to correctly understand historical activity.

---

# 3.6 Category

Represents product categories.

Example:

* Exercise Books
* Pens
* Pencils
* Office Supplies
* Art Materials

### Fields

* Category ID
* Name
* Active status
* Created At
* Updated At

Category is required for every product.

Categories are deactivated rather than deleted.

---

# 3.7 Product

This is one of the most important entities.

### Fields

| Field                   | Required |
| ----------------------- | -------- |
| Product ID              | Yes      |
| SKU                     | Yes      |
| Name                    | Yes      |
| Category                | Yes      |
| Brand                   | No       |
| Description             | No       |
| Image                   | No       |
| Base Unit               | Yes      |
| Minimum Stock Threshold | Yes      |
| Active Status           | Yes      |
| Created At              | Yes      |
| Updated At              | Yes      |

### Important design decision

The product itself should **not contain branch stock**.

For example:

> Product: Bic Pen

is one product.

But:

> Main Branch: 100
> Branch 2: 40
> Branch 3: 15

belongs to the **inventory entity**, not the Product entity.

---

# 3.8 Product Unit

Because we decided to support alternate selling units, units need their own model.

Example:

**Product:** A4 Paper

Base unit:

> Sheet

Alternate unit:

> Pack

Conversion:

> 1 Pack = 500 Sheets

### Product Unit fields

* Unit ID
* Product ID
* Unit Name
* Unit Type
* Conversion Quantity to Base Unit
* Active Status
* Created At
* Updated At

One product must have exactly one base unit.

It may have zero or more alternate units.

---

# 3.9 Product Price

Prices should be represented separately from the product itself.

Why?

Because prices change.

Example:

| Date  | Unit  | Price |
| ----- | ----- | ----: |
| Jan 1 | Piece |     5 |
| Mar 1 | Piece |     6 |
| May 1 | Piece |     7 |

We must preserve the old prices.

### Entity

**Product Price**

Contains:

* Price ID
* Product
* Product Unit
* Selling Price
* Effective From
* Effective Until
* Created By
* Created At

### Important

Prices are **global**, not branch-specific.

So we do NOT create:

> Main Branch Price
> Branch 2 Price
> Branch 3 Price

for Version 1.

---

# 3.10 Supplier

Represents a supplier.

### Fields

* Supplier ID
* Name
* Phone
* Address/Location
* Contact Person
* Notes
* Active Status
* Created At
* Updated At

Supplier name is required.

Inactive suppliers remain visible in historical receiving records.

---

# 3.11 Payment Method

Represents configured ways customers can pay.

Examples:

* Cash
* Telebirr
* Bank Transfer
* Other configured method

### Fields

* Payment Method ID
* Name
* Active Status
* Created At
* Updated At

The owner controls which methods exist.

Employees cannot invent arbitrary payment methods during a sale.

---

# 3.12 INVENTORY MODEL

This is where we need to be particularly careful.

We should separate:

### Current state

from

### Historical events.

That means we need both:

> **Inventory Balance**

and

> **Inventory Movement**

---

# 3.13 Inventory Balance

Represents the current quantity of a product at a branch.

Conceptually:

**Product + Branch = Inventory Balance**

Example:

| Branch   | Product | Available |
| -------- | ------- | --------: |
| Main     | Pen     |       100 |
| Branch 2 | Pen     |        35 |
| Branch 3 | Pen     |        12 |

### Fields

* Inventory ID
* Branch ID
* Product ID
* Available Quantity
* Damaged Quantity
* Last Updated At

There should be only one active balance record for a given:

> Branch + Product

---

# 3.14 Inventory Movement

This is the **historical inventory ledger**.

Every material inventory change should create a movement.

Examples:

* Opening Stock
* Receiving
* Sale
* Sales Return
* Stock Adjustment
* Transfer Out
* Transfer In
* Damaged Return
* Stock Disposal
* Other approved movement

### Fields

* Movement ID
* Branch
* Product
* Movement Type
* Quantity
* Unit
* Quantity in Base Unit
* Reference Transaction
* Quantity Before
* Quantity After
* Date/Time
* User
* Reason where applicable
* Cost information where applicable

### Example

Suppose Main Branch has 100 pens.

Sale of 5:

> Before = 100
> Movement = -5
> After = 95
> Reason = Sale SAL-000123

Then receiving 50:

> Before = 95
> Movement = +50
> After = 145
> Reason = Receiving REC-000045

This gives us a complete audit trail.

---

# 3.15 Why Inventory Movement Is Essential

Without an inventory ledger, the owner could see:

> Current stock = 145

but couldn't answer:

> "How did we get to 145?"

With the ledger:

```text
Opening Stock       +100
Sale                  -5
Receiving            +50
-------------------------
Current               145
```

This becomes the foundation for:

* stock movement reports
* stocktake
* discrepancy investigation
* audit
* inventory valuation
* damaged stock tracking
* transfer tracking

---

# 3.16 Inventory Cost Records

Because we selected **Weighted Average Cost**, the system needs a way to preserve cost information.

This is separate from the selling price.

Example:

Supplier A:

> 100 units × 40

Later Supplier B:

> 100 units × 50

Weighted average:

> `(100×40 + 100×50) / 200 = 45`

The inventory system needs to track the cost entering inventory and the resulting average cost.

### Conceptual entity: Inventory Cost Record

Contains:

* Cost Record ID
* Branch
* Product
* Related receiving/movement
* Quantity
* Purchase cost per base unit
* Total cost
* Resulting weighted average cost
* Date/time

Historical cost information must not be overwritten.

---

# 3.17 RECEIVING

## Entity 17 — Receiving

Represents one stock-receiving event.

Example:

> REC-000045
> Supplier: ABC Stationery
> Destination: Main Branch
> Date: Oct 5
> Items: 12 products

### Fields

* Receiving ID
* Receiving Number
* Supplier
* Destination Branch
* Supplier Invoice/Reference Number
* Receiving Date/Time
* Created By
* Status
* Notes
* Created At

One receiving transaction belongs to **one supplier**.

---

# 3.18 Receiving Item

A receiving contains multiple products.

Example:

**REC-000045**

| Product  | Quantity | Purchase Cost |
| -------- | -------: | ------------: |
| Pen      |      100 |             4 |
| Notebook |       50 |            25 |
| Pencil   |      200 |             2 |

### Fields

* Receiving Item ID
* Receiving ID
* Product
* Unit
* Quantity
* Base Quantity
* Purchase Cost per Base Unit
* Total Cost
* Cost/batch information

The receiving item preserves the cost associated with that receiving event.

---

# 3.19 Opening Stock

I recommend **not creating a completely separate inventory system for opening stock**.

Instead:

Opening stock should be represented as a special inventory transaction/movement.

Example:

> Movement Type = OPENING_STOCK

It can have:

* Opening quantity
* Branch
* Product
* Opening cost
* User
* Date
* Opening-stock designation

This avoids creating two different mechanisms for changing inventory.

---

# 3.20 Stock Adjustment

Represents an owner-authorized manual inventory correction.

### Fields

* Adjustment ID
* Adjustment Number
* Branch
* Product
* Quantity Before
* Adjustment Quantity
* Quantity After
* Reason
* Created By
* Date/Time
* Related stocktake if applicable

Adjustment quantity may be:

> +10

or

> -7

But negative inventory must never be allowed.

---

# 3.21 Stocktake

Represents a physical inventory counting exercise.

### Stocktake

* Stocktake ID
* Stocktake Number
* Branch
* Date
* Started By
* Completed By
* Status
* Notes

### Stocktake Item

For every counted product:

* Product
* System Quantity
* Physical Quantity
* Difference
* Reason
* Adjustment Reference if created

Important:

**Stocktake itself does not silently modify inventory.**

If there is a difference, an authorized adjustment is created.

---

# 3.22 Damaged Inventory

I recommend representing damaged inventory as a distinct inventory quantity/state rather than treating damaged stock as normal sellable inventory.

For example:

```text
Main Branch
Pen
Sellable: 90
Damaged: 5
```

The damaged quantity cannot be sold.

This supports:

* damaged returns
* damaged stock reports
* disposal/write-off
* audit history

---

# 3.23 Stock Disposal

Represents permanent removal of damaged/unsellable stock.

### Fields

* Disposal ID
* Disposal Number
* Branch
* Product
* Damaged Quantity Before
* Quantity Disposed
* Remaining Damaged Quantity
* Reason
* Created By
* Date/Time

This creates an inventory movement and audit record.

---

# 3.24 SALES MODEL

A sale should be separated into:

```text
Sale
 ├── Sale Items
 └── Sale Payments
```

This is essential because one sale can contain many products and multiple payment methods.

---

# 3.25 Sale

Represents the complete transaction.

### Fields

* Sale ID
* Sale Number
* Branch
* Employee/User
* Sale Date/Time
* Subtotal
* Discount
* Grand Total
* Status
* Created At
* Updated At

Status could include concepts such as:

* Completed
* Voided
* Corrected

But historical records remain.

---

# 3.26 Sale Item

Represents one product line within a sale.

Example:

**SAL-000123**

| Product  | Qty | Unit Price | Total |
| -------- | --: | ---------: | ----: |
| Pen      |   5 |          6 |    30 |
| Notebook |   2 |         25 |    50 |

### Fields

* Sale Item ID
* Sale
* Product
* Unit sold
* Quantity
* Base quantity
* Selling price actually used
* Discount if applicable
* Line total
* Cost basis
* Gross profit/margin information

### Very important

The sale item must preserve a **snapshot of the transaction price and cost basis**.

It must not depend on the current Product Price.

Otherwise, changing today's price would incorrectly change yesterday's historical sale.

---

# 3.27 Sale Payment

Because split payments are supported, payment cannot simply be one field inside Sale.

Example:

Total:

> 500

Customer pays:

> Cash = 300
> Telebirr = 200

So:

**Sale**

→ Payment 1: Cash 300
→ Payment 2: Telebirr 200

### Fields

* Payment ID
* Sale
* Payment Method
* Amount
* Date/Time
* Recorded By

The sum of payment amounts must equal the sale amount before the sale can be completed.

---

# 3.28 Sale Correction / Void

A completed sale must not simply be overwritten.

We need a historical correction structure.

### It should preserve:

* Original sale
* Who corrected it
* When
* What was changed
* Why
* Resulting inventory effect
* Resulting financial effect

This can eventually be represented as a dedicated correction/void entity or an immutable transaction-event structure.

**The exact technical implementation comes later.**

---

# 3.29 SALES RETURNS

## Sales Return

Represents a return against a previous sale.

### Fields

* Return ID
* Return Number
* Original Sale
* Branch
* Processed By
* Return Date/Time
* Refund Amount
* Refund Payment Method
* Status
* Reason/Notes

---

# 3.30 Sales Return Item

A return can contain multiple products.

### Fields

* Return Item ID
* Return
* Original Sale Item
* Product
* Quantity Returned
* Unit
* Base Quantity
* Condition
* Refund Amount

Condition:

* `SELLABLE`
* `DAMAGED`

### Important

The system must know how much of the original sale quantity has already been returned.

Therefore:

> Returned quantity cannot exceed originally sold quantity minus previously returned quantity.

---

# 3.31 Transfer

A transfer represents the entire movement request between branches.

### Fields

* Transfer ID
* Transfer Number
* Source Branch
* Destination Branch
* Requested By
* Approved By
* Requested Date
* Approved Date
* Dispatched Date
* Received Date
* Status
* Rejection Reason
* Cancellation Reason

Statuses:

```text
REQUESTED
     ↓
APPROVED
     ↓
DISPATCHED
     ↓
RECEIVED
     ↓
COMPLETED
```

Or:

```text
REQUESTED → REJECTED
```

---

# 3.32 Transfer Item

One transfer can contain multiple products.

### Fields

* Transfer Item ID
* Transfer
* Product
* Requested Quantity
* Approved Quantity
* Dispatched Quantity
* Received Quantity
* Discrepancy Quantity

This is especially important because:

> Expected/sent quantity ≠ necessarily actual received quantity.

Example:

Requested:

> 20

Approved:

> 15

Dispatched:

> 15

Actually received:

> 14

The system must preserve all of those values.

---

# 3.33 Transfer Discrepancy

A discrepancy should not simply overwrite the transfer.

Conceptually:

* Transfer
* Expected quantity
* Actual quantity
* Difference
* Reported by
* Date/time
* Owner review
* Resolution
* Resolution date

This lets the owner investigate missing/damaged goods.

---

# 3.34 DAILY CLOSING

## Daily Closing

Each branch gets its own closing record per business day.

### Fields

* Closing ID
* Closing Number
* Branch
* Business Date
* Submitted By
* Submitted At
* Reviewed By
* Reviewed At
* Status
* Total Sales
* Expected Cash
* Actual Cash
* Cash Discrepancy
* Discrepancy Explanation
* Owner Review Notes

Possible statuses:

```text
OPEN
SUBMITTED
APPROVED
REJECTED
CORRECTION_REQUIRED
CORRECTED
```

---

# 3.35 Daily Closing Payment Summary

Because payment methods can be reconciled separately, we should have payment-level closing summaries.

Example:

| Payment Method | System Total | Actual |
| -------------- | -----------: | -----: |
| Cash           |        5,000 |  4,950 |
| Telebirr       |        3,000 |  3,000 |
| Bank           |        1,500 |  1,500 |

This allows the owner to identify exactly where discrepancies occurred.

---

# 3.36 NOTIFICATIONS

Notification is separate from audit history.

### Notification

* Notification ID
* Recipient User
* Type
* Priority
* Title
* Message
* Related Entity
* Related Entity ID
* Created At
* Opened/Acknowledged At
* Status

Priority:

* Informational
* Important
* Critical

Examples:

> Transfer request waiting for approval

> Product out of stock

> Closing has a cash discrepancy

> Significant inventory discrepancy

---

# 3.37 AUDIT LOG

This is one of the most important system entities.

The audit log answers:

> Who did what, when, and to what?

### Fields

* Audit ID
* User
* Action
* Entity Type
* Entity ID
* Timestamp
* Previous State / relevant old values
* New State / relevant new values
* Reason
* Branch context
* Additional details

Examples:

```text
OWNER
Changed Pen price
50 → 55
Oct 5, 2026 10:15
```

or:

```text
OWNER
Adjusted Main Branch Pen stock
100 → 95
Reason: Damaged goods
```

Audit records are permanent and non-deletable.

---

# 3.38 OFFLINE / SYNCHRONIZATION DATA

This is where we must be careful not to mix business data with technical synchronization data.

The business entities remain:

> Sale
> Transfer
> Closing
> etc.

Synchronization is a separate concern.

### Conceptual entity: Sync Operation

Stores information such as:

* Sync Operation ID
* Device/client identifier
* User
* Local operation identifier
* Entity affected
* Operation type
* Created locally at
* Uploaded at
* Sync status
* Retry count
* Error information
* Conflict information if applicable

This allows the system to know:

> "This sale was created offline and has not yet reached the central server."

The exact offline database and sync protocol will be designed later.

---

# 3.39 ENTITY RELATIONSHIP OVERVIEW

The overall model looks approximately like this:

```text
BRANCH
  │
  ├── USERS
  │
  ├── INVENTORY
  │      │
  │      ├── INVENTORY MOVEMENTS
  │      └── COST RECORDS
  │
  ├── RECEIVINGS
  │      └── RECEIVING ITEMS
  │
  ├── SALES
  │      ├── SALE ITEMS
  │      └── SALE PAYMENTS
  │
  ├── SALES RETURNS
  │      └── RETURN ITEMS
  │
  ├── TRANSFERS
  │      └── TRANSFER ITEMS
  │
  ├── STOCKTAKES
  │      └── STOCKTAKE ITEMS
  │
  ├── STOCK ADJUSTMENTS
  │
  ├── STOCK DISPOSALS
  │
  └── DAILY CLOSINGS


CATEGORY
   │
   └── PRODUCTS
          │
          ├── PRODUCT UNITS
          └── PRODUCT PRICES


SUPPLIER
   │
   └── RECEIVINGS


PAYMENT METHOD
   │
   └── SALE PAYMENTS


USERS
   │
   ├── AUDIT LOG
   ├── NOTIFICATIONS
   └── SYNC OPERATIONS
```

---

# 3.40 The Most Important Historical Relationships

There are several relationships I consider **non-negotiable**.

### Product → Sale Item

A sale must preserve what was sold **at that moment**.

### Product → Receiving Item

A receiving must preserve:

> what was purchased, how much, and at what cost.

### Product → Inventory Movement

Every important inventory change must have a traceable reason.

### Sale → Return

A return must know which original sale it came from whenever an original sale exists.

### Transfer → Transfer Item

Expected, approved, dispatched, and received quantities must remain distinguishable.

### Closing → Branch + Business Date

A closing belongs to a particular branch and business date.

### User → Audit Log

Every important action must identify the person responsible.

---

# 3.41 Immutable Historical Data

These records should **never be physically deleted**:

* Completed sales
* Sale items
* Sale payments
* Receiving transactions
* Receiving items
* Inventory movements
* Stock adjustments
* Stocktakes
* Returns
* Transfers
* Daily closings
* Audit logs
* Historical price records
* Historical cost records

Instead of deletion:

> correct it
> void it
> reverse it
> deactivate it
> create a new historical event

This follows the business rules we already approved.

---

# 3.42 What Should NOT Be Stored as Simple Current Values

There are several things where simply storing the current value would be dangerous.

### ❌ Don't do this

```text
Product
sellingPrice = 60
```

and expect that to explain historical sales.

### Better

```text
Product
    ↓
Product Prices
    ├── 50
    ├── 55
    └── 60
```

Similarly:

### ❌ Don't only store

```text
Inventory.quantity = 145
```

### Also preserve

```text
Inventory Movements
    Opening +100
    Sale       -5
    Receiving +50
```

And for transfers:

### ❌ Don't only store

```text
Transfer.quantity = 15
```

### Preserve

```text
Requested   20
Approved   15
Dispatched 15
Received   14
```

---

# 3.43 High-Level Relationship Cardinality

Some key relationships:

| Relationship                | Cardinality                    |
| --------------------------- | ------------------------------ |
| Branch → Users              | 1 : Many                       |
| Branch → Inventory          | 1 : Many                       |
| Category → Products         | 1 : Many                       |
| Product → Units             | 1 : Many                       |
| Product → Prices            | 1 : Many                       |
| Product → Inventory         | 1 : Many                       |
| Product → Receiving Items   | 1 : Many                       |
| Receiving → Receiving Items | 1 : Many                       |
| Supplier → Receivings       | 1 : Many                       |
| Sale → Sale Items           | 1 : Many                       |
| Sale → Sale Payments        | 1 : Many                       |
| Sale → Returns              | 1 : Many                       |
| Return → Return Items       | 1 : Many                       |
| Transfer → Transfer Items   | 1 : Many                       |
| Branch → Transfers          | 1 : Many as source/destination |
| Stocktake → Stocktake Items | 1 : Many                       |
| Closing → Payment Summaries | 1 : Many                       |
| User → Audit Logs           | 1 : Many                       |
| User → Notifications        | 1 : Many                       |

---

# 3.44 Proposed Complete Entity List

So, after deriving the model from the business rules, my professional proposed entity set is:

### Master Data

1. **Branch**
2. **User**
3. **Branch Assignment**
4. **Category**
5. **Product**
6. **Product Unit**
7. **Product Price**
8. **Supplier**
9. **Payment Method**

### Inventory

10. **Inventory Balance**
11. **Inventory Movement**
12. **Inventory Cost Record**
13. **Stock Adjustment**
14. **Stocktake**
15. **Stocktake Item**
16. **Stock Disposal**

### Receiving

17. **Receiving**
18. **Receiving Item**

### Sales

19. **Sale**
20. **Sale Item**
21. **Sale Payment**
22. **Sale Correction/Void**

### Returns

23. **Sales Return**
24. **Sales Return Item**

### Transfers

25. **Stock Transfer**
26. **Transfer Item**
27. **Transfer Discrepancy**

### Closing

28. **Daily Closing**
29. **Daily Closing Payment Summary**

### System

30. **Notification**
31. **Audit Log**
32. **Sync Operation**

---

# 3.45 One Important Design Choice

I **do not recommend adding entities such as Customer, Employee Commission, Purchase Order, Warehouse, Barcode, Loyalty Account, Credit Account, or Accounting Ledger** to Version 1.

Why?

Because they are not required by the business workflows we finalized.

Adding them now would make the system larger without solving an established business requirement.

We can add them later if the business actually needs them.

---

# 3.46 Step 3 Status

My proposed conclusion is:

> **This is the complete conceptual entity model for Gelana Inventory & Sales Management System Version 1.**





# STEP 4 — FINAL MODULE STRUCTURE

## 4.1 Purpose

The Gelana Inventory & Sales Management System Version 1 is divided into functional modules based on the finalized business workflows, business rules, and entity/data model.

Modules define the major functional areas of the system. Exact pages and screens will be defined separately in Step 5.

The module structure must be based on the business requirements and must not be constrained by the currently implemented software structure.

---

# 4.2 Version 1 Functional Modules

The system will contain the following primary modules:

1. Dashboard
2. Sales
3. Inventory
4. Transfers
5. Products & Categories
6. Suppliers & Receiving
7. Daily Closing
8. Reports
9. Users & Branches
10. Notifications
11. Settings

The system will also contain cross-cutting capabilities:

* Authentication & Authorization
* Offline & Synchronization
* Audit Logging
* Backup & Recovery

Cross-cutting capabilities support the main modules and are not necessarily presented as normal top-level business modules.

---

# 4.3 Dashboard Module

## Purpose

The Dashboard provides a high-level overview of the business or the employee's assigned branch.

## Owner Dashboard

The owner dashboard may display:

* Today's total sales
* Sales by branch
* Low-stock products
* Out-of-stock products
* Pending transfer requests
* Pending daily closings
* Important inventory discrepancies
* Recent important business activities
* Inventory summary
* Important business alerts

The owner dashboard provides shortcuts to relevant modules but is not intended to replace the actual transaction workflows.

## Employee Dashboard

The employee dashboard is limited to the employee's assigned branch and may display:

* Today's sales
* Employee's own sales
* Current branch stock
* Low-stock products
* Out-of-stock products
* Relevant pending actions
* Synchronization status

Employees must not receive information that their role is not authorized to access.

---

# 4.4 Sales Module

## Purpose

The Sales module records internal sales transactions after the physical sale/receipt process.

The existing physical receipt machine remains independent and is not replaced or integrated in Version 1.

## Main Responsibilities

* Create sales
* Add products to a sale
* Select selling unit
* Enter quantities
* Calculate line totals
* Calculate sale totals
* Apply permitted discounts
* Select configured payment methods
* Support split payments
* Confirm completed sales
* View sales history
* View sale details
* Record sales returns
* Handle permitted sales corrections
* Handle permitted sale voids

## Owner Capabilities

The owner can additionally:

* View sales across all branches
* Filter sales
* Review sales by branch
* Review sales by employee
* Review returns
* Correct or void completed sales according to business rules
* Investigate sales activity

## Employee Capabilities

Employees can:

* Record sales
* View their own sales history
* Record permitted sales returns
* Correct straightforward data-entry mistakes according to the established correction rules

Employees cannot freely modify or delete completed sales.

---

# 4.5 Inventory Module

## Purpose

The Inventory module manages and monitors physical stock at each branch.

## Main Responsibilities

* View current stock
* View stock movement history
* Receive stock
* Perform stock adjustments
* Perform stocktakes
* Monitor damaged stock
* Dispose/write off damaged stock
* View inventory valuation
* Monitor low-stock products
* Monitor out-of-stock products

## Employee Capabilities

Employees can:

* View inventory for their assigned branch
* View available quantities
* View selling prices
* View low-stock status
* View out-of-stock status
* Notify/request owner action where appropriate

Employees cannot:

* Receive stock
* Adjust stock
* Perform inventory write-offs
* Directly modify inventory quantities

## Owner Capabilities

The owner can:

* View inventory for all branches
* Receive stock
* Perform authorized stock adjustments
* Perform stocktakes
* Manage damaged stock
* Dispose/write off damaged stock
* View complete inventory movement history
* View inventory valuation
* Investigate discrepancies

All material inventory changes must remain traceable.

---

# 4.6 Transfers Module

## Purpose

The Transfers module manages requests and physical movement of stock between branches.

A transfer request and stock transfer are treated as one workflow.

## Transfer Lifecycle

The standard lifecycle is:

REQUESTED → APPROVED → DISPATCHED → RECEIVED → COMPLETED

Rejected requests follow:

REQUESTED → REJECTED

## Main Responsibilities

* Create transfer requests
* View transfer requests
* Approve transfers
* Reject transfers
* Approve partial transfers
* Dispatch transfers
* Record received quantities
* Track in-transit stock
* Record transfer discrepancies
* Resolve transfer discrepancies
* View transfer history
* Cancel approved transfers before dispatch where permitted

## Employee Capabilities

Employees can:

* Request stock from another branch
* View relevant transfer requests
* View transfer status
* Record actual received quantities when receiving a transfer

Employees cannot approve or reject transfers.

## Owner Capabilities

The owner can:

* Create transfers directly
* Approve transfer requests
* Reject transfer requests
* Approve partial quantities
* Dispatch transfers
* Monitor transfers
* Review discrepancies
* Resolve transfer discrepancies
* Cancel approved transfers before dispatch where permitted

Approval does not itself change inventory.

Source inventory decreases when goods are dispatched.

Destination inventory increases when goods are actually received.

---

# 4.7 Products & Categories Module

## Purpose

The Products & Categories module manages the business product catalog.

## Product Responsibilities

* Create products
* View products
* Edit products
* Activate/deactivate products
* Manage product units
* Manage selling prices
* Search products
* Filter products
* View product information and history

## Category Responsibilities

* Create categories
* Edit categories
* Activate/deactivate categories
* View categories

## Product Rules

* Products require a category.
* SKU is automatically generated by the system.
* SKU must be unique.
* Product name is required.
* Brand is optional.
* Description is optional.
* Image is optional.
* Products can be active or inactive.
* Inactive products remain in historical records.
* Inactive products cannot be used for normal new sales or receiving.
* Product selling price is global across branches in Version 1.
* Product units and conversion rules must preserve historical transaction integrity.

## Access

Product and category management is owner-only.

Employees may use product information required for sales and inventory viewing but cannot manage the product catalog.

---

# 4.8 Suppliers & Receiving Module

## Purpose

This module manages suppliers and stock-receiving transactions.

## Supplier Responsibilities

* Create suppliers
* Edit suppliers
* Activate/deactivate suppliers
* View suppliers
* View supplier receiving history

Supplier information may include:

* Name
* Phone
* Address/location
* Contact person
* Notes
* Active/inactive status

Supplier name is required.

Inactive suppliers remain visible in historical records.

## Receiving Responsibilities

* Create receiving transactions
* Select supplier
* Select destination branch
* Add multiple products
* Enter quantities
* Enter purchase costs
* Enter supplier invoice/reference number when available
* Confirm receiving
* View receiving history
* View individual receiving details
* View purchase-cost information

One receiving transaction belongs to one supplier.

Different suppliers require separate receiving transactions.

## Access

Receiving is owner-controlled.

Employees cannot receive stock.

---

# 4.9 Daily Closing Module

## Purpose

The Daily Closing module manages the formal end-of-day reconciliation process for each branch.

Each branch has its own daily closing.

## Employee Responsibilities

Employees can:

* Review the current business day's recorded sales
* Review payment totals
* Enter physically counted cash
* Enter discrepancy explanations when required
* Submit the daily closing

Before submission, the system must show:

* Total sales
* Payment-method totals
* Expected cash
* Actual counted cash
* Cash discrepancy
* Required explanation

## Owner Responsibilities

The owner can:

* View submitted closings
* Review closing information
* Review payment reconciliation
* Review discrepancies
* Approve closings
* Reject closings
* Request corrections
* View historical closings
* Authorize corrections to closed days according to business rules

## Closing Restrictions

A closing cannot be completed if:

* Required sales have not been entered
* Required offline data remains pending synchronization

Once approved, a closing is locked from normal employee editing.

Later changes require owner-authorized correction and permanent history.

---

# 4.10 Reports Module

## Purpose

The Reports module provides business analysis and historical reporting, primarily for the owner.

Reports must respect role and branch permissions.

## Sales Reports

The system will support:

* Total sales
* Transaction count
* Sales by branch
* Sales by employee
* Sales by product
* Sales by payment method
* Best-selling products
* Sales trends
* Day/week/month/custom date-range analysis

## Inventory Reports

The system will support:

* Current stock
* Low-stock products
* Out-of-stock products
* Stock movement
* Inventory valuation
* Stocktake discrepancies
* Damaged stock
* Purchase/receiving history

## Profit Reports

The system will support:

* Gross profit
* Gross margin
* Profit by branch
* Profit by product
* Date-range profit analysis

Profit calculations use the approved Weighted Average Cost method.

Historical sales must preserve their applicable cost basis and selling price.

## Closing Reports

The system will support:

* Daily closing history
* Closing discrepancies
* Payment reconciliation
* Branch closing history

## Export

Owner-accessible reports should support export where appropriate.

---

# 4.11 Users & Branches Module

## Purpose

This module manages employees, user access, and physical business branches.

## User Management

The owner can:

* Create employees
* Edit employee information
* Assign employees to branches
* Change branch assignments
* View employee information
* Deactivate employees
* Reset employee passwords
* View employee activity where authorized

Employee branch assignment history must be preserved.

## Branch Management

The owner can:

* Create branches
* Edit branch information
* Activate/deactivate branches
* View branch information

Branch information may include:

* Branch name
* Branch code
* Address/location
* Phone
* Active/inactive status

Branches are deactivated rather than deleted.

The owner can work across all branches.

---

# 4.12 Notifications Module

## Purpose

The Notifications module communicates important business and system events to relevant users.

The system must not notify the owner about every individual sale.

## Owner Notifications

Examples include:

* New transfer request
* Low-stock condition
* Out-of-stock condition
* Daily closing awaiting approval
* Significant cash discrepancy
* Important inventory discrepancy
* Important correction
* Important return
* Other critical business events

## Employee Notifications

Employees receive only notifications relevant to their assigned branch and responsibilities.

Examples include:

* Transfer approved
* Transfer rejected
* Important branch notification
* Required synchronization/action

## Notification Priorities

Notifications use:

* Informational
* Important
* Critical

Important notifications remain available until opened or acknowledged according to system behavior.

Notification history is separate from the audit log.

---

# 4.13 Settings Module

## Purpose

The Settings module manages system-level and business configuration.

## Configuration Areas

Potential settings include:

### Business Settings

* Business information
* Business-day-related configuration where applicable

### Payment Methods

Owner can configure:

* Cash
* Telebirr
* Bank
* Other supported payment methods

Employees can select only configured active payment methods.

### System Settings

May include:

* Synchronization behavior
* Backup configuration
* Other system-level settings

Technical configuration must not expose unnecessary technical complexity to ordinary employees.

---

# 4.14 Authentication & Authorization

Authentication and authorization are cross-cutting system capabilities rather than a normal business module.

They provide:

* Login
* Logout
* Session management
* Password handling
* Role authorization
* Branch-based authorization
* Owner authorization
* Employee access restrictions

The Version 1 roles are:

* OWNER
* EMPLOYEE

The system must enforce permissions consistently across all modules.

---

# 4.15 Offline & Synchronization

Offline operation and synchronization are cross-cutting system capabilities.

They support the modules that require offline operation, particularly:

* Sales
* Transfer requests
* Daily closing-related workflows
* Other approved offline operations

The system must provide clear synchronization states such as:

* Online / All synced
* Offline / Pending changes
* Sync pending
* Syncing
* Sync failed

When internet connectivity returns, the system may prompt:

"Internet connection detected. Would you like to synchronize now?"

Available actions:

* Sync Now
* Sync Later

Pending data required for daily closing must be synchronized before closing can be completed.

The technical implementation of offline storage and synchronization will be defined during the later technical architecture stage.

---

# 4.16 Audit Logging

Audit logging is a cross-cutting system capability.

Important business actions must record:

* Who performed the action
* What action was performed
* What entity was affected
* When it occurred
* Relevant previous state
* Relevant resulting state
* Reason where required

Audit history is permanent and must not be freely deleted.

Corrections create additional historical records rather than silently overwriting the original action.

---

# 4.17 Backup & Recovery

Database backup and recovery are required system capabilities.

The system must support reliable recovery of business data.

Exact technical decisions regarding:

* Backup frequency
* Backup retention
* Backup storage
* Recovery procedures
* Automated backup implementation

will be finalized during technical architecture and implementation planning.

---

# 4.18 Module Dependency Overview

The major functional relationships are:

Dashboard
→ provides overview and shortcuts to other modules.

Products & Categories
→ defines the product catalog used by Inventory, Sales, Receiving, and Transfers.

Suppliers & Receiving
→ introduces stock into branch inventory.

Inventory
→ tracks current stock and historical stock movement.

Sales
→ decreases available stock and creates sales/payment records.

Sales
→ connects to Returns for returned products.

Transfers
→ moves stock between branches.

Daily Closing
→ reconciles branch sales and payments.

Reports
→ reads historical data from Sales, Inventory, Receiving, Transfers, Returns, and Daily Closing.

Users & Branches
→ controls access and branch ownership throughout the system.

Notifications
→ communicates important events generated by other modules.

Authentication & Authorization
→ controls access to every protected module.

Offline & Synchronization
→ supports approved offline operations across relevant modules.

Audit Logging
→ records important actions across the system.

---

# 4.19 Final Version 1 Module List

The approved Version 1 functional module structure is:

1. Dashboard
2. Sales
3. Inventory
4. Transfers
5. Products & Categories
6. Suppliers & Receiving
7. Daily Closing
8. Reports
9. Users & Branches
10. Notifications
11. Settings

Cross-cutting capabilities:

* Authentication & Authorization
* Offline & Synchronization
* Audit Logging
* Backup & Recovery

---

# 4.20 Design Principle

The module structure must remain aligned with the finalized business workflows, business rules, and entity/data model.

A new module should not be introduced merely because a technical implementation seems to require one.

Likewise, technical implementation details should not force unnecessary business modules into the user interface.

The next design stage is Step 5: Exact Pages/Screens.






# STEP 5 — FINAL EXACT PAGES / SCREENS

## 5.1 Purpose

This document defines the exact Version 1 pages/screens for the Gelana Inventory & Sales Management System.

The purpose is to determine the complete user-facing screen structure before UI design in Stitch begins.

Pages are based on:

* Finalized business workflows
* Finalized business rules
* Finalized entity/data model
* Finalized module structure
* Owner and employee responsibilities
* Practical usability for a medium-scale physical stationery business

The goal is to provide enough screens to perform every required business operation without creating unnecessary pages.

---

# 5.2 General Screen Design Principles

## Principle 1 — Do Not Create a Page for Every Action

Small actions should normally be handled inside an existing page using:

* Buttons
* Dialogs
* Confirmation dialogs
* Drawers
* Inline forms
* Tabs
* Filters
* Detail panels

For example, creating a category does not require a completely separate navigation page.

---

## Principle 2 — List + Detail + Action Pattern

Most operational areas should follow:

```text
List Page
   ↓
Detail Page
   ↓
Action / Edit / Workflow
```

Example:

```text
Products
   ↓
Product Details
   ↓
Edit Product
```

---

## Principle 3 — Transaction Creation Gets a Dedicated Workflow Screen

Important transactions should have dedicated creation screens because they involve multiple fields, validation, and confirmation.

Examples:

* New Sale
* New Receiving
* New Transfer Request
* Stock Adjustment
* Daily Closing

---

## Principle 4 — Destructive or Important Actions Use Confirmation

Actions such as:

* Void sale
* Reject transfer
* Cancel transfer
* Deactivate product
* Deactivate employee
* Dispose damaged stock

should use confirmation dialogs and require reasons where business rules require them.

---

# 5.3 Navigation Structure

The exact navigation will be finalized in Step 6, but the pages are organized into the following functional areas:

```text
Dashboard

Sales
  - Sales History
  - New Sale
  - Sale Details
  - Returns
  - Return Details

Inventory
  - Current Stock
  - Stock Movement
  - Receiving
  - New Receiving
  - Receiving Details
  - Stock Adjustments
  - Stock Adjustment Details
  - Stocktakes
  - New Stocktake
  - Stocktake Details
  - Damaged Stock
  - Stock Disposals
  - Inventory Valuation

Transfers
  - Transfer List
  - Transfer Details
  - New Transfer Request

Products & Categories
  - Products
  - Product Details
  - Categories

Suppliers & Receiving
  - Suppliers
  - Supplier Details
  - Receiving
  - New Receiving
  - Receiving Details

Daily Closing
  - Current Closing
  - Closing History
  - Closing Details

Reports
  - Sales Reports
  - Inventory Reports
  - Profit Reports
  - Closing Reports

Users & Branches
  - Employees
  - Employee Details
  - Branches
  - Branch Details

Notifications
  - Notifications

Settings
  - General Settings
  - Payment Methods
  - Account / Security
```

Some of these pages can be combined during implementation if doing so produces a cleaner UX. The list below defines the required user-facing capabilities, not an instruction to create unnecessary route files.

---

# 5.4 Authentication Screens

## Screen 1 — Login

Purpose:

Allow Owner and Employees to securely access the system.

Contents:

* Email/username
* Password
* Login button
* Error messages
* Account/session feedback

The login screen must not expose business information before authentication.

---

# 5.5 Dashboard Screens

## Screen 2 — Owner Dashboard

Purpose:

Provide the owner with an immediate overview of the entire business.

Main information:

* Today's total sales
* Sales by branch
* Current inventory summary
* Low-stock products
* Out-of-stock products
* Pending transfer requests
* Pending daily closings
* Important discrepancies
* Important notifications
* Recent important activities
* Synchronization/system status

The dashboard should prioritize actionable information rather than displaying every available statistic.

---

## Screen 3 — Employee Dashboard

Purpose:

Provide an employee with a simple operational overview of their assigned branch.

Main information:

* Today's own sales
* Branch sales summary where permitted
* Current branch stock
* Low-stock products
* Out-of-stock products
* Relevant transfer status
* Relevant notifications
* Synchronization status

Employees must not see owner-only information such as:

* Purchase costs
* Gross profit
* Other employees' private sales information
* Unrelated branch management information

---

# 5.6 SALES SCREENS

## Screen 4 — Sales History

Purpose:

Display sales that the current user is authorized to view.

Employee view:

* Their own sales
* Relevant branch information
* Date/time
* Sale number
* Total
* Status

Owner view:

* All branches
* Employee
* Product
* Payment method
* Date range
* Sale number
* Status
* Total

Useful filters:

* Date
* Branch
* Employee
* Status
* Payment method

---

## Screen 5 — New Sale

Purpose:

Create a sale.

Main workflow:

```text
Search Product
      ↓
Select Product
      ↓
Select Unit
      ↓
Enter Quantity
      ↓
Review Available Stock
      ↓
Add More Items
      ↓
Apply Permitted Discount
      ↓
Review Total
      ↓
Select Payment Method(s)
      ↓
Confirm Sale
```

The screen must display:

* Product search
* SKU
* Product name
* Available quantity
* Selling unit
* Quantity
* Selling price
* Line total
* Discount
* Grand total
* Payment section
* Remaining amount
* Excess amount when applicable
* Sale confirmation

The system must block confirmation when:

* Requested stock exceeds available stock
* Payment total does not equal the sale total
* Required information is missing

The employee must not freely change the configured product price.

---

## Screen 6 — Sale Details

Purpose:

Display a completed sale in detail.

Information:

* Sale number
* Date/time
* Branch
* Employee
* Products
* Units
* Quantities
* Actual selling prices
* Discounts
* Total
* Payment methods
* Payment amounts
* Status
* Related returns
* Related corrections/voids

Owner-only actions may include:

* Correct sale
* Void sale
* View audit information

---

## Screen 7 — Sales Returns

Purpose:

Manage and view sales returns.

The page can contain:

* Return history
* Search
* Filters
* Return number
* Original sale number
* Product
* Quantity
* Refund amount
* Condition
* Processor
* Date
* Status

The employee can access the return workflow according to established permissions.

---

## Screen 8 — New Sales Return

Purpose:

Record a returned product.

Workflow:

```text
Find Original Sale
      ↓
Select Sale Item
      ↓
Enter Return Quantity
      ↓
Select Condition
      ↓
Calculate Refund
      ↓
Select Refund Payment Method
      ↓
Review
      ↓
Confirm Return
```

Conditions:

* Sellable
* Damaged

The system must prevent returning more than the remaining unreturned quantity.

If no original system sale exists, the workflow must require owner authorization and a reason.

---

## Screen 9 — Return Details

Purpose:

Display a completed return.

Information:

* Return number
* Original sale
* Product(s)
* Quantity returned
* Condition
* Refund amount
* Refund payment method
* Processor
* Date/time
* Inventory effect
* Related audit information

---

# 5.7 INVENTORY SCREENS

## Screen 10 — Current Stock

Purpose:

Provide a current view of inventory.

Owner view:

* All branches
* Product
* Available quantity
* Damaged quantity
* Minimum threshold
* Stock status
* Branch
* Selling price where relevant

Employee view:

* Assigned branch only
* Available quantity
* Stock status
* Selling price

Filters:

* Branch
* Product
* Category
* Brand
* Stock status

---

## Screen 11 — Stock Movement

Purpose:

Show the complete inventory movement history.

Each movement should show:

* Movement ID
* Date/time
* Branch
* Product
* Movement type
* Quantity
* Before quantity
* After quantity
* Related transaction
* User
* Reason where applicable

Owner can filter by:

* Branch
* Product
* Movement type
* Date range
* User

Employees see only authorized branch history.

---

## Screen 12 — Receiving History

Purpose:

Display previous stock receiving transactions.

Information:

* Receiving number
* Supplier
* Destination branch
* Date
* Total items
* Total cost where authorized
* Created by
* Status

Owner can search and filter receiving history.

---

## Screen 13 — New Receiving

Purpose:

Allow the owner to receive stock into a branch.

Workflow:

```text
Select Destination Branch
      ↓
Select Supplier
      ↓
Enter Invoice/Reference if available
      ↓
Add Products
      ↓
Enter Quantities
      ↓
Enter Purchase Costs
      ↓
Review Total Cost
      ↓
Confirm Receiving
```

One receiving transaction can contain multiple products but only one supplier.

Receiving must immediately create the appropriate inventory and cost records after confirmation.

---

## Screen 14 — Receiving Details

Purpose:

Display a receiving transaction.

Information:

* Receiving number
* Supplier
* Branch
* Date/time
* Invoice/reference
* Products
* Quantities
* Units
* Purchase costs
* Total cost
* User
* Related inventory movements
* Cost information

Purchase-cost information is owner-only.

---

## Screen 15 — Stock Adjustments

Purpose:

Display historical stock adjustments.

Information:

* Adjustment number
* Branch
* Product
* Before quantity
* Adjustment quantity
* After quantity
* Reason
* User
* Date/time
* Related stocktake if applicable

Owner-only management.

---

## Screen 16 — New Stock Adjustment

Purpose:

Allow the owner to manually adjust inventory.

Fields:

* Branch
* Product
* Current quantity
* Adjustment quantity
* Resulting quantity
* Reason

The system must:

* Require a reason
* Prevent negative inventory
* Show before/after quantities
* Create a permanent inventory movement
* Create an audit record

No second approval is required.

---

## Screen 17 — Stock Adjustment Details

Purpose:

Display a specific adjustment and its complete history.

Information:

* Adjustment number
* Product
* Branch
* Before quantity
* Adjustment
* After quantity
* Reason
* User
* Date/time
* Related stock movement
* Audit information

---

## Screen 18 — Stocktakes

Purpose:

Display stocktake history and current stocktake activities.

Information:

* Stocktake number
* Branch
* Date
* Status
* Created by
* Number of products
* Number of discrepancies

---

## Screen 19 — New Stocktake

Purpose:

Allow the owner to begin a physical stock count.

Workflow:

```text
Select Branch
      ↓
Select Products / Stocktake Scope
      ↓
System Quantities Displayed
      ↓
Enter Physical Quantities
      ↓
Calculate Differences
      ↓
Review
      ↓
Complete Stocktake
```

A stocktake does not silently change inventory.

Where an adjustment is required, the system creates an authorized stock adjustment with a reason and permanent history.

---

## Screen 20 — Stocktake Details

Purpose:

Display the results of a stocktake.

Information:

* Branch
* Date
* Product
* System quantity
* Physical quantity
* Difference
* Reason
* Related adjustment
* User
* Status

---

## Screen 21 — Damaged Stock

Purpose:

Display products currently classified as damaged/not sellable.

Information:

* Branch
* Product
* Damaged quantity
* Date/history
* Source
* Related transactions

Owner can investigate damaged inventory and initiate disposal.

---

## Screen 22 — Stock Disposal

Purpose:

Display stock disposal/write-off history.

Information:

* Disposal number
* Branch
* Product
* Quantity
* Reason
* User
* Date/time
* Remaining damaged stock

Owner can initiate a new disposal through this area.

---

## Screen 23 — Inventory Valuation

Purpose:

Provide the owner with the current monetary valuation of inventory.

Information may include:

* Branch
* Product
* Available quantity
* Weighted average cost
* Inventory value
* Total inventory value

Employees must not access purchase-cost or valuation information.

---

# 5.8 TRANSFER SCREENS

## Screen 24 — Transfer List

Purpose:

Display stock transfer requests and transfers.

Information:

* Transfer number
* Source branch
* Destination branch
* Requested by
* Date
* Status
* Quantity/items
* Priority where applicable

Owner can view all transfers.

Employees see relevant transfers only.

Filters:

* Status
* Source branch
* Destination branch
* Date
* Requester

---

## Screen 25 — New Transfer Request

Purpose:

Allow an employee or owner to initiate a stock transfer.

Workflow:

```text
Select Source Branch
      ↓
Select Destination Branch
      ↓
Add Products
      ↓
Enter Requested Quantities
      ↓
Review
      ↓
Submit Request
```

The request itself does not change inventory.

---

## Screen 26 — Transfer Details

Purpose:

Provide the complete transfer lifecycle in one place.

Information:

* Transfer number
* Source branch
* Destination branch
* Requested quantity
* Approved quantity
* Dispatched quantity
* Received quantity
* Discrepancy quantity
* Status
* Requester
* Approver
* Dates/times
* Reasons
* Related inventory movements

Owner actions may include:

* Approve
* Partially approve
* Reject
* Dispatch
* Cancel before dispatch
* Review discrepancy
* Resolve discrepancy

Employee actions may include:

* Submit request
* View status
* Record actual received quantity

Approval and physical receipt must remain separate stages.

---

# 5.9 PRODUCTS & CATEGORIES SCREENS

## Screen 27 — Products

Purpose:

Display the product catalog.

Information:

* Product name
* SKU
* Category
* Brand
* Base unit
* Current selling price
* Status
* Stock summary where authorized

Search:

* Product name
* SKU

Filters:

* Category
* Brand
* Status

Owner can manage products.

Employees may have read-only access to product information required for their workflows.

---

## Screen 28 — New Product / Edit Product

Purpose:

Create or edit product information.

Fields:

* Product name
* Category
* Brand
* Description
* Image
* Base unit
* Alternate unit
* Conversion quantity
* Minimum stock threshold
* Selling price
* Active/inactive status

SKU is generated by the system and is not manually entered by the owner.

Creating a product does not automatically create stock.

---

## Screen 29 — Product Details

Purpose:

Provide a complete view of one product.

Information:

* Product information
* SKU
* Category
* Brand
* Units
* Current selling price
* Price history
* Stock by branch for owner
* Stock status
* Inventory movement history
* Receiving history
* Sales history where authorized
* Cost information for owner
* Product active/inactive status

The employee version must hide owner-only information.

---

## Screen 30 — Categories

Purpose:

Manage product categories.

Capabilities:

* View categories
* Search
* Create
* Edit
* Activate/deactivate

Category creation/editing can use a modal or drawer rather than requiring a separate page.

---

# 5.10 SUPPLIERS SCREENS

## Screen 31 — Suppliers

Purpose:

Display supplier records.

Information:

* Supplier name
* Contact person
* Phone
* Location
* Status
* Receiving history summary

Actions:

* Add supplier
* Edit supplier
* Activate/deactivate
* View supplier details

---

## Screen 32 — Supplier Details

Purpose:

Display one supplier and its relationship with the business.

Information:

* Supplier information
* Active/inactive status
* Receiving history
* Total receiving activity
* Related invoice/reference numbers

Purchase costs are owner-only.

---

## Screen 33 — New/Edit Supplier

Purpose:

Create or update supplier information.

Fields:

* Supplier name
* Phone
* Address/location
* Contact person
* Notes
* Active status

Supplier name is required.

This may be implemented as a modal/drawer from the Suppliers page instead of a standalone route.

---

# 5.11 DAILY CLOSING SCREENS

## Screen 34 — Current Daily Closing

Purpose:

Manage the current branch's business-day closing.

Employee view:

* Business date
* Total sales
* Payment totals
* Expected cash
* Actual cash input
* Cash discrepancy
* Explanation
* Pending sales warning
* Pending synchronization warning
* Submit closing

Owner view may additionally show:

* Branch
* Submitted status
* Review status
* Discrepancies
* Approval/rejection controls

The system must block submission where required sales or pending offline data remain unresolved.

---

## Screen 35 — Closing History

Purpose:

Display previous branch/business closings.

Owner can filter by:

* Branch
* Date
* Status
* Employee
* Discrepancy

Employees can view only authorized closing history.

---

## Screen 36 — Closing Details

Purpose:

Display a specific closing.

Information:

* Branch
* Business date
* Submitted by
* Submission time
* Sales totals
* Payment method totals
* Expected cash
* Actual cash
* Discrepancy
* Explanation
* Owner review
* Approval/rejection
* Correction history

Owner can approve or reject submitted closings according to the business workflow.

---

# 5.12 REPORT SCREENS

## Screen 37 — Sales Reports

Purpose:

Provide owner-level sales analysis.

Filters:

* Date range
* Branch
* Employee
* Product
* Payment method

Views:

* Total sales
* Transaction count
* Sales by branch
* Sales by employee
* Sales by product
* Sales by payment method
* Best-selling products
* Trends

---

## Screen 38 — Inventory Reports

Purpose:

Provide owner-level inventory analysis.

Reports:

* Current stock
* Low stock
* Out of stock
* Stock movement
* Inventory valuation
* Stocktake discrepancies
* Damaged stock
* Purchase/receiving

---

## Screen 39 — Profit Reports

Purpose:

Provide owner-only profitability analysis.

Reports:

* Gross profit
* Gross margin
* Profit by branch
* Profit by product
* Date-range profit

Profit uses the approved Weighted Average Cost methodology.

Employees cannot access this page.

---

## Screen 40 — Closing Reports

Purpose:

Provide owner-level daily closing analysis.

Reports:

* Closing history
* Branch closing comparison
* Cash discrepancies
* Payment reconciliation
* Pending/approved/rejected closings

---

# 5.13 USERS & BRANCHES SCREENS

## Screen 41 — Employees

Purpose:

Manage employees.

Information:

* Name
* Username/email
* Assigned branch
* Status
* Role
* Account information

Owner actions:

* Create employee
* Edit employee
* Assign/change branch
* Deactivate employee
* Reset password
* View employee activity

---

## Screen 42 — Employee Details

Purpose:

Display employee information and authorized activity.

Information:

* Employee information
* Current branch
* Branch assignment history
* Account status
* Relevant sales/activity history

Sensitive information must be protected.

---

## Screen 43 — New/Edit Employee

Purpose:

Create or update an employee account.

Fields:

* Name
* Email/username
* Initial password or password setup
* Assigned branch
* Active status

Role is Employee for employee accounts.

Owner accounts are not created through ordinary employee creation.

---

## Screen 44 — Branches

Purpose:

Manage the physical business branches.

Information:

* Branch name
* Branch code
* Location
* Phone
* Active/inactive status

Owner actions:

* Create branch
* Edit branch
* Activate/deactivate
* View branch details

---

## Screen 45 — Branch Details

Purpose:

Display information and operational summary for one branch.

Information:

* Branch information
* Employees
* Current inventory summary
* Sales summary
* Transfer activity
* Daily closing history
* Important branch activity

Owner-only.

---

# 5.14 NOTIFICATIONS SCREEN

## Screen 46 — Notifications

Purpose:

Provide a central location for important and critical system/business notifications.

Information:

* Notification priority
* Title
* Message
* Date/time
* Read/acknowledged state
* Related module/entity

Filters may include:

* All
* Unread
* Important
* Critical

Selecting a notification should take the user to the relevant page or transaction where appropriate.

Notification history is separate from audit history.

---

# 5.15 SETTINGS SCREENS

## Screen 47 — General Settings

Purpose:

Manage basic system/business configuration.

Potential information:

* Business information
* General configuration
* Business-day-related settings where applicable

Only authorized users can modify settings.

---

## Screen 48 — Payment Methods

Purpose:

Allow the owner to manage available payment methods.

Capabilities:

* View payment methods
* Add payment method
* Edit payment method
* Activate/deactivate payment method

Employees can only select active configured payment methods during sales.

---

## Screen 49 — Account & Security

Purpose:

Allow the current user to manage their account/security-related settings where permitted.

Potential capabilities:

* View account information
* Change password
* Security/session actions
* Logout

---

# 5.16 SYSTEM-LEVEL UI

The following should generally NOT become separate top-level pages.

## Synchronization Status

Synchronization should be visible globally through the application interface.

Examples:

```text
Online — All synced
```

```text
Offline — 3 changes pending
```

```text
Internet available — Sync pending
```

```text
Syncing — 2 remaining
```

```text
Sync failed — Retry
```

The user can access synchronization actions from the global status indicator.

---

## Audit Information

Audit information should normally appear inside relevant detail pages rather than requiring ordinary users to navigate to an independent Audit module.

For example:

Sale Details
→ Correction History
→ Audit Information

Transfer Details
→ Approval History
→ Audit Information

Stock Adjustment Details
→ Audit Information

A dedicated owner-only audit viewer may be introduced if required by the final UI design, but it is not necessary as a primary Version 1 navigation item.

---

# 5.17 Pages That Should NOT Be Created

To keep the application simple and professional, Version 1 should not create unnecessary standalone pages for:

* Add Category
* Add Payment Method
* Add Supplier
* Add Product Unit
* Add Price
* Add Discount
* Add Sale Payment
* Add Return Item
* Add Transfer Item
* Add Stocktake Item
* Add Audit Record
* Sync Queue
* Inventory Movement Creation

These are actions performed inside their parent workflows using forms, dialogs, drawers, or inline components.

---

# 5.18 Final Page Count

The proposed Version 1 user-facing screen structure contains approximately:

### Authentication

1. Login

### Dashboard

2. Owner Dashboard
3. Employee Dashboard

### Sales

4. Sales History
5. New Sale
6. Sale Details
7. Sales Returns
8. New Sales Return
9. Return Details

### Inventory

10. Current Stock
11. Stock Movement
12. Receiving History
13. New Receiving
14. Receiving Details
15. Stock Adjustments
16. New Stock Adjustment
17. Stock Adjustment Details
18. Stocktakes
19. New Stocktake
20. Stocktake Details
21. Damaged Stock
22. Stock Disposal
23. Inventory Valuation

### Transfers

24. Transfer List
25. New Transfer Request
26. Transfer Details

### Products & Categories

27. Products
28. New/Edit Product
29. Product Details
30. Categories

### Suppliers

31. Suppliers
32. Supplier Details
33. New/Edit Supplier

### Daily Closing

34. Current Daily Closing
35. Closing History
36. Closing Details

### Reports

37. Sales Reports
38. Inventory Reports
39. Profit Reports
40. Closing Reports

### Users & Branches

41. Employees
42. Employee Details
43. New/Edit Employee
44. Branches
45. Branch Details

### Notifications

46. Notifications

### Settings

47. General Settings
48. Payment Methods
49. Account & Security

Therefore, the conceptual Version 1 design contains **49 screens/capabilities**, but not all 49 need to become separate application routes.

Some are intentionally designed as:

* Modal
* Drawer
* Tab
* Embedded workflow
* Detail section

This keeps navigation much simpler than creating 49 independent menu items.

---

# 5.19 Recommended Primary Navigation

The eventual navigation should expose only the major functional areas.

The exact permission-based navigation will be finalized in Step 6, but the likely structure is:

## Owner

```text
Dashboard
Sales
Inventory
Transfers
Products
Suppliers
Closing
Reports
Users & Branches
Notifications
Settings
```

## Employee

```text
Dashboard
Sales
Inventory
Transfers
Closing
Notifications
```

Employees should not see owner-only navigation items such as:

* Reports
* Users & Branches
* Supplier management
* Receiving management
* Stock adjustments
* Inventory valuation
* Profit reports
* Branch management

Where an employee needs a related function, it should be presented inside the relevant permitted workflow.

---

# 5.20 UX Principle for Owner vs Employee

The application should not simply show every page to every user and then display permission errors.

Instead:

> **The interface should primarily expose what the current user is allowed to do.**

For example, an employee should not see:

```text
Profit Reports
Purchase Costs
Stock Adjustment
Employee Management
Branch Management
```

in their primary navigation.

This reduces confusion and makes the system easier for the business to use.

Authorization must still be enforced on the backend even when an item is hidden from the interface.

---

# 5.21 Final Page Architecture

The complete user-facing structure is therefore:

```text
AUTHENTICATION
└── Login

DASHBOARD
├── Owner Dashboard
└── Employee Dashboard

SALES
├── Sales History
├── New Sale
├── Sale Details
├── Sales Returns
├── New Sales Return
└── Return Details

INVENTORY
├── Current Stock
├── Stock Movement
├── Receiving History
├── New Receiving
├── Receiving Details
├── Stock Adjustments
├── New Stock Adjustment
├── Stock Adjustment Details
├── Stocktakes
├── New Stocktake
├── Stocktake Details
├── Damaged Stock
├── Stock Disposal
└── Inventory Valuation

TRANSFERS
├── Transfer List
├── New Transfer Request
└── Transfer Details

PRODUCTS & CATEGORIES
├── Products
├── New/Edit Product
├── Product Details
└── Categories

SUPPLIERS
├── Suppliers
├── Supplier Details
└── New/Edit Supplier

DAILY CLOSING
├── Current Daily Closing
├── Closing History
└── Closing Details

REPORTS
├── Sales Reports
├── Inventory Reports
├── Profit Reports
└── Closing Reports

USERS & BRANCHES
├── Employees
├── Employee Details
├── New/Edit Employee
├── Branches
└── Branch Details

NOTIFICATIONS
└── Notifications

SETTINGS
├── General Settings
├── Payment Methods
└── Account & Security
```

---

# 5.22 Step 5 Completion Criteria

Step 5 is considered complete when:

* Every finalized business workflow has a corresponding user interface.
* Owner workflows have appropriate screens.
* Employee workflows have appropriate screens.
* No required business operation is missing.
* No unnecessary standalone pages have been introduced.
* Detail pages preserve access to relevant history.
* Transaction creation workflows are clearly separated from historical views.
* Owner-only information is separated from employee views.
* Offline/synchronization status has a global UI presence.
* Audit information is accessible where relevant.
* Navigation is not finalized yet; that is Step 6.

The next stage is:

**STEP 6 — FINAL NAVIGATION & PERMISSIONS**

Step 6 will determine:

* Exact sidebar/navigation structure
* Which pages each role can access
* Which actions each role can perform
* Page-level permissions
* Action-level permissions
* Branch-level restrictions
* Owner-only controls
* Employee restrictions
* What appears/doesn't appear in each interface
* Navigation behavior and hierarchy




# STEP 6 — FINAL NAVIGATION & PERMISSIONS

## 6.1 Purpose

This document defines the Version 1 navigation structure, page access, role permissions, branch restrictions, data visibility, and action-level permissions for the Gelana Inventory & Sales Management System.

The purpose is to ensure that:

* Each user sees only the areas relevant to their role.
* Employees can perform their operational responsibilities without accessing management functions.
* The owner has complete business visibility and control.
* Branch-specific data remains properly isolated for employees.
* Sensitive information such as purchase cost and profit is owner-only.
* Backend authorization remains enforced even when UI elements are hidden.
* Navigation remains simple enough for practical daily use.

Version 1 contains two application roles:

* OWNER
* EMPLOYEE

---

# 6.2 Authorization Principles

## Principle 1 — Role-Based Access

Access is determined primarily by the user's role.

The two Version 1 roles are:

* Owner
* Employee

No additional roles are introduced unless the business later requires them.

---

## Principle 2 — Branch-Based Access

Employees are assigned to one branch.

An employee can normally access operational information belonging to their assigned branch.

The owner can access all branches.

---

## Principle 3 — UI Restrictions Are Not Security

Hiding a button or navigation item does not provide security by itself.

The backend must independently enforce:

* Authentication
* Role authorization
* Branch authorization
* Action authorization
* Data visibility restrictions

An employee must not be able to access an unauthorized operation simply by manually calling an API.

---

## Principle 4 — Least Privilege

Users should receive the minimum access necessary to perform their responsibilities.

Employees should not be exposed to management functionality that they do not need.

---

## Principle 5 — Owner Authority

The owner has complete business-wide access subject to the established business rules.

However, owner authority does not mean unrestricted bypassing of business workflows.

Where a workflow requires:

* Approval
* Reason
* Audit record
* Correction
* Authorization

those requirements remain in place.

---

# 6.3 OWNER NAVIGATION

The owner should have the following primary navigation:

```text
Dashboard

Sales
  ├── Sales History
  └── Returns

Inventory
  ├── Current Stock
  ├── Stock Movement
  ├── Receiving
  ├── Stock Adjustments
  ├── Stocktakes
  ├── Damaged Stock
  └── Inventory Valuation

Transfers

Products & Categories

Suppliers

Daily Closing

Reports

Users & Branches

Notifications

Settings
```

The navigation should prioritize frequently used operational areas while keeping less frequently used management functions organized.

---

# 6.4 EMPLOYEE NAVIGATION

Employees should have a simpler navigation structure:

```text
Dashboard

Sales
  ├── New Sale
  ├── Sales History
  └── Returns

Inventory
  └── Current Stock

Transfers

Daily Closing

Notifications

Account / Security
```

Employees should not see owner-only navigation items such as:

* Reports
* Users & Branches
* Supplier management
* Receiving
* Stock adjustments
* Stocktakes
* Inventory valuation
* Product management
* Branch management
* Payment method configuration
* Owner-level settings

Employee navigation should focus on daily operational work.

---

# 6.5 GLOBAL NAVIGATION ELEMENTS

Both roles should have access to a consistent application shell containing, where applicable:

* Application/business identity
* Current user's name
* Current user's role
* Current branch for employees
* Navigation
* Notifications
* Synchronization status
* Account/security controls
* Logout

The current branch should be clearly visible to employees so they understand which branch's inventory and operations they are working with.

The owner should be able to identify the currently selected branch context when viewing branch-specific information.

---

# 6.6 DASHBOARD PERMISSIONS

| Action                       | Owner | Employee           |
| ---------------------------- | ----- | ------------------ |
| View dashboard               | Yes   | Yes                |
| View all-branch summary      | Yes   | No                 |
| View assigned branch summary | Yes   | Yes                |
| View own sales               | Yes   | Yes                |
| View all employee sales      | Yes   | No                 |
| View low-stock products      | Yes   | Yes                |
| View out-of-stock products   | Yes   | Yes                |
| View pending transfers       | Yes   | Relevant transfers |
| View pending closings        | Yes   | Own/current branch |
| View profit                  | Yes   | No                 |
| View purchase cost           | Yes   | No                 |
| View important notifications | Yes   | Relevant only      |

---

# 6.7 SALES PERMISSIONS

## Sales History

| Action                      | Owner        | Employee             |
| --------------------------- | ------------ | -------------------- |
| View sales history          | All branches | Own sales            |
| View sale details           | Yes          | Own sales            |
| Search sales                | Yes          | Own sales            |
| Filter by branch            | Yes          | No                   |
| Filter by employee          | Yes          | No                   |
| Filter by product           | Yes          | Authorized own sales |
| Filter by payment method    | Yes          | Authorized own sales |
| View other employees' sales | Yes          | No                   |
| View all branches' sales    | Yes          | No                   |

Employees can view their own sales history.

The owner can view business-wide sales.

---

## New Sale

| Action                       | Owner | Employee |
| ---------------------------- | ----- | -------- |
| Create sale                  | Yes   | Yes      |
| Add products                 | Yes   | Yes      |
| Select selling unit          | Yes   | Yes      |
| Enter quantity               | Yes   | Yes      |
| View available stock         | Yes   | Yes      |
| Apply permitted discount     | Yes   | Yes      |
| Freely change product price  | No    | No       |
| Configure payment method     | Yes   | No       |
| Select active payment method | Yes   | Yes      |
| Use split payment            | Yes   | Yes      |
| Confirm sale                 | Yes   | Yes      |
| Delete completed sale        | No    | No       |

The system uses the configured selling price.

Only the established owner price-management workflow can change the standard selling price.

---

## Sale Correction/Void

| Action                                                | Owner | Employee                       |
| ----------------------------------------------------- | ----- | ------------------------------ |
| Correct straightforward entry mistake before closing  | Yes   | Yes, within permitted workflow |
| Correct completed sale after normal correction window | Yes   | No                             |
| Void completed sale                                   | Yes   | No                             |
| Provide required correction reason                    | Yes   | Yes where required             |
| View correction history                               | Yes   | Relevant authorized history    |
| Delete original transaction                           | No    | No                             |

Original sales must remain preserved.

---

# 6.8 SALES RETURN PERMISSIONS

| Action                       | Owner                        | Employee                         |
| ---------------------------- | ---------------------------- | -------------------------------- |
| View authorized returns      | Yes                          | Relevant returns                 |
| Create return                | Yes                          | Yes, within established workflow |
| Find original sale           | Yes                          | Authorized sales                 |
| Return partial quantity      | Yes                          | Yes                              |
| Select condition             | Yes                          | Yes                              |
| Record refund amount         | Yes                          | Yes                              |
| Record refund payment method | Yes                          | Yes                              |
| Return without original sale | Owner authorization required | Cannot independently authorize   |
| Review return history        | Yes                          | Authorized relevant history      |
| Delete return                | No                           | No                               |

A return must never exceed the remaining unreturned quantity.

---

# 6.9 INVENTORY PERMISSIONS

## Current Stock

| Action                   | Owner        | Employee                       |
| ------------------------ | ------------ | ------------------------------ |
| View current stock       | All branches | Assigned branch                |
| View available quantity  | Yes          | Yes                            |
| View damaged quantity    | Yes          | Appropriate branch information |
| View low-stock status    | Yes          | Yes                            |
| View out-of-stock status | Yes          | Yes                            |
| View minimum threshold   | Yes          | Yes where appropriate          |
| View purchase cost       | Yes          | No                             |
| View inventory valuation | Yes          | No                             |
| Modify quantity directly | No           | No                             |

Inventory quantities must be changed through approved inventory workflows.

---

## Stock Movement

| Action                          | Owner        | Employee                  |
| ------------------------------- | ------------ | ------------------------- |
| View movement history           | All branches | Assigned branch           |
| Filter by branch                | Yes          | No                        |
| Filter by product               | Yes          | Yes within branch         |
| Filter by movement type         | Yes          | Authorized branch history |
| Filter by user                  | Yes          | No                        |
| View purchase-cost information  | Yes          | No                        |
| View complete inventory history | Yes          | No                        |

Employees must not see sensitive management/cost information.

---

# 6.10 RECEIVING PERMISSIONS

Receiving is owner-controlled.

| Action                           | Owner | Employee |
| -------------------------------- | ----- | -------- |
| View receiving history           | Yes   | No       |
| View receiving details           | Yes   | No       |
| Create receiving                 | Yes   | No       |
| Select supplier                  | Yes   | No       |
| Select destination branch        | Yes   | No       |
| Add products                     | Yes   | No       |
| Enter quantity                   | Yes   | No       |
| Enter purchase cost              | Yes   | No       |
| Enter supplier invoice/reference | Yes   | No       |
| Confirm receiving                | Yes   | No       |
| View receiving cost              | Yes   | No       |

Employees cannot add stock through receiving.

---

# 6.11 STOCK ADJUSTMENT PERMISSIONS

Stock adjustment is owner-only.

| Action                    | Owner | Employee |
| ------------------------- | ----- | -------- |
| View adjustments          | Yes   | No       |
| Create adjustment         | Yes   | No       |
| Enter adjustment quantity | Yes   | No       |
| Enter reason              | Yes   | No       |
| Confirm adjustment        | Yes   | No       |
| View adjustment history   | Yes   | No       |
| Delete adjustment         | No    | No       |

Every adjustment requires a reason and creates permanent inventory/audit history.

No second approval is required.

---

# 6.12 STOCKTAKE PERMISSIONS

Stocktake is owner-only.

| Action                             | Owner | Employee |
| ---------------------------------- | ----- | -------- |
| View stocktakes                    | Yes   | No       |
| Create stocktake                   | Yes   | No       |
| Enter physical quantity            | Yes   | No       |
| View system quantity               | Yes   | No       |
| View differences                   | Yes   | No       |
| Complete stocktake                 | Yes   | No       |
| Create adjustment from discrepancy | Yes   | No       |
| Delete stocktake                   | No    | No       |

Stocktake does not silently modify inventory.

---

# 6.13 DAMAGED STOCK PERMISSIONS

| Action                          | Owner | Employee                         |
| ------------------------------- | ----- | -------------------------------- |
| View damaged stock              | Yes   | Relevant branch information only |
| Manage damaged stock            | Yes   | No                               |
| Dispose/write off damaged stock | Yes   | No                               |
| View disposal history           | Yes   | No                               |
| Create disposal                 | Yes   | No                               |
| Delete disposal                 | No    | No                               |

Damaged stock cannot be sold.

---

# 6.14 INVENTORY VALUATION PERMISSIONS

| Action                     | Owner | Employee |
| -------------------------- | ----- | -------- |
| View inventory valuation   | Yes   | No       |
| View weighted average cost | Yes   | No       |
| View inventory value       | Yes   | No       |
| Filter by branch           | Yes   | No       |
| Filter by product          | Yes   | No       |

Inventory valuation is owner-only because it exposes purchase-cost information.

---

# 6.15 TRANSFER PERMISSIONS

## Transfer Request

| Action                          | Owner | Employee           |
| ------------------------------- | ----- | ------------------ |
| Create transfer request         | Yes   | Yes                |
| Request stock                   | Yes   | Yes                |
| View relevant requests          | Yes   | Yes                |
| View all transfers              | Yes   | No                 |
| Approve                         | Yes   | No                 |
| Reject                          | Yes   | No                 |
| Partially approve               | Yes   | No                 |
| Dispatch                        | Yes   | No                 |
| Receive                         | Yes   | Yes at destination |
| Record actual received quantity | Yes   | Yes                |
| Resolve discrepancy             | Yes   | No                 |
| Cancel before dispatch          | Yes   | No                 |

Employees can request stock but cannot approve their own requests.

---

# 6.16 TRANSFER BRANCH VISIBILITY

## Owner

The owner can view:

* All source branches
* All destination branches
* All transfer requests
* All transfer history
* All discrepancies

## Employee

The employee can view:

* Transfers they created
* Transfers relevant to their assigned branch
* Transfers where their branch is the destination
* Transfers where their branch is the source, where operationally relevant

Employees cannot use transfers to bypass inventory authorization.

---

# 6.17 PRODUCT & CATEGORY PERMISSIONS

Product and category management is owner-only.

| Action                | Owner | Employee                           |
| --------------------- | ----- | ---------------------------------- |
| View products         | Yes   | Yes                                |
| Search products       | Yes   | Yes                                |
| Filter products       | Yes   | Yes                                |
| Create product        | Yes   | No                                 |
| Edit product          | Yes   | No                                 |
| Deactivate product    | Yes   | No                                 |
| Create category       | Yes   | No                                 |
| Edit category         | Yes   | No                                 |
| Deactivate category   | Yes   | No                                 |
| Manage product units  | Yes   | No                                 |
| Manage selling prices | Yes   | No                                 |
| View price history    | Yes   | Appropriate operational price only |
| View purchase cost    | Yes   | No                                 |

Employees may access the product catalog in read-only form as required for sales and inventory operations.

---

# 6.18 SUPPLIER PERMISSIONS

Supplier management is owner-only.

| Action                       | Owner | Employee |
| ---------------------------- | ----- | -------- |
| View suppliers               | Yes   | No       |
| Create supplier              | Yes   | No       |
| Edit supplier                | Yes   | No       |
| Deactivate supplier          | Yes   | No       |
| View supplier details        | Yes   | No       |
| View receiving history       | Yes   | No       |
| View supplier purchase costs | Yes   | No       |

---

# 6.19 DAILY CLOSING PERMISSIONS

## Employee

| Action                        | Owner           | Employee |
| ----------------------------- | --------------- | -------- |
| View current closing          | Yes             | Yes      |
| Review sales totals           | Yes             | Yes      |
| Review payment totals         | Yes             | Yes      |
| Enter actual cash             | Yes             | Yes      |
| Enter discrepancy explanation | Yes             | Yes      |
| Submit closing                | Yes             | Yes      |
| Approve closing               | Yes             | No       |
| Reject closing                | Yes             | No       |
| Reopen approved closing       | Yes, controlled | No       |

## Owner

The owner can:

* Review submitted closings
* Review discrepancies
* Approve closings
* Reject closings
* Request correction
* View historical closings
* Authorize corrections after closure

Employees cannot reopen an approved closing.

---

# 6.20 REPORT PERMISSIONS

Reports are primarily owner-only.

| Report                     | Owner | Employee |
| -------------------------- | ----- | -------- |
| Sales Reports              | Yes   | No       |
| Sales by Branch            | Yes   | No       |
| Sales by Employee          | Yes   | No       |
| Sales by Product           | Yes   | No       |
| Sales by Payment Method    | Yes   | No       |
| Best-Selling Products      | Yes   | No       |
| Sales Trends               | Yes   | No       |
| Inventory Reports          | Yes   | No       |
| Stock Movement Reports     | Yes   | No       |
| Inventory Valuation        | Yes   | No       |
| Stocktake Reports          | Yes   | No       |
| Damaged Stock Reports      | Yes   | No       |
| Purchase/Receiving Reports | Yes   | No       |
| Profit Reports             | Yes   | No       |
| Closing Reports            | Yes   | No       |
| Report Export              | Yes   | No       |

Employees may still see operational information inside their permitted modules, such as current stock or their own sales history.

---

# 6.21 USER MANAGEMENT PERMISSIONS

User management is owner-only.

| Action                         | Owner | Employee |
| ------------------------------ | ----- | -------- |
| View employees                 | Yes   | No       |
| Create employee                | Yes   | No       |
| Edit employee                  | Yes   | No       |
| Assign branch                  | Yes   | No       |
| Change branch                  | Yes   | No       |
| Deactivate employee            | Yes   | No       |
| Reset employee password        | Yes   | No       |
| View employee activity         | Yes   | No       |
| View branch assignment history | Yes   | No       |

Employees cannot manage other users.

---

# 6.22 BRANCH MANAGEMENT PERMISSIONS

Branch management is owner-only.

| Action                     | Owner | Employee                                |
| -------------------------- | ----- | --------------------------------------- |
| View branches              | Yes   | Assigned branch context only            |
| Create branch              | Yes   | No                                      |
| Edit branch                | Yes   | No                                      |
| Activate/deactivate branch | Yes   | No                                      |
| View branch details        | Yes   | Assigned branch operational information |
| View branch-wide reports   | Yes   | No                                      |

Employees cannot change their assigned branch.

---

# 6.23 NOTIFICATION PERMISSIONS

## Owner

Can:

* View all owner-relevant notifications
* View important notifications
* View critical notifications
* Acknowledge notifications
* Open related business records
* Access notification history

## Employee

Can:

* View notifications relevant to their role/branch
* Open related records where authorized
* Acknowledge relevant notifications

Employees must not receive confidential owner-only notifications such as:

* Profit information
* Purchase cost information
* Other employee performance information
* Management-only discrepancies

---

# 6.24 SETTINGS PERMISSIONS

| Setting                   | Owner | Employee |
| ------------------------- | ----- | -------- |
| General business settings | Yes   | No       |
| Payment methods           | Yes   | No       |
| System configuration      | Yes   | No       |
| Own account information   | Yes   | Yes      |
| Own password              | Yes   | Yes      |
| Logout                    | Yes   | Yes      |

Employees can manage only their own permitted account/security information.

---

# 6.25 AUTHENTICATION PERMISSIONS

Both roles must authenticate before accessing protected application functions.

## Login

* Active users may log in.
* Inactive users cannot log in.
* Invalid credentials must be rejected.
* Sessions must be securely managed.

## Logout

Both Owner and Employee can log out.

## Password

Users can change their own password where supported.

The owner can reset employee passwords according to the user-management workflow.

---

# 6.26 BRANCH DATA ISOLATION

Employees are restricted to their assigned branch for branch-specific operational data.

Examples:

Employee assigned to Main Branch:

```text
Can see:
Main Branch inventory
Main Branch operational transfers
Their own sales
Relevant Main Branch closing
```

Cannot normally see:

```text
Branch 2 inventory
Branch 3 inventory
Other employees' private sales
Business-wide profit
Purchase costs
Owner reports
```

The backend must enforce these restrictions.

---

# 6.27 OWNER CROSS-BRANCH ACCESS

The owner can:

* View all branches
* View all inventory
* Receive stock into any branch
* Adjust stock at any branch
* Conduct stocktakes at any branch
* View all sales
* View all transfers
* Manage employees
* Manage branches
* View all closings
* View all reports
* Compare branches
* Review all business activity

---

# 6.28 SENSITIVE DATA VISIBILITY

The following information is owner-only unless explicitly required by a future business rule:

* Purchase cost
* Weighted average cost
* Inventory valuation
* Gross profit
* Gross margin
* Profit reports
* Supplier purchasing information
* Other employees' sales performance
* Business-wide management reports
* Management-level discrepancies

Employees should not see sensitive data merely because it exists in a record they can otherwise access.

---

# 6.29 ACTION-LEVEL AUTHORIZATION

Authorization must exist at both:

1. Page level
2. Action level

For example, an employee may have access to:

```text
Inventory → Current Stock
```

but must not automatically receive permission to:

```text
Inventory → Adjust Stock
```

Similarly, an employee may access:

```text
Transfers → Transfer Details
```

but must not receive:

```text
Approve Transfer
Reject Transfer
Resolve Discrepancy
```

Page access does not automatically grant every action within that page.

---

# 6.30 READ-ONLY ACCESS

Where appropriate, employees should receive read-only access rather than being completely blocked.

Examples:

* Product information
* Current stock
* Selling price
* Their sales history
* Relevant transfer history
* Relevant notifications

This allows employees to perform their jobs without giving them management authority.

---

# 6.31 HIDDEN VS DISABLED ACTIONS

The application should generally:

### Hide actions the user has no reason to use.

Example:

Employee should not see:

```text
Adjust Stock
```

### Disable actions when the user understands the action but the current state prevents it.

Example:

A transfer may show:

```text
Approve Transfer
```

for the owner, but the button may be disabled if the transfer is already rejected or completed.

This distinction improves usability and prevents confusion.

---

# 6.32 WORKFLOW STATE PERMISSIONS

Permissions can change based on transaction state.

For example:

## Transfer

```text
REQUESTED
  → Owner can Approve / Reject
  → Employee cannot Approve / Reject

APPROVED
  → Owner can Dispatch
  → Employee cannot Dispatch

DISPATCHED
  → Destination employee can Receive
  → Owner can monitor

RECEIVED
  → Owner can review discrepancy
```

Similarly, daily closing actions depend on its state.

The system must not expose actions that are invalid for the current transaction state.

---

# 6.33 OWNER OVERRIDE RULE

Owner authority is not a universal bypass mechanism.

The owner can override or correct information only where an established workflow allows it.

Where an override/correction is permitted:

* Reason is required where specified
* Original information remains preserved
* New action is recorded
* User is recorded
* Date/time is recorded
* Inventory/financial effects are recorded
* Audit history is preserved

---

# 6.34 OFFLINE PERMISSION RULES

Offline capability does not change the user's business permissions.

For example:

An employee who can create sales online can also create permitted sales offline.

An employee who cannot adjust stock online cannot adjust stock offline.

Owner-critical Version 1 operations remain online-only:

* Receiving stock
* Stock adjustments
* Stocktake adjustments
* Transfer approval/rejection
* Product/price changes
* Employee management
* Branch management

Offline synchronization must never be used to bypass authorization.

---

# 6.35 SYNCHRONIZATION UI PERMISSIONS

Both roles may see their synchronization status.

The interface may show:

```text
Online — All synced
```

```text
Offline — Pending changes
```

```text
Internet available — Sync pending
```

```text
Syncing
```

```text
Sync failed — Retry
```

Users may synchronize data that they are authorized to create or modify.

The system must not allow synchronization to elevate a user's permissions.

---

# 6.36 NAVIGATION HIERARCHY

The application should use a simple hierarchical navigation model.

## Owner

```text
Dashboard

Sales
Inventory
Transfers
Products & Categories
Suppliers
Daily Closing
Reports
Users & Branches
Notifications
Settings
```

## Employee

```text
Dashboard

Sales
Inventory
Transfers
Daily Closing
Notifications
Account
```

Frequently used actions should be easy to reach.

Examples:

Employee:

```text
Dashboard → New Sale
Sales → New Sale
```

Owner:

```text
Dashboard → Pending Transfer
Dashboard → Pending Closing
Inventory → New Receiving
```

---

# 6.37 MOBILE/SMALL-SCREEN NAVIGATION

The application should remain usable on smaller screens.

Where the full desktop sidebar cannot fit, navigation may collapse into:

* Hamburger menu
* Bottom navigation for primary employee actions
* More/menu section for secondary actions

The exact responsive layout will be finalized during the UI design stage.

The underlying permission structure remains unchanged.

---

# 6.38 FINAL OWNER ACCESS SUMMARY

The Owner has access to:

```text
Dashboard
Sales
Inventory
Transfers
Products & Categories
Suppliers & Receiving
Daily Closing
Reports
Users & Branches
Notifications
Settings
```

The Owner can perform all established owner-level business actions across all branches.

---

# 6.39 FINAL EMPLOYEE ACCESS SUMMARY

The Employee has access to:

```text
Dashboard
Sales
Inventory — Current Stock
Transfers
Daily Closing
Notifications
Account/Security
```

The Employee can:

* Record sales
* View their sales
* Record permitted returns
* View assigned branch stock
* Request stock transfers
* Receive relevant transfers
* Submit daily closing
* View relevant notifications
* Work offline where permitted

The Employee cannot:

* Receive stock
* Adjust inventory
* Perform stocktakes
* Dispose damaged stock
* Manage products
* Manage categories
* Manage suppliers
* Manage employees
* Manage branches
* Approve/reject transfers
* View profit
* View purchase costs
* View business-wide reports
* Modify standard prices
* Delete completed transactions

---

# 6.40 Final Permission Matrix

The following provides the overall Version 1 permission summary:

| Functional Area     | Owner                                | Employee                       |
| ------------------- | ------------------------------------ | ------------------------------ |
| Dashboard           | Full                                 | Assigned branch                |
| Sales               | Full                                 | Create + own history           |
| Returns             | Full                                 | Relevant workflow              |
| Current Stock       | All branches                         | Assigned branch                |
| Stock Movement      | Full                                 | Assigned branch                |
| Receiving           | Full                                 | No                             |
| Stock Adjustment    | Full                                 | No                             |
| Stocktake           | Full                                 | No                             |
| Damaged Stock       | Full                                 | Limited visibility             |
| Stock Disposal      | Full                                 | No                             |
| Inventory Valuation | Full                                 | No                             |
| Transfers           | Full                                 | Request + receive              |
| Products            | Full                                 | Read-only                      |
| Categories          | Full                                 | Read-only where needed         |
| Suppliers           | Full                                 | No                             |
| Daily Closing       | Review/approve/correct               | Submit                         |
| Sales Reports       | Full                                 | No                             |
| Inventory Reports   | Full                                 | No                             |
| Profit Reports      | Full                                 | No                             |
| Closing Reports     | Full                                 | No                             |
| Employees           | Full                                 | No                             |
| Branches            | Full                                 | No                             |
| Notifications       | Owner-relevant                       | Relevant only                  |
| Settings            | Full                                 | Own account/security           |
| Authentication      | Full                                 | Full                           |
| Offline Operations  | Authorized owner/employee operations | Authorized employee operations |
| Audit History       | Full authorized access               | Relevant limited history       |

---

# 6.41 Final Navigation & Permission Decision

The Version 1 navigation and permission model is based on:

* Two roles: Owner and Employee
* Owner has business-wide access
* Employee has assigned-branch operational access
* Sensitive management information is owner-only
* Inventory-changing actions are restricted according to business rules
* Approval actions are owner-controlled
* Transaction state controls available actions
* UI visibility does not replace backend authorization
* Offline operation does not change permissions
* Owner authority does not create unrestricted bypasses
* Historical records remain protected and auditable

This navigation and permission structure becomes the foundation for the UI design in Step 7.

---

# 6.42 Step 6 Completion

Step 6 is complete when the Owner and Employee navigation, page access, action permissions, branch restrictions, sensitive-data visibility, and workflow-state permissions have been approved.

The next stage is:

STEP 7 — UI/UX DESIGN IN STITCH

Step 7 will define the actual visual interface, including:

* Application shell
* Sidebar
* Header
* Dashboard layout
* Tables
* Cards
* Forms
* Buttons
* Dialogs
* Drawers
* Status indicators
* Empty states
* Loading states
* Error states
* Offline/sync indicators
* Responsive behavior
* Owner interface
* Employee interface
* Screen-by-screen visual design
