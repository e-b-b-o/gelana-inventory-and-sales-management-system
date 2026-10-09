# Gelana Implementation Rules

This document defines **how Antigravity must work on every vertical slice**.

## Rule 1 — Business Requirements Win

Before implementing a feature, read the relevant section of:
`project_decisions.md`

Do not invent business behavior.
If something is not defined, do not silently make up a business rule.

## Rule 2 — Technical Design Wins for Technical Decisions

Read:
`docs/technical_design.md`

before making architectural decisions.
Do not introduce a different architecture because it is easier to code.

## Rule 3 — Stitch Is the UI Reference

When a Stitch design exists for a feature:
> Use it as the visual/UI reference.

Do not redesign the screen arbitrarily.
Do not replace the approved design with a generic dashboard/template.
Do not blindly copy Stitch HTML.
Translate the design into the existing React architecture.

## Rule 4 — Build Vertically

For every slice:
```text
UI
↓
Frontend state/data access
↓
API
↓
Business logic
↓
Database
↓
Authorization
↓
Tests
↓
UI verification
```

A slice is not complete if only the frontend works.
A slice is not complete if only the API works.

## Rule 5 — Finish Before Moving On

Do not begin the next slice until the current slice satisfies its acceptance criteria.
A slice is complete only when:
* frontend works
* backend works
* database behavior works
* authorization works
* validation works
* tests pass
* UI matches the approved design
* errors/loading/empty states work
* documentation is updated

## Rule 6 — Inspect Existing Code First

Before modifying anything:
1. Find the relevant existing implementation.
2. Understand it.
3. Compare it with the technical design.
4. Reuse compatible code.
5. Refactor incompatible code.
6. Replace incorrect code when necessary.

Do not blindly add duplicate implementations.

## Rule 7 — Do Not Work Around the Architecture

Do not:
* put business logic in React components
* bypass API authorization
* manipulate PostgreSQL directly from frontend code
* duplicate business rules in multiple places unnecessarily
* create temporary fake APIs that become permanent
* hardcode business data into UI
* create parallel architecture for a single feature

## Rule 8 — Backend Is the Security Boundary

Frontend hiding is not authorization.
Every protected action must be enforced by the backend.
Never trust:
* branch ID from the client
* role from the client
* price from the client
* permission from the client
* inventory quantity from the client

Validate and authorize on the server.

## Rule 9 — Historical Data Must Be Preserved

Never casually:
* overwrite completed transactions
* delete historical sales
* delete inventory movements
* rewrite historical prices
* rewrite historical WAC snapshots
* erase correction history

Use the finalized correction/reversal/history rules.

## Rule 10 — Inventory Changes Must Be Traceable

Every material inventory change must go through the inventory architecture defined in:
`docs/technical_design.md`.

Do not directly mutate stock quantities without the required inventory movement/history.

## Rule 11 — Transactions Must Be Atomic

Where the technical design requires a database transaction, all related changes must succeed or fail together.

Examples:
```text
Sale
+ Sale Items
+ Payments
+ Inventory Effects
+ Inventory Movement
+ Cost Snapshot
```
must be atomic.
Do not leave partially completed business transactions.

## Rule 12 — No Unapproved Features

Do not add:
* POS features
* barcode scanning
* customer management
* loyalty
* credit/debt
* ecommerce
* purchase orders
* warehouse management
* employee commissions
* AI forecasting
* automatic reorder
* unnecessary accounting features

unless explicitly added to the business requirements.

## Rule 13 — No Invented Business Data

Demo data is allowed for UI development.
But it must be clearly representative.
Do not present invented:
* branches
* employees
* suppliers
* financial statistics
* business names
* payment methods
* transaction histories

as if they were real official data.
Use:
* Branch 1
* Branch 2
* Branch 3

where appropriate.

## Rule 14 — Use Reusable Components

When implementing Stitch designs:
Extract reusable:
* buttons
* inputs
* tables
* cards
* badges
* dialogs
* drawers
* filters
* page headers
* navigation
* empty states
* loading states

Do not create visually different implementations of the same UI pattern for every page.

## Rule 15 — No Giant Components

Break complex screens into reasonable components.
Keep:
* presentation
* data fetching
* business logic
* reusable UI
appropriately separated.

## Rule 16 — No Premature Offline Implementation

Do not implement offline/synchronization before the online business system is stable.
However, write online code in a way that does not make future offline support unnecessarily difficult.

## Rule 17 — Test Business Rules, Not Just Code

Tests should verify actual behavior.
Examples:
* employee cannot access another branch
* employee cannot receive stock
* negative inventory is blocked
* completed sale reduces stock
* WAC is branch-specific
* completed sale preserves cost
* return restores or damages stock correctly
* transfer approval does not move stock
* dispatch changes source/in-transit state
* closing includes refunds correctly

Do not rely only on shallow component tests.

## Rule 18 — UI Verification Is Required

After implementing a Stitch-based screen:
1. Compare it with the Stitch reference.
2. Check layout.
3. Check spacing.
4. Check typography.
5. Check colors.
6. Check table/card structure.
7. Check responsive behavior.
8. Check states.

Fix visual deviations before marking the slice complete.

## Rule 19 — Stop on Ambiguity

If implementation reveals an unresolved business decision:
STOP.
Report:
* what is ambiguous
* why it matters
* possible options
* recommended option

Do not silently invent the answer.

## Rule 20 — Keep Documentation Current

After completing a slice:
Update:
`docs/implementation_progress.md`

Record:
* slice completed
* major files/features changed
* tests
* known limitations
* next slice

Do not rewrite historical progress.

## Rule 21 — Git Discipline (Migrated from legacy instructions)

* Small, focused commits.
* Conventional-style messages are preferred: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
* Do not commit broken builds intentionally.
* Do not commit generated secrets, local databases, `node_modules`, or build artifacts.
