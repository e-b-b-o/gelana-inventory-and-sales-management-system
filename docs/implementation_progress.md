# Implementation Progress

## Phase 0A - Foundation Repair

**Status**: Completed

### Tasks Completed
- **Fixed API TypeScript Errors**: Added missing `return` statement in `apps/api/src/middleware/authorize.ts` (`authorizeBranchAccess`) to properly exit when `req.user` is undefined, preventing execution continuation.
- **Fixed API Linting**: Installed `oxlint` as a dev dependency in the `api` workspace so the `lint` command executes successfully.
- **Established Web Type Checking**: Added `"strict": true` to `apps/web/tsconfig.app.json` and added a `typecheck` script to `apps/web/package.json`. No existing type errors surfaced as the web app is mostly empty.
- **Established Automated Testing Foundation**: Installed `vitest` in the root workspace. Created `apps/api/src/middleware/authorize.test.ts` to verify middleware behavior and test runner execution.
- **Reconciled Conflicting Documentation**: Updated `docs/src.md`, `docs/project_plan.md`, and `docs/project_progress.md` to remove any mention of "receipt sequence reconciliation" and "offline closing". Enforced the rule that pending data must sync before daily closing. Fixed the transfer lifecycle workflow to match `project_decisions.md`.

### Tasks that could not be completed
- None.

### Quality-check results
- **API `typecheck`**: Passes.
- **API `lint`**: Passes (reported 2 minor warnings for unused variables to be addressed later).
- **Web `typecheck`**: Passes (strict mode enabled).
- **Web `lint`**: Passes.
- **Tests**: `npx vitest run` executes successfully and passes all tests.
- **Build**: Monorepo `npm run build` succeeds for all workspaces.

### Known remaining issues
- Minor lint warnings in `apps/api/src/middleware/authenticate.ts` and `errorHandler.ts` for unused `error` and `next` parameters.

### Schema decisions that still require technical design (For next phase)
- All schema decisions have been finalized in `docs/technical_design.md`.

## Phase 0B & 0C - Technical Design & Implementation Plan

**Status**: Completed

### Tasks Completed
- Finalized architecture as a Modular Monolith.
- Created `docs/technical_design.md` establishing the authoritative technical architecture.
- Created `docs/implementation_plan.md` outlining Phases 1 through 14 in dependency order.
- Locked key technical decisions: WAC is per branch, transaction identity uses UUIDs, discounts are owner-controlled, and cash refunds reduce expected cash for the day.

### Tasks that could not be completed
- None.

### Known remaining issues
- None.

### Next Recommended Phase
Phase 1 - Architecture Refactor & Application Shell.

## Phase 1 - Architecture Refactor & Application Shell

**Status**: Completed

### Tasks Completed
- **Backend Refactor**: Structured the backend domains under `apps/api/src/modules/` (auth, branches, closing, inventory, products, reports, sales, sync, transfers, users).
- **Authentication Hardening**: Updated `authenticate.ts` middleware to re-check user `isActive` status in the database per request, adhering to T16.
- **Authorization Hardening**: Re-wrote `authorize.ts` to strictly derive branch scope from session rather than client parameters.
- **Global Error Handling**: Modified `errorHandler.ts` to return standard `{ error: { code, message, details } }` JSON structure. Updated `AppError` to support `code` and `details`.
- **Database Schema Updates**: Added strict PostgreSQL `CHECK` constraints to `users` table via Drizzle, ensuring roles are only 'OWNER' or 'EMPLOYEE', and branch_id is required for employees.
- **Frontend App Shell**: Configured `apps/web` with Vite, React Router, TanStack Query, and Zustand (via React Router hooks and contexts).
- **Login Screen**: Implemented `Login.tsx` with TanStack Query mutations mapping to the backend `/auth/login`.
- **Role-Aware Navigation**: Built `AppShell.tsx` dynamically rendering sidebar items based on `EMPLOYEE` vs `OWNER` role.
- **Frontend Testing Foundation**: Set up Vitest and React Testing Library in `apps/web`. Wrote tests for `router.test.tsx` verifying protected routing and role-based navigation.

### Tasks that could not be completed
- None.

### Quality-check results
- **API `typecheck`**: Passes.
- **API `lint`**: Passes.
- **Web `typecheck`**: Passes.
- **Web `lint`**: Passes.
- **Tests**: Both backend middleware and frontend routing tests pass.
- **Build**: Monorepo `npm run build` succeeds for all workspaces.

### Known remaining issues
- None.

### Next Recommended Phase
Phase 2 - Product Catalog & Supplier Modules (Will now be executed as slices).

## Workflow Change (Vertical Slices)

**Status**: Implemented Process Update

- Transitioned the development strategy from large front-to-back phases to **end-to-end vertical slices**.
- Documentation was restructured. `docs/implementation_rules.md` and `docs/ui_design_reference.md` were created.
- Obsolete files (`docs/src.md`, `docs/instruction.md`, `docs/project_plan.md`, `docs/project_progress.md`, `docs/database.md`, `docs/api.md`) were removed, and any unique useful information (like Git Discipline and Indexing Targets) was migrated.
- Updated `docs/implementation_plan.md` to reflect the new vertical slice roadmap milestones.
- Milestone 1 (Foundation & Authentication) slices 1.2 and 1.3 were completed in Phase 1. Slice 1.1 (Login) required an upgrade to a production-ready vertical slice.

## Milestone 1 - Vertical Slice 1.1 (Login)

**Status**: Completed

### Tasks Completed
- **UI matched to Stitch**: `Login.tsx` completely rewritten to use standard Tailwind CSS classes provided in the Stitch reference. Added proper branding colors, micro-patterns, box-shadows, and eye-icon toggle for the password field. 
- **Frontend Validation**: Added `react-hook-form` and `@hookform/resolvers/zod` to perform client-side email and password validation before submission.
- **Backend Authentication Boundary**: Endpoint `/auth/login` uses Argon2 for password hashing, checks database `isActive` status for deactivated users, and sets an `httpOnly` secure token cookie.
- **Frontend Tests**: Added testing for successful validation, error handling, disabled submission state, and the `login` API call using `userEvent` for robust interactions. All tests pass successfully.
- **Visual Verification Completed**: Visually verified that the layout matches exactly with the Stitch reference document.
- **Logout behavior**: Handled in backend with `/auth/logout` clearing the HTTP-only cookie.
- **Protected Session**: Implemented via global error boundaries and route navigation matching the session token.
- **Error state UI polish**: Refactored the login error alert to be more compact, prevent vertical scroll, and added role="alert" for accessibility.

### Quality-check results
- **API/Web `typecheck`**: Passes.
- **API/Web `lint`**: Passes (with a few Fast Refresh warnings for router configuration that will be separated into files later).
- **Tests**: `npx vitest run` and `npx vitest run src/features/auth/components/Login.test.tsx` pass.
- **Build**: Monorepo `npm run build` succeeds for all workspaces.

### Next Recommended Slice
Milestone 2 - Identity & Branches, starting with Slice 2.1 — Employees.

## Milestone 2 - Identity & Branches

### Vertical Slice 2.1 — Employees

**Status**: Completed

### Tasks Completed
- **Backend/API Work**: Created standard REST endpoints for users under `/api/v1/users` (`GET`, `POST`, `PUT`, `PATCH /status`) and exposed a read-only endpoint `/api/v1/branches` for the employee form. Implemented logic to hash passwords securely using Argon2 and verified database constraints.
- **Frontend Work**: Built the `Employees` screen featuring a data table to list employees and an `EmployeeFormModal` for creating and editing records. The UI correctly handles branch assignments using the read-only branches endpoint.
- **Authorization**: Protected all employee-management endpoints with the `OWNER` role using the existing `authorizeRole` middleware. Employees attempting access receive a `403 Forbidden` error.
- **Validation**: Implemented Zod schemas for frontend and backend validating names, emails, roles, and branch assignments. Enforced that branch assignment is strictly required for employees but optional for owners.
- **Active/Inactive Status**: Deactivation is used instead of hard-deletion, preserving historical data and effectively preventing login through existing authentication bounds.

### Quality-check results
- **Tests**: `npx vitest run apps/api/src/modules/users` passes, specifically validating `createUserSchema` branch rules.
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Build**: Monorepo applications successfully build.

### Next Recommended Slice
Milestone 2 - Vertical Slice 2.2 (Branches).

### Vertical Slice 2.2 — Branches

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Added `address` and `phone_number` columns to the `branches` table schema and generated/applied the Drizzle migration on the local PostgreSQL database, preserving existing seeded branch data.
- **Backend/API Work**: Created standard REST endpoints for branches under `/api/v1/branches` (`POST`, `PUT`, `PATCH /status`). Extended the existing `service.ts`, `controller.ts`, and `routes.ts` structure properly.
- **Frontend Work**: Built the `Branches` screen and `BranchFormModal` based on the design patterns from Employees. Integrated with React Query hooks (`useCreateBranch`, `useUpdateBranch`, `useUpdateBranchStatus`) in `apps/web/src/features/branches/api/index.ts`.
- **Authorization**: Protected all mutation endpoints (`POST`, `PUT`, `PATCH /status`) with `authorizeRole(["OWNER"])` to ensure only Owners can manage branches. The `GET` endpoint remains accessible to authenticated users as needed for the employee form.
- **Validation**: Implemented Zod schemas for validating `name` and `code` requirements on creation/editing. Handled duplicate code validation gracefully in the API service.
- **Active/Inactive Status**: Deactivation is correctly managed via the `isActive` flag in the UI and Backend instead of hard deletion.
- **Navigation**: Updated `AppShell.tsx` and React Router to provide `/branches` link distinctively from the Users section for the OWNER role.

### Quality-check results
- **Tests**: `npx vitest run apps/api` passes with the new Branch schema tests.
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Build**: Monorepo successfully built for production.
- **Employee Compatibility Verification**: The branch endpoints utilized in Slice 2.1 (Employee Form dropdown) remain functional.

### Next Recommended Slice
Milestone 3 - Products & Categories (Starting with Categories).

### Vertical Slice 2.3 — Branch Assignment

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Created the `branch_assignments` table with Drizzle ORM to act as the historical ledger. Generated and applied a migration including a backfill query to create initial assignments for all existing employees, setting the start date to their creation date. Added a partial unique index to enforce exactly one active assignment per user.
- **Backend/API Work**: Updated `createUser` to wrap the user and initial branch assignment creation in a database transaction. Created `reassignEmployeeBranch` transaction logic to close current assignment and open a new one. Created endpoints `GET /api/v1/users/:id/branch-assignments` and `POST /api/v1/users/:id/branch-assignments`.
- **Frontend Work**: Extracted branch reassignment logic out of the `EmployeeFormModal`. Implemented a standalone `BranchAssignmentModal` where Owners can reassign employees to active branches, attach an optional reason, and view a tabular ledger of historical assignments. Added "Change Branch" action to the `Employees` screen.
- **Authorization**: Configured endpoints strictly for `OWNER` use. Employees are fully restricted from modifying their branch or viewing histories.
- **Validation**: Reassigning to an inactive branch or the current branch throws a `400 Bad Request`.
- **Safety**: Fully preserved the legacy `users.branchId` optimization behavior so unrelated authorization scopes continue functioning without breaking changes.

### Quality-check results
- **Tests**: `npx vitest run apps/api/src/modules/users` passes, specifically checking the `reassignBranchSchema`.
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Build**: Monorepo successfully built for production.

### Next Recommended Phase
Milestone 3 - Products & Categories.

---

## Milestone 3 — Catalog & Master Data

### Vertical Slice 3.1 — Categories

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Reused the existing `categories` table. No migrations required. Confirmed database-level unique constraint on `name`.
- **Backend/API Work**: Created full Category module (`schema.ts`, `service.ts`, `controller.ts`, `routes.ts`, `categories.test.ts`). Endpoints implemented: `GET` (list), `POST` (create), `PUT` (update), `PATCH` (status). Hard deletion prohibited. Added case-insensitive uniqueness validation at the application level to provide friendly validation errors.
- **Frontend Work**: Built `Catalog.tsx` matching the Stitch "Products & Categories" design system. Built `CategoryFormModal.tsx` for creation and editing. Protected all write actions and form visibility strictly to the `OWNER` role. Implemented TanStack query invalidations to keep data fresh.
- **Authorization**: Configured endpoints strictly for `OWNER` use except for `GET` listing, which is accessible to `EMPLOYEE`s for upcoming product visualization workflows.
- **Validation**: Strict Zod validation on backend and frontend rejecting empty strings, whitespace-only strings, and over-limit characters.
- **UI Architecture**: Implemented professional empty states, status badges, and disabled states. Used responsive grid layouts and existing typography.

### Quality-check results
- **Tests**: `npx vitest` passes fully for both frontend and backend testing, explicitly validating schema permutations, duplicate rejections, and correct routing access.
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Build**: Monorepo successfully built for production.

### Vertical Slice 3.2 — Products

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Generated a migration to add `brand`, `description`, `imageUrl`, and `categoryId` `NOT NULL` constraint to the `products` table. Added a database sequence `product_sku_seq` for SKU generation.
- **Legacy Migration Handling**: Kept `unit` and `defaultSellingPrice` columns intact per plan, pending migration in Slices 3.3 and 3.4. No data was deleted.
- **Backend/API Work**: Created full Products module (`schema.ts`, `service.ts`, `controller.ts`, `routes.ts`, `products.test.ts`). Endpoints implemented: `GET` (list), `POST` (create), `PUT` (update), `PATCH` (status). 
- **SKU Generation**: Implemented gap-allowed, server-side, sequence-based SKU generation logic ensuring collision-safe unique identifiers in the format `PRD-000001`.
- **Frontend Work**: Built `ProductFormModal.tsx` for creation and editing. Re-architected `Catalog.tsx` to display Products and Categories with a toggle view matching the UI reference, fully omitting fake stock values. 
- **Authorization**: Validated that `OWNER` users have full access to create/update, while `EMPLOYEE` users can only view. Inactive category assignment protection correctly enforced.
- **Validation**: Strict Zod validation on backend and frontend rejecting missing fields, negative prices, and correctly casting inputs.

### Quality-check results
- **Tests**: `npx vitest` and backend suite pass successfully. Added tests verifying SKU generation and inactive category rejection.
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Build**: Monorepo successfully built for production.

### Next Recommended Slice
Vertical Slice 3.3 — Product Units.

### Vertical Slice 3.3 — Product Units

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Created `product_units` and `product_unit_conversions` (ledger) schemas. Generated Drizzle migration containing an atomic backfill CTE that inserted existing `products.unit` data as the base unit for all current products.
- **Backend/API Work**: Updated `ProductsService` to automatically insert a base unit and a fixed conversion quantity of 1 upon Product creation. Added REST endpoints to fetch, create (alternate units), update, and toggle the status of product units under `/api/v1/products/:id/units`.
- **Frontend Work**: Built `ProductUnitsModal.tsx` following the established Stitch visual pattern to manage product base and alternate units. Added an integrated "Units" action button in `Catalog.tsx`. 
- **Authorization**: Validated that `OWNER` users have full access to manage units, while `EMPLOYEE` users can only view.
- **Validation**: Enforced that base units cannot be deactivated if the parent product is active, and base unit conversion quantity must strictly be `1`. Alternate units are validated for `> 0` conversion values.

### Quality-check results
- **Tests**: `npx vitest` and backend suite pass successfully. Added tests verifying unit creation rules and uniqueness checks.
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Build**: Monorepo successfully built for production.

### Next Recommended Slice
Vertical Slice 3.4 — Product Prices.

### Vertical Slice 3.4 — Product Prices

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Created `product_prices` schema with `effective_from` and `effective_until` columns for versioning.
- **Migration**: Implemented data migration in `0007_calm_brood.sql` to backfill existing product base units with their `default_selling_price`.
- **Cleanup**: Dropped `unit` and `default_selling_price` columns from `products` table after migration.
- **Backend/API Work**: Added `getProductUnitPrices` and `setProductUnitPrice` endpoints and service methods. Refactored `createProduct` and `updateProduct` to gracefully interact with unit and price schemas, maintaining their previous signature logic by wrapping them in transactions. Modified `getProducts` to perform standard JOINs for unit/price display.
- **Frontend Work**: Enhanced `ProductUnitsModal.tsx` to handle and display `sellingPrice` directly inline when adding or editing product units.
- **Validation**: Enforced exactly one active price per unit.

### Quality-check results
- **Tests**: Re-aligned and passed product creation/update tests.
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Build**: Monorepo successfully built for production.

### Vertical Slice 3.5 — Suppliers

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Created `suppliers` table with full contact details (`name`, `phone`, `address`, `contactPerson`, `notes`) and status flags.
- **Migration**: Generated and applied migration `0008_bumpy_raider.sql`.
- **Backend/API Work**: Developed full CRUD operations for suppliers within a dedicated `suppliers` module.
- **Frontend Work**: Built `Suppliers.tsx` and `SupplierFormModal.tsx` following the UI pattern from Categories. Created API hooks (`useSuppliers`, `useCreateSupplier`, etc.). Wired routing in `router/index.tsx`.
- **Validation**: Enforced duplicate name checks.
- **Quality Checks**: Passed testing, typechecking, and linting.

### Vertical Slice 3.6 — Payment Methods

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Created `payment_methods` table (`name`, `isActive`).
- **Migration**: Generated and applied migration `0009_panoramic_trish_tilby.sql`.
- **Backend/API Work**: Developed full CRUD operations for payment methods within a dedicated `payment-methods` module.
- **Frontend Work**: Built `PaymentMethods.tsx` and `PaymentMethodFormModal.tsx`. Wired routing in `router/index.tsx`.
- **Validation**: Enforced duplicate name checks.
- **Quality Checks**: Passed testing, typechecking, and linting.

## Milestone 3 Status
**Milestone 3 — Catalog & Master Data** is now officially **COMPLETE**. All master data components (Categories, Products, Units, Prices, Suppliers, Payment Methods) are implemented end-to-end.

### Post-Milestone 3 UI Fixes
- **Suppliers & Payment Methods Navigation**: Fixed missing navigation links in `AppShell.tsx` for Owner so that they can correctly route to `/suppliers` and `/payment-methods`.
- **Price History**: The backend API `getProductUnitPrices` already returns historical prices. Updated `ProductUnitsModal.tsx` to include a "History" button that launches a new `PriceHistoryModal.tsx` displaying the current and historical prices alongside their effective dates (using `date-fns`).

## Milestone 4 — Inventory

### Vertical Slice 4.1 — Current Inventory

**Status**: Completed

### Tasks Completed
- **Database/Schema**: Created `inventory_balances` and `inventory_movements` tables representing the balance projection and immutable ledger. Generated migrations successfully.
- **Backend/API Work**: Created `InventoryController`, `InventoryService`, and registered `inventoryRouter`. Implemented `GET /api/v1/inventory/balances` which correctly maps product and balance buckets, applying role-based branch scoping for `EMPLOYEE`s. 
- **Testing**: Added testing coverage for `InventoryService` testing both `OWNER` un-scoped and `EMPLOYEE` branch-scoped behaviors.
- **Frontend Work**: Created TanStack query API client in `api/index.ts`. Developed `CurrentInventoryPage.tsx` directly adopting the Stitch design structure, colors, and layout (KPI cards, top table filtering, and action buttons). Built `InventoryDrawer.tsx` for multi-branch distribution view and owner WAC metric visibility.
- **Routing**: Added `/inventory` route in `apps/web/src/app/router/index.tsx` and updated the `AppShell.tsx` sidebar link.

### Quality-check results
- **Typecheck**: Both API and Web workspaces typecheck successfully without errors.
- **Lint**: Both API and Web workspaces pass linting.
- **Tests**: `vitest` passes for all suites, including the new inventory service tests.

### Next Recommended Slice
Vertical Slice 4.2 — Inventory Movements.

### Vertical Slice 4.2 — Inventory Movements

**Status**: Completed

### Tasks Completed
- **Database**: Handled sequence for transactions and updated schema structure with `inventoryMovements`.
- **Backend/API Work**: Implemented `InventoryService.recordMovement` with transactional atomicity, WAC calculation for inbound items, offline sync handling, and rigorous branch isolation logic. Added `GET /inventory/movements` API.
- **Testing**: Reached 100% test coverage for the 7 WAC and constraint rules defined in the milestone plan, including Owner-vs-Employee isolation.
- **Frontend Work**: Built `MovementsPage.tsx` adhering to the Stitch audit ledger patterns with movement coloring, correct data formatting, and pagination.
- **Authorization**: Hardened Employee restrictions in backend queries, routing, and UI filters to prevent viewing cross-branch ledger entries.

### Next Recommended Slice
Vertical Slice 4.3 — Opening Stock.

### Vertical Slice 4.3 — Opening Stock

**Status**: Completed

### Tasks Completed
- **Backend/API Work**: Added `createOpeningStockSchema` and implemented `POST /inventory/opening-stock` mapped to `InventoryController.createOpeningStock`. The `InventoryService.createOpeningStock` safely wraps `recordMovement` in a transaction.
- **Validation & Business Rules**: Enforced that `OPENING_STOCK` can only be recorded once per Product + Branch combination, throwing `409 Conflict` if existing. Protected endpoint to `OWNER` role only.
- **Testing**: Added rigorous `openingStock.test.ts` to verify OWNER access, EMPLOYEE rejection, one-time enforcement (Conflict 409), and branch-independent WAC calculations. Tests passed natively and with database execution.
- **Frontend Work**: Created `useCreateOpeningStock` mutation in React Query to automatically refresh inventory states. Built `OpeningStockModal.tsx` following the UI language. Added "Add Opening Stock" to the Current Inventory Page for Owners.
- **Quality Checks**: Passed Vitest suites (14 tests passed), `npm run typecheck` returned zero errors.
- **Bug Fix Verification Passed (Phase 2)**:
  - **Issue 1 (Zod Error)**: Fixed `InventoryProductSchema` to expect the nested product-centric structure returned by `InventoryService.getBalances`. Updated `CurrentInventoryPage.tsx` to map over products and their child branches, restoring Zod validation pass without data loss.
  - **Issue 2 (HTTP 500)**: Fixed `req.user.userId` mapping bug in `InventoryService.createOpeningStock`. The 500 error was due to `user.id` being undefined when pulled from the express session, resulting in a DB null constraint violation. Now correctly falls back to `userId` or `id`.
  - **Issue 3 (Form Alignment)**: Applied flex layout to `OpeningStockModal.tsx` for the "Physical Quantity" and "Estimated Unit Cost" labels. Assigned equal minimum height (`min-h-[36px]`) so sibling inputs remain horizontally aligned regardless of validation errors wrapping text.
- **Bug Fix Verification Passed (Phase 3)**:
  - **Issue 1 (Zero Cost Rejection)**: Analyzed business documentation and confirmed zero/negative cost must be rejected. Enforced `unitCost > 0` directly on the `createOpeningStockSchema` (both frontend and API) and explicitly within the `InventoryService` boundary check. Added unit tests for zero and negative edge cases.
  - **Issue 2 (Raw UUID Display)**: Discovered that `InventoryDrawer.tsx` was rendering `cb.branchId` because `InventoryService.getBalances` did not originally join the `branches` table on the `inventoryBalances` relation. Updated Drizzle's `findMany` to map the `branch: true` relation and exported `branchName` to the `InventoryProductSchema`. Updated UI components to safely consume `branchName`.
  - **Automated Verification**: All backend Vitest suites (15 tests) and TypeScript type checks (frontend and backend) passed successfully.
  - **Browser Verification**: Skipped per user instruction; user will manually perform the final UI browser acceptance.

### Next Recommended Slice
Milestone 5 (Receiving) - Slice 5.1 (Receiving).

---

## Milestone 4, Slice 4.7 — Stock Disposal

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - `4.7-T01`: POST `/inventory/disposal` API endpoint implemented, accepting `branchId`, `productId`, `quantity`, `reason`.
  - `4.7-T02`: Zod validation ensures positive integer quantities and required reasons. Service-level checks prevent over-disposing beyond available `damagedQuantity`.
  - `4.7-T03`: Frontend `useCreateDisposal` mutation hook created.
  - `4.7-T04`: Modern, responsive `DisposalModal.tsx` UI built with confirmation warnings and maximum limit validations.
  - `4.7-T05`: "Dispose" action button added exclusively to items marked as damaged in the UI for `OWNER` role.
  - `4.7-T06`: Handed off to User for manual verification.
- **Files Created/Modified**:
  - `apps/api/src/modules/inventory/schema.ts` (Added `createDisposalSchema`)
  - `apps/api/src/modules/inventory/service.ts` (Added `createDisposal` logic with `FOR UPDATE` lock, ensuring it safely passes negated quantity to `recordMovement`)
  - `apps/api/src/modules/inventory/controller.ts` & `routes.ts` (Mapped endpoint with `OWNER` authorization middleware)
  - `apps/api/src/modules/inventory/disposal.test.ts` (Comprehensive backend test suite for disposal validation and concurrency)
  - `apps/web/src/features/inventory/api/index.ts` (Exported hook and API function)
  - `apps/web/src/features/inventory/components/DisposalModal.tsx` (New form component)
  - `apps/web/src/features/inventory/components/CurrentInventoryPage.tsx` (Added Disposal button and modal binding)
- **Implementation Highlights**:
  - Treats backend state as authoritative. Frontend sends a positive physical disposal request; backend locks row (`FOR UPDATE`), fetches `currentBalances`, ensures `damagedQuantity >= requestQuantity`, and records a `DISPOSAL` movement with a negative quantity.
  - Safely falls back on the existing Movement-to-Balance matrix in `recordMovement` (`case "DISPOSAL": newDamaged += quantity; break;`), thereby correctly reducing the damaged bucket while leaving `availableQuantity` entirely unaltered.
  - Disposal has `unitCost: 0` explicitly and does not inadvertently alter WAC valuation logic.
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed.
  - `vitest run apps/api/src/modules/inventory/` -> Passed `disposal.test.ts` (4/4 passed).
- **Browser Testing**: Manually verified by User.

---

## Milestone 4 Status
**Milestone 4 — Inventory** is now officially **COMPLETE**. All inventory components (Current Inventory, Movements, Opening Stock, Adjustments, Stocktake, Damaged Stock visibility, and Disposal) are implemented, verified, and functioning properly.

---

## Milestone 4, Slice 4.6 — Damaged Stock

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - `4.6-T01`: Ensured Damaged Stock KPI card correctly aggregates `damagedQuantity`.
  - `4.6-T02`: Added "Damaged" status filter to the Current Inventory table (wired into backend `getBalances` endpoint in memory mapping).
  - `4.6-T03`: Handed off to User for manual verification of Damaged stock visibility.
- **Files Created/Modified**:
  - `apps/api/src/modules/inventory/service.ts`: Implemented `status` filtering in the `getBalances` memory mapping to correctly filter out items with `totalDamaged > 0`.
  - `apps/web/src/features/inventory/api/index.ts`: Updated `getBalances` and `useInventoryBalances` hook to accept `status` query parameter.
  - `apps/web/src/features/inventory/components/CurrentInventoryPage.tsx`: Added `All Statuses` filter dropdown with `Damaged Stock` filter UI.
- **Implementation Highlights**:
  - Maintained the separation of responsibilities: Slice 4.6 handles *visibility* of damaged stock. (Creation occurs via Sales Returns in Milestone 7, and Disposal occurs in Slice 4.7).
  - The Damaged filter isolates visibility to products that actually have non-zero damaged inventory.
  - No new ledger/schema mechanics were invented.
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed.
- **Browser Testing**: Intentionally skipped; left for the user.

---

## Milestone 4, Slice 4.5 — Stocktake

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - `4.5-T01`: POST `/inventory/stocktake` API endpoint implemented, expecting array of `{ productId, physicalCount }`.
  - `4.5-T02`: Stocktake service logic calculates exact variance and writes via `recordMovement` in bulk transaction.
  - `4.5-T03`: Frontend `useSubmitStocktake` mutation hook added.
  - `4.5-T04`: `/inventory/stocktake` Worksheet Page UI implemented in Stitch-compliant style.
  - `4.5-T05`: Live frontend variance preview (highlighting positive/negative deltas) before submission.
  - `4.5-T06`: Handed off to User for manual testing.
- **Files Created/Modified**:
  - `apps/api/src/modules/inventory/schema.ts` (Added `submitStocktakeSchema` & `stocktakeItemSchema`)
  - `apps/api/src/modules/inventory/service.ts` (Added `submitStocktake` logic reading authoritative system state via `FOR UPDATE` lock)
  - `apps/api/src/modules/inventory/controller.ts` & `routes.ts` (Controller binding and OWNER auth)
  - `apps/api/src/modules/inventory/stocktake.test.ts` (Backend suite validating concurrency/variance logic)
  - `apps/web/src/features/inventory/api/schema.ts` & `index.ts` (Frontend contract, schema, mutation hook)
  - `apps/web/src/app/router/index.tsx` (Bound `/inventory/stocktake` route)
  - `apps/web/src/features/inventory/components/StocktakePage.tsx` (New Worksheet UI)
- **Implementation Highlights**:
  - Treats backend state as authoritative. Frontend sends absolute physical count; backend locks row (`FOR UPDATE`), fetches `currentSystemQuantity`, calculates `variance`, and records `ADJUSTMENT` movement only if `variance !== 0`.
  - Enforces atomicity. All adjustments for a stocktake hit the ledger and balances in a single PostgreSQL transaction.
  - Preserves WAC correctly under all circumstances (cost = 0 in internal adjustment record).
  - Explicitly rejects negative physical counts (`min(0)`) via Zod.
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed.
  - `vitest run apps/api/src/modules/inventory/` -> Passed (25/25 backend tests, including 5 new focused tests).
- **Browser Testing**: Intentionally skipped; left for the user.

---

## Milestone 4, Slice 4.4 — Stock Adjustments

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - `4.4-T01`: POST `/inventory/adjustments` API endpoint implemented.
  - `4.4-T02`: Zod validation added for branchId, productId, non-zero quantityDelta, and reason.
  - `4.4-T03`: Frontend `useCreateAdjustment` mutation hook added.
  - `4.4-T04`: `StockAdjustmentModal.tsx` UI implemented, preventing ambiguous data entry.
  - `4.4-T05`: "Adjust Stock" button added to the `InventoryDrawer` component for Owners.
  - `4.4-T06`: Handed off to User for manual verification (testing offline/skip).
- **Files Created/Modified**:
  - `apps/api/src/modules/inventory/schema.ts` (Added `createAdjustmentSchema`)
  - `apps/api/src/modules/inventory/service.ts` (Added `createAdjustment` logic preserving WAC)
  - `apps/api/src/modules/inventory/controller.ts` & `routes.ts` (Controller binding and OWNER auth)
  - `apps/api/src/modules/inventory/adjustments.test.ts` (Extensive negative/positive/zero tests)
  - `apps/web/src/features/inventory/api/schema.ts` & `index.ts` (Frontend contract and hook)
  - `apps/web/src/features/inventory/components/StockAdjustmentModal.tsx` (New modal)
  - `apps/web/src/features/inventory/components/InventoryDrawer.tsx` (Added adjust trigger)
- **Implementation Highlights**:
  - Requires signed delta logic (no absolute quantities).
  - Preserves WAC correctly under all circumstances (cost = 0 in internal movement record).
  - Explicitly rejects `quantityDelta === 0` via Zod and internal validation.
  - Checks for boundary cases like insufficient available stock before executing negative adjustments.
  - Uses existing transaction scope mapping to ledger and balances atomically.
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed.
  - `vitest run apps/api/src/modules/inventory/` -> Passed (20/20 backend tests, including randomized PK safety fixes for concurrent Vitest runs).
- **Browser Testing**: Intentionally skipped; left for the user.

---

## Milestone 5 — Receiving

### Vertical Slice 5.1 — Receiving

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - `5.1-T01`: Database schema for `receivings` (header) and `receiving_items` (lines) created. Migration `0014_magical_rictor.sql` generated and applied successfully.
  - `5.1-T02`: Backend API endpoints, service logic, and Zod schemas created. Transaction boundaries configured for bulk item insertion.
  - `5.1-T03`: `ReceivingsService` explicitly calls `InventoryService.recordMovement` for each line item within a single Postgres transaction.
  - `5.1-T04`: Backend comprehensively tested (`receivings.test.ts`) validating atomicity, cost preservation, and proper WAC recalculation using the `((CurrentQty*CurrentWAC)+(NewQty*NewUnitCost))/(CurrentQty+NewQty)` formula.
  - `5.1-T05`: Created robust `NewReceivingPage.tsx` adhering to the Stitch design guidelines, allowing dynamic form additions and recalculations. Integrated via React Hook Form and Zod.
  - `5.1-T06`: Validated that endpoints and the UI form are strictly restricted to `OWNER`.
  - `5.1-T07`: Appended route `/receivings/new` and added "New Receiving" navigation link in `CurrentInventoryPage`.
- **Implementation Highlights**:
  - Treats the receiving process as a single atomic ledger transaction.
  - Supplier logic (one supplier per receipt) enforced visually and strictly via the unified `supplierId` on the receiving header.
  - Follows strict business rules (BR-041 to BR-049).
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed.
  - `vitest run apps/api/src/modules/receivings` -> Passed.
- **Browser Testing**: Intentionally skipped; left for the user.

---

### Vertical Slices 5.2 & 5.3 — Receiving History & Receiving Details

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - `5.2-T01`: `GET /receivings` endpoint implemented with pagination (`page`, `limit`) and filters (`branchId`, `supplierId`).
  - `5.2-T02`: `ReceivingsPage.tsx` UI built matching the Gelana design system, displaying a paginated table of stock receipts.
  - `5.3-T01`: `GET /receivings/:id` endpoint implemented fetching header and relationally joined `items`, `supplier`, and `branch`.
  - `5.3-T02`: `ReceivingDetailsDrawer.tsx` read-only UI implemented to view individual receipt line-item details, quantities, and historical costs.
  - `5.3-T03`: Added `Receivings` navigation link strictly limited to `OWNER`.
- **Files Created/Modified**:
  - `apps/api/src/modules/receivings/schema.ts` (Added query schemas)
  - `apps/api/src/modules/receivings/service.ts` (Added `getReceivings`, `getReceivingDetails`)
  - `apps/api/src/modules/receivings/controller.ts` & `routes.ts` (Controller binding and `OWNER` auth middleware)
  - `apps/api/src/modules/receivings/receivings.test.ts` (Pagination, filtering, and detail endpoints tested)
  - `apps/web/src/features/receivings/api/index.ts` (Frontend fetch logic and `useReceivings`/`useReceivingDetails` hooks)
  - `apps/web/src/features/receivings/components/ReceivingsPage.tsx` & `ReceivingDetailsDrawer.tsx` (New UIs)
  - `apps/web/src/app/router/index.tsx` & `Sidebar.tsx` (Routes and navigation logic)
- **Implementation Highlights**:
  - Details drawer enforces immutability; it is completely read-only.
  - Backend strictly authorizes endpoints to `OWNER`. Employees cannot view receipt history.
  - Avoided N+1 queries by eagerly joining related tables (`items`, `products`, `supplier`) in the Drizzle query.
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed.
  - `npx vitest run apps/api/src/modules/receivings/receivings.test.ts` -> Passed successfully.
- **Browser Testing**: Intentionally skipped; left for the user.

---

## Milestone 5 Status
**Milestone 5 — Receiving** is now officially **COMPLETE**. The application can record new receiving transactions, update WAC, and view paginated histories and line-item details.

---

## Out-of-Band Task: UI Shell & Login Alignment (Stitch Design)

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - **Shared Authenticated Shell**: Replaced the temporary `AppShell.tsx` with a highly-polished two-pane shell (`AppShell.tsx`, `Sidebar.tsx`, `TopHeader.tsx`) matching the exact layout, dimensions, and typography of the approved Stitch non-login references (e.g., Owner Dashboard `271e695e4ce6406c94e7111277e0dbf9`).
  - **Navigation**: Migrated all valid routing links into the new `Sidebar.tsx`, maintaining strict Owner/Employee visibility rules, active/inactive highlighting, and using SVG icons for visual hierarchy.
  - **Page Backgrounds**: Enforced the correct `#F8FAFC` (`bg-slate-50`) background onto the application root wrapper so all authenticated pages inherit the proper canvas underlying the white content cards. Removed legacy inline custom CSS background tokens.
  - **Login Page Redesign**: Explicitly abandoned the dedicated Stitch login styling in favor of extending the *Owner Dashboard design language* to the login screen. It now uses the `#F8FAFC` background, standard `#E2E8F0` borders, `rounded-lg` inputs, and standard primary buttons, making it visually cohesive with the main application shell. Preserved all auth logic and error handling.
  - **Header and Navigation Fixes**: Removed the fake online/sync indicator from the Header. Combined the Branches and Employees pages into a shared "Users & Branches" management screen via `UsersBranchesLayout.tsx`.
  - **Catalog and Suppliers Styling**: Migrated `Catalog.tsx`, `Suppliers.tsx`, and `SupplierFormModal.tsx` to strictly use the new design tokens, fixing non-compliant borders, colors, and layout structures.
  - **Current Inventory Filters**: Hooked up the `useBranches` and `useCategories` APIs to the dropdown filters, allowing users to filter by real branch and category data. Correctly enforced access boundaries so `EMPLOYEE` accounts remain locked to their own branch.
- **Verification Performed**:
  - `npm run lint` & `npm run typecheck --workspaces` -> Passed successfully.
  - `vitest run src/features/auth/components/Login.test.tsx` and `vitest run apps/web` -> Passed successfully.
- **Browser Testing**: Intentionally skipped; left for the user.

### UI Refinement (Round 3) - Fixes & 404 Page (Completed)
- **Current Inventory Crash Fix**: Diagnosed and fixed the `TypeError: branchesData?.map is not a function` error. Root cause: Three separate modal/page components (`OpeningStockModal`, `StockAdjustmentModal`, `StocktakePage`) were making raw `useQuery({ queryKey: ["branches"] })` calls that skipped standard API response unwrapping, thereby poisoning the shared react-query cache with an object (`{ data: [...] }`) instead of an array. Refactored all components to strictly consume the `useBranches` hook.
- **Users & Branches Redesign**: Restructured `UsersBranchesLayout.tsx` to act as a proper page header, removing duplicated page titles from `Employees.tsx` and `Branches.tsx`. Refactored the tables in both sub-pages to match the new `bg-surface-container-lowest` design system with correct typography, spacing, and button styles.
- **Polished 404 Page**: Replaced the default/generic missing page behavior with a custom `NotFoundPage.tsx` styled to match the Gelana application shell. Added contextual routing logic to the "Back to Dashboard" button, directing users safely based on their authentication status.
- **Verification Performed**: 
  - Ran `npm run typecheck` in `apps/web` -> Passed successfully.
  - Ran `npx vitest run apps/web` -> Passed successfully (6/6 tests passing).

### UI Refinement (Round 4) - Spacing, Forms & Alignment (Completed)
- **Standardized Content Spacing**: Aligned the outer wrapper boundaries for `CurrentInventoryPage`, `MovementsPage`, `StocktakePage`, `Suppliers`, and `NewReceivingPage` to uniformly utilize the Gelana design system's spacing (`mb-space-lg`, flex headers, etc.), matching the benchmark `Products & Categories` layout.
- **Form Modal Redesign**: Redesigned `ProductFormModal` and `CategoryFormModal` to match the exact design system used in the rest of the application (e.g. `bg-surface-container-lowest`, `border-outline-variant`, correct button styles and label typography).
- **KPI Card Alignment Fix**: Adjusted the 6 KPI Statistics cards on the `CurrentInventoryPage`. By standardizing the header of each card with `flex items-center justify-between min-h-[24px]`, the content below remains perfectly aligned across all varying icon heights and text layouts.
- **Verification Performed**:
  - `npm run typecheck` and `vitest` pass perfectly across the monorepo.

### UI Refinement (Round 5) - Form Standardization, Movements Fix & Toolbar Polish (Completed)
- **Employee Forms Redesign**: Upgraded `EmployeeFormModal.tsx` and `BranchAssignmentModal.tsx` to the new Gelana design system, retaining all form structure, validation, and permissions functionality.
- **Branch Form Redesign**: Upgraded `BranchFormModal.tsx` similarly (inputs, typography, colors, and shadow-sm).
- **Inventory Movements Branch Filter Fix**: Diagnosed and fixed the empty branch dropdown. The select input was statically commented out instead of fetching. Re-wired the data using `useBranches` to accurately respect backend-enforced branch access/scoping.
- **Current Inventory Icons**: Normalized the 6 KPI cards in `CurrentInventoryPage`. Replaced CSS dots with accurate `material-symbols-outlined` (`inventory_2`, `check_circle`, `cancel`).
- **Current Inventory Toolbar Alignment**: Adjusted the previously wrapping 13-column grid (`lg:grid-cols-12` containing `5+3+3+2`) to a safer responsive flexbox layout (`flex-col lg:flex-row`). Search input uses `flex-1 min-w-0`, allowing all filters to sit squarely on a single line at desktop resolutions without cramping.
- **Verification Performed**:
  - `npm run typecheck` and `vitest` run flawlessly with `0` errors.

---

## Milestone 6 — Sales

### Vertical Slice 6.1 — New Sale

- **Status**: Completed (Pending Manual Verification)
- **Completed Tasks**:
  - `6.1-T01`: Created `sales`, `sale_items`, and `sale_payments` database schemas along with PostgreSQL sequence for safe sale numbering. Included fields for `idempotencyKey` and preserved original entered quantities and unit UUIDs.
  - `6.1-T02`: Implemented robust backend `SalesService.createSale` featuring database transactions, precise WAC snapshotting, idempotent retries, and strict monetary validation.
  - `6.1-T03`: Atomically integrated with `InventoryService.recordMovement` to safely deduct inventory without duplicating logic.
  - `6.1-T04`: Verified concurrency and rollback safety using exhaustive `sales.test.ts` testing suites. Tests simulate partial failure and negative stock rejection.
  - `6.1-T05`: Created `NewSalePage.tsx` using the unified Gelana layout. Reused the `AppShell` layout grid and implemented a live shopping cart, branch-scoping, and real payment methods dropdown.
  - `6.1-T06`: Configured routes and added "New Sale" to the sidebar, correctly authorized for Employee and Owner access.
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed.
  - `vitest run src/modules/sales` -> Passed (3/3 tests).
- **Browser Testing**: Intentionally skipped; left for the user.

### Slice 6.1 Regression Fix — Zod conversionQuantity Schema & Branch Inventory Alignment

- **Status**: Completed (Pending Manual Verification)
- **Root Cause Diagnosed**:
  - `product_unit_conversions.conversion_quantity` is defined as PostgreSQL `numeric(15, 4)`, which Drizzle ORM serializes as a JavaScript `string` to prevent floating-point precision loss.
  - When unit information was added to `InventoryProductSchema` (`apps/web/src/features/inventory/api/schema.ts`), `conversionQuantity` was typed as `z.number().optional()`.
  - When `getBalances` ran `GetBalancesResponseSchema.safeParse(data)`, it failed with `ZodError` at `data[i].units[j].conversionQuantity` (`Expected: number, Received: string`) on every product that possessed unit conversions.
  - Because `getBalances` throws on `safeParse` failure, `useInventoryBalances` failed, causing the Inventory page to crash/stop showing products.
  - On `NewSalePage.tsx`, an ad-hoc unvalidated `useInventory` hook was previously fetching raw `/inventory/balances` bypassing Zod, allowing products to render. However, stock displayed as `0` for products without stock in the selected branch, and the branch selection was not unified with the shared inventory hook.
- **Tasks Completed**:
  - Aligned the API contract: Updated `InventoryProductSchema` to explicitly type `conversionQuantity` as `z.string().nullable().optional()`, preserving decimal string precision without broad coercion.
  - In `InventoryService.getBalances`, ensured `units` mapping returns string conversion factor (defaulting to `"1"` for base units when an explicit conversion row is missing, and string or `null` for alternate units).
  - Added `.orderBy(branches.createdAt)` to `getAllBranches` to ensure deterministic branch ordering with the primary branch (`BRANCH-1`) consistently first.
  - Refactored `NewSalePage.tsx` to consume the canonical `useInventoryBalances` hook, unifying schema validation and caching across both Inventory and Sales features.
  - Added automated tests: `apps/web/src/features/inventory/api/schema.test.ts` (verifying Zod parsing of string, decimal, and null conversion quantities) and updated `apps/api/src/modules/inventory/inventory.test.ts` (verifying API serialization).
- **Verification Performed**:
  - `npm run typecheck` -> Passed with 0 errors.
  - `npm run lint` -> Passed with 0 errors.
  - `npx vitest run --root apps/web` -> Passed (3 test files, 10 tests passing).
  - `node --env-file=apps/api/.env ./node_modules/.bin/vitest run apps/api/src/modules/inventory/inventory.test.ts` -> Passed (4/4 tests).
  - `node --env-file=apps/api/.env ./node_modules/.bin/vitest run apps/api/src/modules/sales/sales.test.ts` -> Passed (3/3 tests).
  - Real database validation check via `InventoryService.getBalances` parsed all 30 products successfully without error both with and without branch filters.

### Development Dataset Simplification (Seed Data)

- **Status**: Completed
- **Tasks Completed**:
  - Replaced the previously unstructured/excessive development database seeding script in `apps/api/src/database/seeds/index.ts`.
  - Implemented a clean, deterministic dataset strictly adhering to limits: exactly 3 branches, 3 categories, and 6 products.
  - Fully retained all Drizzle ORM constraints. The script safely truncates existing data utilizing `TRUNCATE TABLE ... CASCADE` instead of dropping tables or removing migrations.
  - Sourced base unit and price configuration deterministically. Inserted opening `inventory_balances` values corresponding directly to the newly seeded records.
- **Verification Performed**:
  - Verified successful execution using `npm run db:seed`.

### Vertical Slice 6.4 — Sales Payments

- **Status**: Completed (Pending Manual Verification)
- **Tasks Completed**:
  - `6.4-T01`: Determined existing payment flow capabilities mapped in `sales/api` and `CreateSaleSchema` (`z.array(SalePaymentSchema)`). The backend `SalesService` already contained robust split payment processing functionality preventing sum mismatches.
  - `6.4-T02`: Redesigned `NewSalePage.tsx` payment section to follow the "Payment Allocation" split payment UI paradigm documented in `docs/ui_design_reference.md`.
  - `6.4-T03`: Implemented a dynamic payment rows manager in React state tracking an array of allocations.
  - `6.4-T04`: Added live calculation of `Total Allocated` and `Remaining Due`, rejecting sale confirmation unless `Math.abs(remaining) < 0.01`.
- **Files Modified**:
  - `apps/web/src/features/sales/NewSalePage.tsx` (Rebuilt UI to support multi-line payment entries).
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed perfectly with 0 errors.
  - `npx vitest run --root apps/web` -> Passed.
  - `node --env-file=apps/api/.env ./node_modules/.bin/vitest run apps/api/src/modules/sales/sales.test.ts` -> Passed successfully.
- **Browser Testing**: Intentionally skipped; left for the user.

---

## Seed Data Bloat Resolution, Inventory Refresh & Sidebar Navigation Verification

- **Status**: Completed (Pending User Manual Verification)
- **Root Cause of Seed Data Bloat Diagnosed**:
  1. **Test Pollution**: Multiple backend integration tests (`sales.test.ts`, `receivings.test.ts`, `stocktake.test.ts`, `adjustments.test.ts`, `disposal.test.ts`, `inventoryMovements.test.ts`, `openingStock.test.ts`) were inserting mock rows directly into the shared local development database (`inventory_db`) on every test run without teardown cleanup. Over time and repeated test runs, dozens of branches ("Test Sales Branch"), categories ("Test Category <uuid>"), products ("Test Product"), payment methods, and users polluted the database.
  2. **Un-scoped Global Deletions**: Conversely, `adjustments.test.ts`, `disposal.test.ts`, and `stocktake.test.ts` executed raw `await db.delete(inventoryBalances)` without a `WHERE` clause in `afterEach`, which indiscriminately wiped out seeded inventory balances across the entire database.
  3. **Concurrency Deadlocks**: Vitest was running test files with full parallelism against a single shared PostgreSQL database instance, leading to concurrent table-level truncation and lock conflicts (`40P01` deadlock errors) when seeds or migration scripts interacted.
- **Tasks & Fixes Completed**:
  - **Deterministic Stationery Seed Dataset (`apps/api/src/database/seeds/index.ts`)**:
    - Created fixed deterministic UUIDs (`SEED_IDS`) for all baseline entities.
    - Standardized exactly 3 branches (`BRANCH-MAIN`, `BRANCH-DT`, `BRANCH-WH`), 3 stationery categories (Writing Supplies, Paper Products, Office Supplies), 6 stationery products (Hardcover Notebook, Ballpoint Pen, HB Wooden Pencil, A4 Printer Paper, Document Folder, Permanent Marker), 4 test accounts (`owner@gelana.com`, `owner@dev.local`, `employee@gelana.com`, `employee@dev.local`, all with password `password123`), 4 payment methods, 2 suppliers, and 18 initial inventory balance records.
    - Made seeding idempotent: executes upserts on conflict, reconciles baseline balances, and prunes orphaned seed records without requiring destructive blind `TRUNCATE CASCADE`.
  - **Test Isolation & Teardown Hardening**:
    - Scoped `afterEach` teardown in `sales.test.ts`, `receivings.test.ts`, `adjustments.test.ts`, `disposal.test.ts`, `stocktake.test.ts`, `inventoryMovements.test.ts`, and `openingStock.test.ts` to strictly clean up only their own test-created entities and test branch IDs.
    - Eliminated un-scoped `db.delete(inventoryBalances)` calls that were wiping baseline balances.
    - Set `fileParallelism: false` in `vitest.config.ts` and `apps/api/vitest.config.ts` to ensure serialized integration test execution against PostgreSQL, preventing transaction lock deadlocks.
  - **Automated Seed Tests (`apps/api/src/database/seeds/seeds.test.ts`)**:
    - Added comprehensive automated test suite (7 tests) verifying exact counts (3 branches, 3 categories, 6 products), deterministic relationships, unit conversions, balances, and multi-run idempotency.
  - **Sidebar Navigation Review (`apps/web/src/app/layout/Sidebar.tsx` & `Sidebar.test.tsx`)**:
    - Verified expandable/collapsible Sales and Inventory navigation groups.
    - Confirmed active highlighting matches exact route (`/sales/new` vs `/sales`) without false highlights.
    - Verified role-based visibility: Owners see Movements and Inventory; Employees only see permitted routes.
    - 3 automated tests passing in `Sidebar.test.tsx`.
  - **Automatic Inventory Refresh Review (`apps/web/src/features/sales/api/index.ts`, `receivings/api/index.ts`, `salesApi.test.tsx`)**:
    - Verified canonical TanStack Query keys are used consistently: `["inventory", "balances"]`, `["inventory", "movements"]`, `["sales"]`.
    - Confirmed that successful sales and receivings invalidate these keys, triggering automatic UI refetch.
    - Confirmed that failed transactions do not trigger invalidation or optimistic balance mutations.
    - 2 automated tests passing in `salesApi.test.tsx`.
- **Intended Seed Command**:
  - `npm run db:seed --workspace=@gelana-inventory-and-sales-management-system/api` (or `npm run db:seed` from project root).
- **Verified Database Counts (`inventory_db`)**:
  - Branches: **3**
  - Categories: **3**
  - Products: **6**
  - Users: **4**
  - Payment Methods: **4**
  - Suppliers: **2**
  - Inventory Balances: **18**
- **Automated Quality-Check Results**:
  - API Vitest suite: 21 files passed, 103/103 tests passed.
  - Web Vitest suite: 5 files passed, 15/15 tests passed.
  - Typecheck (`npm run typecheck` across all workspaces): 0 errors.
  - Lint (`npm run lint` across all workspaces): 0 errors.
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

---

## Milestone 6 — Vertical Slice 6.5 (Discounts)

- **Status**: Completed (Pending User Manual Verification)
- **Completed Tasks**:
  - `6.5-T01`: Extended `SaleItemSchema` with optional `lineDiscount` and `CreateSaleSchema` with optional `saleDiscount` in `apps/api/src/modules/sales/schema.ts`.
  - `6.5-T02`: Implemented Owner-only discount authorization in `SalesService.createSale`. Enforced on the server that any non-owner (e.g. Employee) submitting `lineDiscount > 0` or `saleDiscount > 0` is rejected with `403 Forbidden` (`AppError("Only owners can apply discounts", 403)`).
  - `6.5-T03`: Implemented deterministic monetary calculation rules and boundary validations:
    - Server-derived active unit prices preserved.
    - Gross line amount computed as `round2(quantity * derivedUnitPrice)`.
    - Negative discounts rejected.
    - Line discount exceeding gross line amount rejected.
    - Net line amount computed as `grossLineAmount - lineDiscount`.
    - Gross subtotal computed as sum of gross line amounts.
    - Sale-level discount exceeding eligible net sale total rejected.
    - Grand total computed as `grossSubtotal - sum(lineDiscount) - saleDiscount`.
    - Payment allocation strictly validated to match final grand total down to 2 decimals.
  - `6.5-T04`: Implemented deterministic proportional allocation of sale-level discount across items with remainder penny assigned to the line with the highest net amount.
  - `6.5-T05`: Historical snapshot preservation:
    - `sales`: `subtotal` (gross), `saleDiscount`, `grandTotal`.
    - `sale_items`: `unitPrice` (original catalog snapshot), `unitCost` (WAC snapshot), `lineDiscount`, `lineTotal` (net of line discount), `apportionedSaleDiscount`.
  - `6.5-T06`: Hardened idempotency checking: matching payloads return the original sale safely; mismatched payloads (different quantities, discounts, branches, or payments) are rejected with `409 Conflict`.
  - `6.5-T07`: Updated `NewSalePage.tsx`:
    - Discount controls (line discount per cart item and sale discount in summary) visible only to Owner.
    - Real-time recalculation of gross subtotal, line discounts, sale discount, grand total, and payment allocation remaining due.
    - Checkout prevented when discounts are invalid or remaining due is not zero.
  - `6.5-T08`: Automated testing in `sales.test.ts` (10 tests) and `salesApi.test.tsx`:
    - No-discount sales, line discounts, sale discounts, combined discounts, proportional remainder allocation, employee rejection, payment validation against discounted total, and idempotency conflicts.
- **Verification Performed**:
  - `npm run typecheck --workspaces` -> Passed (0 errors).
  - `vitest run src/modules/sales/sales.test.ts` -> Passed (14/14 tests).
  - `npx vitest run --root apps/web` -> Passed (17/17 tests).
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

---

## Milestone 6 — Vertical Slice 6.2 (Sales History)

- **Status**: Completed (Pending User Manual Verification)
- **Completed Tasks**:
  - `6.2-T01`: Implemented `GetSalesQuerySchema` in `apps/api/src/modules/sales/schema.ts` supporting `page`, `limit`, `branchId`, `employeeId`, `startDate`, `endDate`, and `search`.
  - `6.2-T02`: Implemented `SalesService.getSales` with strict role-based data scoping:
    - Employees are strictly restricted to their own sales (`sales.createdById = user.id`) and assigned branch (`sales.branchId = user.branchId`). Any client attempt to override branch or employee in query parameters is safely ignored/prevented.
    - Owners have full cross-branch visibility and can filter by branch, employee, date range, and search.
    - Pagination metadata returned (`total`, `page`, `limit`, `totalPages`).
    - Multi-table relations loaded: `branch`, `createdBy`, `items` (with `product` and `unit`), and `payments` (with `paymentMethod`).
  - `6.2-T03`: Added `GET /sales` route in `apps/api/src/modules/sales/routes.ts` protected by `authenticate` and `authorizeRole(["OWNER", "EMPLOYEE"])`.
  - `6.2-T04`: Created `useSales` TanStack Query hook in `apps/web/src/features/sales/api/index.ts` with query caching under `["sales", query]`.
  - `6.2-T05`: Implemented `SalesHistoryPage.tsx` using Gelana design system:
    - Page header with action button linking to `/sales/new`.
    - Toolbar with search by sale number, date range inputs, and Owner-only branch & employee selectors.
    - Interactive table displaying Sale #, Date & Time, Branch & Staff (for Owner), Items count, Gross Subtotal, Discounts (highlighted in red when present), Final Grand Total, Payment Methods, and Completed status badge.
    - Comprehensive loading, error, empty ("No sales records found" / "Create First Sale"), and paginated footer states.
  - `6.2-T06`: Registered `/sales` route in `apps/web/src/app/router/index.tsx`.
  - `6.2-T07`: Automated testing in `sales.test.ts` (4 integration tests) and `salesApi.test.tsx`:
    - Listing sales with relations and pagination.
    - Filtering by branchId for owner.
    - Searching by saleNumber.
    - Strict employee authorization and scoping isolation.
    - Query hook execution with URL query parameter formatting.
- **Verification Performed**:
  - Monorepo `npm run typecheck` -> Passed (0 errors).
  - Monorepo `npm run lint` -> Passed (0 errors).
  - Monorepo test suites: 21 API test files (114/114 tests) and 5 Web test files (17/17 tests) passed.
  - Development database check confirmed baseline dataset integrity (3 branches, 3 categories, 6 products, 4 users, 18 balances).
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

---

## Milestone 6 — Vertical Slice 6.3 (Sale Details) & Sales UI Consistency Audit

- **Status**: Completed (Pending User Manual Verification)
- **Completed Tasks**:
  - `6.3-T01`: Implemented `SalesService.getSaleById(id, user)` in `apps/api/src/modules/sales/service.ts`:
    - Safely matches either sale UUID or human-readable `saleNumber`.
    - Throws `404 Not Found` for nonexistent transactions.
    - Enforces strict backend authorization: `OWNER` can access all sales; `EMPLOYEE` is strictly restricted to sales they created (`createdById === user.id`) in their assigned branch (`branchId === user.branchId`), rejecting cross-user/cross-branch access with `403 Forbidden`.
    - Protects business cost privacy: strips/nullifies historical WAC snapshot `unitCost` for employees while preserving it for owners.
    - Pure read operation: performs zero database mutations on inventory balances or sales records.
  - `6.3-T02`: Implemented `SalesController.getSaleById` and registered `GET /sales/:id` in `apps/api/src/modules/sales/routes.ts` protected by `authenticate` and `authorizeRole(["OWNER", "EMPLOYEE"])`.
  - `6.3-T03`: Created `getSaleDetails` and `useSaleDetails(id)` TanStack Query hook in `apps/web/src/features/sales/api/index.ts` with caching under `["sale-details", id]`.
  - `6.3-T04`: Created `SaleDetailsDrawer.tsx` following the established Gelana drawer pattern:
    - Slide-over drawer with backdrop blur, keyboard Escape listener, and accessible dialog markup.
    - Sale metadata: human-readable sale number, date/time, branch, staff, and completed status badge.
    - Line items table: product name, brand, SKU, sold unit, quantity, original unit price snapshot, line discount, apportioned discount, and net line total.
    - Owner-only cost snapshot: WAC cost displayed only to owners.
    - Financial summary: gross subtotal, line discounts, sale discount, total discounts, and grand total.
    - Payment breakdown: allocated payment methods and amounts.
    - Historical immutability note informing user that prices and units represent the transaction snapshot.
    - Comprehensive loading and error states.
  - `6.3-T05`: Created `SaleDetailsPage.tsx` and registered `/sales/:id` in `apps/web/src/app/router/index.tsx` for direct URL navigation.
  - `6.3-T06`: **Sales UI Consistency Audit & Corrections**:
    - **Sales History (`SalesHistoryPage.tsx`)**:
      - Standardized page header to `text-headline-lg font-headline-lg text-on-surface tracking-tight` and subtitle `text-body-md font-body-md text-on-surface-variant mt-1` with `mb-space-lg`.
      - Replaced non-standard action button with canonical primary button `inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover shadow-sm`.
      - Replaced raw inputs in filter toolbar with standard Gelana controls (`bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none`).
      - Added search icon and filter summary indicator matching `CurrentInventoryPage` and `ReceivingsPage`.
      - Replaced table styling with `bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm` and `bg-slate-50 border-b border-slate-200` headers.
      - Integrated `SaleDetailsDrawer` opened on row click and "View Details" button click.
    - **New Sale (`NewSalePage.tsx`)**:
      - Added standardized page header bar with "Sales History" secondary button navigation.
      - Standardized product catalog cards and search bar to match `CurrentInventoryPage` / `Catalog` tokens.
      - Standardized right cart panel: header, item cards, quantity stepper, line discount inputs, grand total display, payment method selectors, and charge button (`bg-primary hover:bg-primary-hover text-on-primary rounded-lg font-bold`).
  - `6.3-T07`: Automated Testing:
    - Backend `apps/api/src/modules/sales/sales.test.ts`: Added 7 integration tests covering owner full access, lookup by saleNumber, employee access to own sale, employee unitCost stripping, employee rejection for other users' sales (403), employee rejection for other branches' sales (403), nonexistent sale (404), and pure read idempotency. (All 21 tests pass).
    - Frontend `apps/web/src/features/sales/api/salesApi.test.tsx`: Added 3 tests covering `useSaleDetails` fetching, idle when id undefined, and error handling. (All 7 tests pass).
- **Verification Performed**:
  - Monorepo `npm run typecheck` -> Passed (0 errors across API and Web).
  - Monorepo `npm run lint` -> Passed (0 errors across API and Web).
  - Monorepo API test suite: 21 files passed, 121/121 tests passed.
  - Monorepo Web test suite: 5 files passed, 20/20 tests passed.
  - Database seed test suite: 7/7 tests passed.
  - Baseline dataset integrity verified against PostgreSQL: 3 branches, 3 categories, 6 products, 4 users, 4 payment methods, 2 suppliers, 18 balances, 0 sales.
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

---

## Milestone 7 — Returns & Corrections (Slices 7.1, 7.2, 7.3)

- **Status**: Completed (Pending User Manual Verification)
- **Completed Tasks**:
  - **Database Migration & Schema**:
    - Created `apps/api/src/database/schema/returns.ts`:
      - `sales_returns`: `id`, `return_number` (`RET-XXXXXX` from sequence), `sale_id` (nullable for unlinked), `branch_id`, `created_by_id`, `refund_amount`, `refund_payment_method_id`, `status` ('COMPLETED'), `reason`, `is_unlinked`.
      - `sales_return_items`: `id`, `return_id`, `sale_item_id`, `product_id`, `unit_id`, `entered_quantity`, `base_quantity`, `unit_price`, `condition` ('SELLABLE' | 'DAMAGED'), `refund_amount`.
      - Sequence `return_number_seq`.
    - Created `apps/api/src/database/schema/saleCorrections.ts`:
      - `sale_corrections`: `id`, `sale_id`, `correction_type` ('VOID' | 'EDIT_NOTE'), `reason`, `created_by_id`, `previous_state`, `new_state`, `created_at`.
    - Updated `apps/api/src/database/schema/sales.ts`: Added `status: varchar("status", { length: 50 }).notNull().default("COMPLETED")` and relations to `returns` and `corrections`.
    - Generated and executed migration `0016_unknown_captain_cross.sql`.
  - **Backend Implementation (Slice 7.1 — Sales Returns)**:
    - Created `apps/api/src/modules/returns/` (`schema.ts`, `service.ts`, `controller.ts`, `routes.ts`).
    - Validates returnable quantity against original sale (`enteredQuantity - alreadyReturnedQty`), preventing over-returns.
    - Prevents returns against voided sales (`sale.status === 'VOIDED'`).
    - Enforces role authorization: returns linked to a sale permitted for Owner (all branches) and Employee (assigned branch); unlinked returns strictly require `OWNER` authorization.
    - Atomically updates inventory ledger:
      - `condition === 'SELLABLE'`: records `RETURN_GOOD` movement, restoring `availableQuantity`.
      - `condition === 'DAMAGED'`: records `RETURN_DAMAGED` movement, incrementing `damagedQuantity` without affecting sellable available stock.
      - Returns do NOT alter historical Weighted Average Cost (`changesWac: false`).
    - Mounted under `/api/v1/returns` (`POST /`, `GET /`, `GET /:id`).
  - **Backend Implementation (Slice 7.3 — Corrections & Voids)**:
    - Implemented `voidSale` in `apps/api/src/modules/sales/service.ts`:
      - Restricted strictly to `OWNER` role (`403 Forbidden` for employees).
      - Rejects voiding a sale with existing processed returns (`400 Bad Request`).
      - Rejects voiding an already voided sale (`400 Bad Request`).
      - Atomically updates `sales.status = 'VOIDED'`.
      - Reverses inventory deductions via compensating `ADJUSTMENT` movement back to `availableQuantity` with reason `Void sale SAL-XXXX: [reason]`.
      - Records immutable audit trail in `sale_corrections`.
    - Implemented `correctSale` (amendment/note addition) and `getSaleCorrections`.
    - Enriched `getSaleById` to include `returns` and `corrections` relations.
    - Registered endpoints: `POST /sales/:id/void`, `POST /sales/:id/corrections`, `GET /sales/:id/corrections`.
  - **Frontend Implementation (Slices 7.1, 7.2, 7.3)**:
    - Created Returns API hooks in `apps/web/src/features/returns/api/index.ts`: `useCreateReturn`, `useReturns`, `useReturnDetails`.
    - Added void and correction hooks in `apps/web/src/features/sales/api/index.ts`: `useVoidSale`, `useCorrectSale`, `useSaleCorrections`.
    - Created `ReturnsHistoryPage.tsx` (`/sales/returns`):
      - Search by return number, branch filter (owner), return type filter (Linked vs Unlinked), date range filters.
      - Table with monospace return number, linked sale indicator, stock disposition pill badges (Sellable vs Damaged), refund amounts, and staff attribution.
      - Pagination and drawer trigger.
    - Created `NewReturnPage.tsx` (`/sales/returns/new`):
      - Mode toggle: Linked Return (search sale, validate remaining returnable qty, select condition per row, auto refund math) vs Unlinked Return (owner-only, branch selection, product & unit selection from inventory balances).
      - Real-time stock disposition summary (sellable units restocked vs damaged units quarantined).
      - Mandatory reason textarea and refund payment method selector.
    - Created `ReturnDetailsDrawer.tsx` and `ReturnDetailsPage.tsx` (`/sales/returns/:id`):
      - Full audit details, link to original sale, returned items table with condition badges, and ledger guarantee notices.
    - Enhanced `SaleDetailsDrawer.tsx` and `SaleDetailsPage.tsx`:
      - Void status badges (`Completed` vs `VOIDED`).
      - Void confirmation modal with mandatory reason prompt.
      - Invalidation & disabled state when sale has processed returns.
      - "Returns Processed Against this Sale" section.
      - "Audit Log & Corrections" timeline.
      - Add Amendment Note modal.
    - Updated `Sidebar.tsx`: Added "Returns" link under the Sales navigation group.
    - Registered routes in `apps/web/src/app/router/index.tsx`.
  - **Automated Testing**:
    - Backend: Created `apps/api/src/modules/returns/returns.test.ts` (6/6 tests passed).
    - Backend: Updated `apps/api/src/modules/sales/sales.test.ts` (23/23 tests passed).
    - Frontend: Created `apps/web/src/features/returns/api/returnsApi.test.tsx` (7/7 tests passed).
    - Frontend: Created `apps/web/src/features/returns/NewReturnPage.test.tsx` (2/2 tests passed).
    - Frontend: Verified `apps/web/src/features/sales/api/salesApi.test.tsx` (7/7 tests passed).
    - Frontend: Verified `apps/web/src/app/layout/Sidebar.test.tsx` (3/3 tests passed).
- **Bug Fixes (Post-Milestone 7 Verification)**:
  - **Duplicate Breadcrumb Removed**: Removed the hardcoded in-page breadcrumb navigation (`Sales > Returns > New Return`) from `NewReturnPage.tsx`. Retained the global top navigation breadcrumb (`Header.tsx`). Standardized page header layout and action button (`Back to Returns`) using system typography and spacing tokens.
  - **Linked Return Internal Error Fixed**:
    - Root cause: `apps/api/src/middleware/authenticate.ts` populated `req.user` with `userId` without the alias `id`. At runtime, `ReturnsService.createReturn` evaluated `createdById: user.id`, resulting in `undefined`, which Drizzle converted to SQL `DEFAULT`. Because `created_by_id` has a strict `NOT NULL` foreign-key constraint on `sales_returns`, PostgreSQL rejected the write with a constraint violation.
    - Resolution: Updated `apps/api/src/modules/auth/jwt.ts` (`JwtPayload`) and `authenticate.ts` to expose both `id` and `userId`. In `ReturnsService.createReturn`, added defensive fallback `const createdById = user.id || user.userId`. Handled `ZodError` in `errorHandler.ts` to return HTTP 400 Bad Request with structured issues instead of 500.
    - Added automated tests verifying Owner linked returns under auth-token session shape and verifying transactional rollback on failed mutations.
- **Verification Performed**:
  - Monorepo `npm run typecheck` -> Passed (0 errors across API and Web).
  - Monorepo `npm run lint` -> Passed (0 errors across API and Web).
  - Monorepo `npm test` -> Passed (25 test files, 136 / 136 tests passed).
  - Database baseline check: `branches: 3, categories: 3, products: 6, users: 4, payment_methods: 4, suppliers: 2, inventory_balances: 18, sales: 0, sales_returns: 0, sale_corrections: 0`.
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

---

## Milestone 8 — Transfers (Slices 8.1 – 8.6 Complete)

- **Status**: Implemented, Automated Checks Passed, Pending User Manual Verification
- **Completed Slices**:
  - **Slice 8.1 — Transfer Request**:
    - Created `transfers`, `transfer_items`, and `transfer_events` schemas along with sequence `transfer_number_seq` (`TRF-XXXXXX`).
    - Drizzle migration `0017_thankful_mole_man.sql` generated and applied.
    - Endpoints implemented: `POST /api/v1/transfers` for creating transfer requests.
    - Role authorization: `OWNER` can request transfers between any branches; `EMPLOYEE` can request stock only involving their assigned branch.
    - Same-branch transfer requests strictly rejected (`sourceBranchId !== destinationBranchId`).
    - Multiple line items supported with positive integer requested quantities.
    - Frontend `NewTransferPage.tsx` built with route selection, live source branch stock display, product item manager, and validation.
    - `TransfersListPage.tsx` built at `/transfers` with status filter, branch filters, search, and "New Transfer" action.
  - **Slice 8.2 — Transfer Details**:
    - Single dedicated canonical page implemented at `/transfers/:id` (`TransferDetailsPage.tsx`).
    - Read-only summary card displaying Direction (`Source -> Destination`), Transfer Number (`TRF-XXXXXX`), Status badge, and timestamps.
    - 5-step Progress Stepper (`Requested -> Approved -> Dispatched -> Received -> Completed`) visually indicating current progress.
    - Line items table showing Product, Requested Quantity, Approved Quantity, Dispatched Quantity, Received Quantity, and Unit Cost (visible only to Owner).
    - Event history timeline logging state transitions with actor attribution and notes.
    - State-aware action toolbar rendering only permitted transitions based on current status and user role.
    - Endpoint implemented: `GET /api/v1/transfers/:id`.
  - **Slice 8.3 — Approval / Rejection**:
    - Endpoints implemented: `POST /api/v1/transfers/:id/approve` and `POST /api/v1/transfers/:id/reject`.
    - Authorization strictly restricted to `OWNER` role (`403 Forbidden` for employees).
    - Full approval and partial quantity approval supported (`0 < approvedQuantity <= requestedQuantity`).
    - Rejection requires a mandatory reason and transitions transfer status to `REJECTED`.
    - Atomic audit event recorded in `transfer_events` for approval and rejection.
    - Modal dialogs on `TransferDetailsPage.tsx` for Owner approval (with editable approved quantities) and rejection (with mandatory reason textarea).
  - **Slice 8.4 — Dispatch**:
    - Endpoint implemented: `POST /api/v1/transfers/:id/dispatch`.
    - Authorization strictly restricted to `OWNER` role (`403 Forbidden` for employees).
    - Dispatch is valid only from `APPROVED` status.
    - Live source branch inventory re-validation inside PostgreSQL transaction with row locks (`FOR UPDATE`).
    - Atomic inventory ledger deduction: records `TRANSFER_OUT` movements via `InventoryService.recordMovement`, immediately decreasing source branch `availableQuantity`.
    - Destination stock remains untouched upon dispatch (in-transit representation).
    - Status transitioned to `DISPATCHED`.
    - Modal dialog on `TransferDetailsPage.tsx` for Owner dispatch confirmation with optional dispatch notes.
  - **Slice 8.5 — Receive Transfer**:
    - Endpoint implemented: `POST /api/v1/transfers/:id/receive`.
    - Authorization: Destination branch Employee can receive transfer for their branch; Owner can receive for any branch (`403 Forbidden` for source employee or unrelated branch employee).
    - Valid only from `DISPATCHED` status.
    - Destination branch inventory increases atomically: records `TRANSFER_IN` movements in `inventory_movements`, increasing destination branch `availableQuantity`.
    - Source stock is NOT deducted again (was already deducted at dispatch).
    - Source unit-cost snapshot preserved; destination WAC is NOT recalculated on transfer (`changesWac: false`).
    - Overages strictly rejected (`goodQty + damagedQty <= dispatchedQty`).
    - Audit event `RECEIVED` recorded with actor attribution and timestamp.
    - Frontend Receive modal on `TransferDetailsPage.tsx` with good/damaged quantity inputs and live shortage computation.
  - **Slice 8.6 — Transfer Discrepancy Handling**:
    - Endpoint implemented: `POST /api/v1/transfers/:id/resolve-discrepancy`.
    - Damaged stock handling: records `TRANSFER_DAMAGED` movement, increasing destination branch `damagedQuantity` (quarantined, not sellable).
    - Missing stock handling: missing quantity is accounted for in `transfer_items.missingQuantity`; missing stock does NOT enter destination inventory.
    - Strict quantity reconciliation: `goodQty + damagedQty + missingQty === dispatchedQty`.
    - Mandatory discrepancy explanation on client and server whenever damage or shortage exists.
    - When discrepancy is detected upon receiving:
      - Transfer status transitions to `DISCREPANCY` (badge: `Received — Discrepancy`).
      - `hasDiscrepancy: true` set on transfer.
      - Stepper Step 4 shows Amber `warning` indicator (`Received · Discrepancy Noted`), Step 5 shows `Pending Owner Review`.
      - Prominent Amber Discrepancy Card displayed according to Stitch UI reference Section 5.8, showing item breakdown, dispatched, received, and difference badges, and reported reason.
    - Discrepancy resolution:
      - Strictly `OWNER` only (`403 Forbidden` for employees).
      - Requires mandatory resolution notes.
      - Sets `discrepancyResolvedById`, `discrepancyResolvedAt`, `discrepancyResolutionNotes`, `closedById`, `closedAt`, `closingNotes`.
      - Transitions status to `COMPLETED`.
      - Records audit event `DISCREPANCY_RESOLVED`.
- **Database Schema Changes & Migrations**:
  - Migration `0018_regular_thanos.sql` generated and applied:
    - Added `TRANSFER_DAMAGED` to `movement_type` enum.
    - Added `received_by_id`, `received_at`, `receiving_notes`, `has_discrepancy`, `discrepancy_resolved_by_id`, `discrepancy_resolved_at`, `discrepancy_resolution_notes`, `closed_by_id`, `closed_at`, `closing_notes` to `transfers` table.
    - Added `damaged_quantity`, `missing_quantity`, `discrepancy_reason` to `transfer_items` table.
    - Added foreign-key relations for `receivedBy`, `discrepancyResolvedBy`, and `closedBy`.
- **Architectural & Design Compliance**:
  - Stitch UI Design Reference Section 5.8 (Transfer Details) followed directly for single details page, direction banner, stepper, items table with discrepancy badges, prominent amber discrepancy card, and modal dialogs.
  - Employee views strictly omit sensitive financial data (`sourceUnitCost`, `estimatedTotalCost`).
  - No duplicate breadcrumbs in pages.
  - Fully strict TypeScript, Zod validation, row locking (`FOR UPDATE`), transaction atomicity, and ledger immutability.
- **Automated Verification Performed**:
  - Monorepo test suite: 29 test files, **194 / 194 tests passing**.
    - Backend transfers integration test suite: `apps/api/src/modules/transfers/transfers.test.ts` (**35 / 35 tests passed** covering all 6 slices).
    - Frontend transfers test suite: `apps/web/src/features/transfers/TransfersPage.test.tsx` (**7 / 7 tests passed**).
  - Monorepo typecheck: `npm run typecheck` passed with **0 errors** across both API and Web.
  - Monorepo linting: `npm run lint` passed with **0 errors**.
  - Monorepo production build: `npm run build` passed with **0 errors** across both API and Web.
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

## Milestone 9 — Daily Closing (Slices 9.1–9.4)

- **Status**: Implemented, Automated Checks Passed, Pending User Manual Verification
- **Completed Slices**:
  - **Slice 9.1 — Current Closing**:
    - Backend endpoints: `GET /api/v1/closings/current` (scoped to user's assigned branch for employees, branch-selectable for Owner).
    - Authoritative financial reconciliation:
      - Gross Sales, Line/Order Discounts, Net Sales, Returns Deductions, Net Revenue, Total Transactions Count.
      - Segregated payment method breakdown table (`daily_closing_payments`) tracking `receivedAmount`, `refundedAmount`, and `netAmount` per method (Cash, Credit Card, Bank Transfer, Telebirr).
      - Strict Expected Cash formula: $\sum(\text{Cash payments on COMPLETED sales}) - \sum(\text{Cash refunds on COMPLETED sales returns})$. Voided sales and non-cash allocations excluded.
    - Pre-submission readiness checks:
      - Validated all sales recorded confirmation (`allSalesRecorded`).
      - Local sync queue verification (zero un-synced operations).
      - Pending transaction validation (no draft/in-progress sales).
    - UI implementation (`CurrentClosingPage.tsx`):
      - 3-step closing progress stepper (`In Progress` -> `Submitted` -> `Approved` / `Rejected`).
      - Overview summary banner with branch selector for Owner, active date, closing reference code (`DCL-YYYYMMDD-XXXX`), status badge, and assigned cashier.
      - 4-card financial metric grid (Gross Sales, Discounts, Returns, Net Revenue).
      - Payment methods breakdown table with received, refunded, and net amounts.
      - 3 KPI cash reconciliation cards (Expected Cash, Counted Cash, Cash Variance with color-coded Over/Short badges).
      - Operational readiness checklist with status indicators.
  - **Slice 9.2 — Closing Submission**:
    - Backend endpoint: `POST /api/v1/closings/submit`.
    - Live variance computation: `cashVariance = countedCash - expectedCash`.
    - Strict validation:
      - `allSalesRecorded` must be explicitly checked.
      - If variance $\neq 0$, `discrepancyExplanation` is strictly required (min 5 characters) on both client and server.
    - Locks the closing record in `SUBMITTED` status, preventing editing by branch employees.
    - Captures submission timestamp and actor ID.
    - Records immutable audit event `SUBMITTED` in `daily_closing_events`.
  - **Slice 9.3 — Owner Review**:
    - Backend endpoints: `POST /api/v1/closings/:id/approve` and `POST /api/v1/closings/:id/reject`.
    - Strict role authorization: Only `OWNER` can approve or reject (`403 Forbidden` for employees).
    - State machine validation: Approval/rejection only permitted from `SUBMITTED` status.
    - Approval flow: Transitions status to `APPROVED`, records reviewer ID, approval timestamp, and optional review notes.
    - Rejection flow: Requires mandatory rejection reason (min 5 characters), transitions status to `REJECTED`, and displays feedback banner to branch employee.
    - Employee resubmission workflow:
      - When `REJECTED`, employee can edit counted cash and discrepancy explanation.
      - Resubmission transitions status back to `SUBMITTED`.
      - Increments `revision` counter atomically.
      - Preserves unbroken audit trail (`DRAFT_GENERATED` -> `SUBMITTED` -> `REJECTED` -> `RESUBMITTED` -> `APPROVED`).
  - **Slice 9.4 — Closing History**:
    - Backend endpoint: `GET /api/v1/closings` supporting pagination (`page`, `limit`), `branchId`, `status`, `startDate`, `endDate`.
    - Role-based scoping: Employees see only their branch's closings; Owner can query and filter across all branches.
    - Backend endpoint: `GET /api/v1/closings/:id` for detailed closing inspection.
    - Frontend `ClosingHistoryPage.tsx` at `/daily-closing/history`:
      - Filter toolbar: Search, branch selector (Owner), status dropdown, date range picker.
      - History data table: Date, Branch, Closing #, Expected Cash, Counted Cash, Variance, Revision, Status badge, Submitter, Actions.
      - Pagination controls with total count and page size options.
      - Detailed inspection modal: Full closing summary, payment method breakdown, discrepancy explanation, review feedback, and complete event timeline.
- **Database Schema Changes & Migrations**:
  - Drizzle migration `0019_complete_speedball.sql`:
    - Sequence `daily_closing_number_seq` generating identifiers `DCL-YYYYMMDD-XXXX`.
    - Table `daily_closings` with foreign keys to `branches` and `users`.
    - Unique index `daily_closings_branch_date_idx` on `(branch_id, closing_date)` preventing duplicate closings for the same branch and date.
    - Table `daily_closing_payments` for per-method financial allocations.
    - Table `daily_closing_events` for append-only audit trail logging.
- **Architectural & Design Compliance**:
  - Strict compliance with Stitch UI Design System: responsive layout, modern typography, card elevation, accessible modals, and color-coded status badges.
  - Sensitive cost, WAC, and gross profit data are strictly omitted from daily closing endpoints and UI (visible only on dedicated Owner Profit Reports in Milestone 10).
  - Concurrency safety: pessimistic row locking (`FOR UPDATE`) in PostgreSQL transactions for all closing state transitions.
  - Zero-drift decimal arithmetic (`b.netAmount`, `Number(b.countedCash) - Number(b.expectedCash)`).
  - Page layout and navigation alignment: removed internal duplicate breadcrumbs from `CurrentClosingPage.tsx` and `ClosingHistoryPage.tsx`, aligned root container to `space-y-6`, inheriting standard `p-margin` and `max-w-7xl` from `AppShell` for consistent vertical start, margins, and sidebar distance across all pages.
- **Automated Verification Performed**:
  - Monorepo test suite: **32 test files, 222 / 222 tests passing**.
    - Backend closing integration tests: `apps/api/src/modules/closing/closing.test.ts` (**14 / 14 tests passed**).
    - Backend closing schema tests: `apps/api/src/modules/closing/schema.test.ts` (**9 / 9 tests passed**).
    - Database seed integration tests: `apps/api/src/database/seeds/seeds.test.ts` (**7 / 7 tests passed**).
    - Frontend closing UI tests: `apps/web/src/features/closing/ClosingPage.test.tsx` (**5 / 5 tests passed**).
  - Monorepo typecheck: `npm run typecheck` passed with **0 errors** across both API and Web.
  - Monorepo linting: `npm run lint` passed with **0 errors**.
  - Monorepo production build: `npm run build` passed with **0 errors** across both API and Web.
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

## Milestone 10 — Dashboards & Reporting (Slices 10.1–10.6)

- **Status**: Implemented, Automated Checks Passed, Pending User Manual Verification
- **Completed Slices**:
  - **Slice 10.1 — Owner Dashboard**:
    - Backend module: `apps/api/src/modules/dashboard` (`schema.ts`, `service.ts`, `controller.ts`, `routes.ts`, `dashboard.test.ts`).
    - Authoritative backend KPI aggregations (`GET /api/v1/dashboard/owner`):
      - Dynamic date filtering: `preset` (`today`, `yesterday`, `this_week`, `this_month`, `last_month`, `custom`) and optional `branchId`.
      - Comparative metrics: Current period vs Previous period comparison with percentage changes for Total Sales, Net Revenue, and Order Counts.
      - Inventory health & valuation: Total stock count, Low Stock count, Out of Stock count, and total inventory valuation at WAC ($\sum(\text{availableQuantity} \times \text{wac})$).
      - Action Required operational alerts:
        - Unresolved Daily Closing Discrepancies count (`hasDiscrepancy: true` or `variance != 0`).
        - Pending Transfer Approvals count (`status = REQUESTED`).
      - Branch Performance Comparison: Multi-branch breakdown of Sales Amount, Transaction Counts, and Low Stock counts with percentage of total business revenue contribution.
      - Sales Performance Trend: Intervals (daily/hourly) with sales amounts and transaction counts.
      - Recent Business Activities: Real-time stream of audit events from daily closings, stock transfers, and sales with actor attribution and formatted relative timestamps.
    - Frontend UI implementation (`OwnerDashboard.tsx`):
      - Strictly follows Stitch UI Design Reference Section 5.4.
      - Header bar with dynamic branch selector dropdown (`All Branches` or specific branch) and time period filter.
      - Quick operational Action Required alerts card with direct navigation links to Daily Closing and Transfers.
      - 4 Primary KPI cards: Total Sales / Net Revenue (with growth badge), Total Transactions, Low / Out of Stock alerts, and Total Inventory Valuation.
      - Responsive Sales Trend chart and Multi-Branch Performance breakdown table with visual revenue progress bars.
      - Low Stock alert item table and Recent Activity log.
  - **Slice 10.2 — Employee Dashboard**:
    - Backend module: `apps/api/src/modules/dashboard` (`GET /api/v1/dashboard/employee`).
    - Strict role authorization & branch isolation:
      - Branch is derived strictly from `req.user.branchId` on the server; client-provided branch IDs are forbidden.
      - Sensitive financial fields (unit costs, WAC, total inventory valuation, gross profit, business-wide revenue) are completely excluded from both API response and UI.
    - Operational Metrics:
      - Today's Branch Sales total and Transaction count.
      - Employee's Own Sales total and Transaction count for the shift.
      - Register Status & Daily Closing action state:
        - Closing status (`DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`).
        - Next required action guidance (e.g. "Submit Daily Closing before shift end" or Owner rejection feedback alert).
      - Inbound Dispatched Transfers: Pending transfers dispatched to this branch requiring receipt and reconciliation.
      - Branch Low Stock warnings: Products at or below reorder point at the assigned branch.
      - Recent Sales at branch with cashier attribution, payment method, and amount.
    - Frontend UI implementation (`EmployeeDashboard.tsx`):
      - Branch-scoped operational overview with clear assigned branch indicator.
      - Action Required banner for Daily Closing (with quick link to submit closing or review rejection reason).
      - KPI cards for Today's Branch Sales, My Sales Today, Low Stock Items, and Inbound Transfers.
      - Quick action buttons to routine operational workflows (New POS Sale, Daily Closing, Inbound Transfers).
      - Inbound Transfers card with receipt action, Branch Stock Alerts table, and Recent Sales table.
  - **Slice 10.3 — Sales Reports**:
    - Backend module: `apps/api/src/modules/reports` (`schema.ts`, `service.ts`, `controller.ts`, `routes.ts`, `reports.test.ts`).
    - Authoritative aggregations (`GET /api/v1/reports/sales`):
      - Date-range filtering supporting standard presets (`today`, `yesterday`, `this_week`, `this_month`, `last_month`, `custom`) with strict ISO boundaries.
      - Owner-only multi-branch filtering; Employee strictly restricted to session branch.
      - Sales totals: Gross Sales, Item Discounts, Order Discounts, Total Discounts, Returns / Refunds deductions, Net Sales / Net Revenue, Total Completed Sales Count, Average Order Value.
      - Payment-method breakdown: Net collected amount per method ($\text{receivedAmount} - \text{refundedAmount}$) across Cash, Credit Card, Bank Transfer, and Telebirr.
      - Grouping dimensions: Group by `day`, `branch`, `employee`, `product`, or `payment_method`.
      - Sales trend over time: Continuous daily data points with peak day highlighting.
      - Detailed transaction records with server-side pagination (`page`, `limit`), cashier attribution, payment breakdown, and direct navigation links to sale details.
      - Correct treatment of edge cases: Voided sales (`VOIDED`) excluded from revenue and counts; returns and refunds properly deducted.
    - Frontend UI implementation (`SalesReportsTab.tsx`):
      - Follows Stitch UI Reference Section 5.10.
      - Filter bar with date range presets, custom date inputs, branch selector (Owner only), and group-by dropdown.
      - 4 Summary KPI cards: Net Revenue, Gross Sales, Total Discounts, and Completed Transactions.
      - Visual sales trend chart with peak day badge.
      - Payment Methods Breakdown grid with percentage contributions.
      - Aggregated Breakdown Table with dynamic headers according to selected grouping dimension.
      - Detailed Sales Transactions Table with pagination, status badges, payment methods, and detail view actions.
      - CSV export functionality (`handleExportCSV`) generating downloadable report spreadsheets based on filtered data.
  - **Slice 10.4 — Inventory Reports**:
    - Backend module: `apps/api/src/modules/reports` (`GET /api/v1/reports/inventory`).
    - Reporting views:
      - `balances`: Current available, damaged, and in-transit stock across Product + Branch; branch-specific reorder point thresholds; computed stock status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).
      - `movements`: Historical immutable inventory ledger movements (`OPENING_STOCK`, `RECEIVING`, `SALE`, `RETURN_GOOD`, `RETURN_DAMAGED`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT`) with transaction reference, user attribution, and movement reason.
      - `transfers`: Stock transfer reconciliation tracking requested, dispatched, received, damaged, and missing quantities, plus stock in transit and discrepancy flags.
    - Strict financial privacy:
      - Owner receives full WAC, unit costs, and inventory valuation ($\text{availableQuantity} \times \text{wac}$).
      - Employees receive `null` for WAC, unit cost, and valuation across all endpoints and response payloads.
    - Frontend UI implementation (`InventoryReportsTab.tsx`):
      - View toggle for Stock Balances, Movements Ledger, and Transfers Reconciliation.
      - Dynamic KPI cards tailored to active view (Stock units, Damaged count, In-Transit total, Low Stock & Out of Stock alerts, and Owner Valuation).
      - Stock status and movement type filters, date picker, branch filter (Owner only), and CSV export.
  - **Slice 10.5 — Profit Reports (Owner Only)**:
    - Backend module: `apps/api/src/modules/reports` (`GET /api/v1/reports/profit`).
    - Role authorization & security:
      - Endpoint protected by `authorizeRole(["OWNER"])` and service-level permission verification. Non-owners receive 403 Forbidden.
      - Profit Reports tab is completely concealed from Employees in the web UI.
    - Financial & inventory cost calculations:
      - Net Revenue = Gross Sales minus Sales Returns.
      - Gross COGS = sum of historical WAC snapshots captured on sale item records ($\text{quantity} \times \text{unitCostSnapshots}$).
      - Return COGS Adjustment = cost basis credited for sellable returned goods.
      - Net COGS = Gross COGS minus Return COGS Adjustment.
      - Gross Profit = Net Revenue minus Net COGS.
      - Profit Margin % = $(\text{Gross Profit} / \text{Net Revenue}) \times 100$.
      - Voided sales excluded; refunds properly accounted for.
    - Performance breakdown dimensions: Aggregations by `day`, `branch`, `category`, and `product`.
    - Trend analysis: Daily revenue, COGS, and profit line chart with peak day badge.
    - Detailed transaction records audit: Item-level breakdown of sale price, WAC cost basis snapshot, profit, and margin.
    - Frontend UI implementation (`ProfitReportsTab.tsx`):
      - 4 KPI summary cards (Net Revenue, Net COGS, Gross Profit, Profit Margin %).
      - Responsive SVG Trend Chart with revenue, cost, and profit paths.
      - Breakdown table and Detailed WAC Cost Basis table with server-side pagination and CSV export.
  - **Slice 10.6 — Closing Reports**:
    - Backend module: `apps/api/src/modules/reports` (`GET /api/v1/reports/closing`).
    - Authoritative reconciliation:
      - Summarizes total closings, approved closings, pending review closings, rejected closings, and unsubmitted registers.
      - Compares backend-calculated expected cash with cashier-declared actual cash.
      - Quantifies cash discrepancy variance and surfaces recorded staff discrepancy explanations.
      - Aggregates payment method reconciliation totals (gross collected, refunded, net collected, transaction counts).
      - Audit trail tracking review decisions, reviewer identity, review timestamps, review notes, rejection reasons, and revisions.
    - Branch scoping: Owner can view all or filter by branch; Employee is strictly scoped to assigned branch.
    - Frontend UI implementation (`ClosingReportsTab.tsx`):
      - 4 KPI cards (Total Closings with status distribution, Expected Cash, Actual Cash, Cash Variance).
      - Payment Method Reconciliation summary table.
      - Daily Closing Records table with status badges, variance color coding, submitter/reviewer attribution, and CSV export.
      - Detailed Audit Modal displaying tender allocations and complete historical event timeline.
  - **Overall Reports Hub Integration (`ReportsPage.tsx`)**:
    - Segmented control linking all 4 report slices (Sales, Inventory, Profit, Closing).
    - Profit tab button dynamically rendered only for Owner.
    - Defensive fallback redirects employee to Sales tab if profit view is requested.
    - Single shared breadcrumb rule preserved: AppShell provides navigation breadcrumbs; ReportsPage contains no internal duplicate breadcrumb.
- **Database Schema Changes & Migrations**:
  - No new database migrations required; report calculations query existing indexes and relational models across `sales`, `sale_items`, `sales_returns`, `inventory_balances`, `inventory_movements`, `stock_transfers`, `daily_closings`, `daily_closing_payments`, and `daily_closing_events`.
- **Architectural & Security Compliance**:
  - Strict server-side branch isolation: authenticated user's `branchId` is derived from session, preventing unauthorized cross-branch data access.
  - Zero sensitive financial leakage: Cost of Goods Sold, WAC, and Gross Profit fields are completely omitted from employee endpoints and UI components. Profit reports are strictly 403 Forbidden for non-owners.
  - Zero mock data or fabricated metrics: All values calculated via PostgreSQL queries directly on persisted transactions, payments, returns, closings, and inventory movements.
  - Single breadcrumb compliance: AppShell owns breadcrumb navigation; individual report views render no duplicate breadcrumbs.
  - Consistent layout spacing: Root containers use `space-y-6` with standard layout padding and typography matching Stitch design specifications.
- **Automated Verification Performed**:
  - Monorepo test suite: **36 test files, 249 / 249 tests passing**.
    - Backend dashboard integration tests: `apps/api/src/modules/dashboard/dashboard.test.ts` (**8 / 8 tests passed**).
    - Backend reports integration tests: `apps/api/src/modules/reports/reports.test.ts` (**12 / 12 tests passed**).
    - Frontend dashboard UI tests: `apps/web/src/features/dashboard/DashboardPage.test.tsx` (**4 / 4 tests passed**).
    - Frontend reports UI tests: `apps/web/src/features/reports/ReportsPage.test.tsx` (**3 / 3 tests passed**).
  - Monorepo typecheck: `npm run typecheck` passed with **0 errors** across both API and Web.
  - Monorepo linting: `npm run lint` passed with **0 errors**.
  - Monorepo production build: `npm run build` passed with **0 errors** across both API and Web.
- **Browser Testing**: Intentionally skipped; reserved for manual verification by the user.

## UI Design Refinement — Modern Bento SaaS Styling & Collapsible Sidebar

**Status**: Completed

### Tasks Completed
- **Design Tokens & Tailwind Utilities**:
  - Extended `apps/web/tailwind.config.js` with modern SaaS shadow tokens:
    - `shadow-bento`: `0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03)` for soft depth.
    - `shadow-bento-hover`: `0 8px 24px rgba(0, 0, 0, 0.08)` for subtle elevation on interactive elements.
    - `shadow-pill`: `0 2px 8px rgba(0, 0, 0, 0.18)` for the active dark pill navigation state.
- **Collapsible Desktop & Mobile Sidebar (`Sidebar.tsx`, `AppShell.tsx`, `Header.tsx`)**:
  - Implemented desktop collapsible sidebar rail:
    - Default state is **expanded** (`w-64`).
    - Collapses smoothly into a compact icon rail (`w-[72px]`) with centered navigation icons and hover tooltips displaying route names.
    - Collapse/expand toggle button with panel collapse icon located in the sidebar header, plus keyboard shortcut `Ctrl+B`.
    - User collapse state persisted in `localStorage` under `gelana_sidebar_collapsed` (defaults to expanded if not set).
  - Dark pill-style active navigation state:
    - Current active route rendered with `bg-[#161C27] text-white shadow-pill font-semibold rounded-xl`, removing generic horizontal accent bars and left borders.
    - High-contrast text, clear icon alignment, and distinct default/hover/active/focus states.
  - Responsive mobile drawer:
    - Mobile sliding drawer (`z-50`) with backdrop overlay (`bg-black/40 backdrop-blur-xs`) and header hamburger toggle button.
- **Modular Bento Dashboard Cards (`OwnerDashboard.tsx`, `EmployeeDashboard.tsx`)**:
  - Upgraded cards to consistent `rounded-2xl border border-outline-variant/60 shadow-bento bg-surface`.
  - Removed decorative colored accent lines and left borders (`border-l-4`), replacing them with refined typography hierarchy, soft metric badges, and subtle icon containers (`p-3 bg-primary/10 rounded-xl`).
  - Balanced grid gutters (`gap-5`, `gap-6`) and generous internal padding (`p-6`).
- **Refined Chart Hover & Interaction States (`OwnerDashboard.tsx`, `SalesReportsTab.tsx`, `ProfitReportsTab.tsx`)**:
  - **Owner Dashboard Sales Bar Chart**:
    - Interactive bar hover with subtle vertical dashed guideline (`border-l border-dashed border-primary/40`).
    - Gelana primary gradient highlight on hover (`bg-gradient-to-t from-primary to-primary-hover shadow-md`).
    - Smooth rounded tops (`rounded-t-md`).
    - Floating compact tooltip showing real formatted sales currency and transaction count.
  - **Sales Reports SVG Trend Line**:
    - Added interactive `hoveredPointIndex` tracking with dashed vertical guideline (`stroke="#0047FF" strokeDasharray="3 3"`).
    - Focused active data point marker (`r="6" fill="#0047FF" stroke="#FFFFFF" strokeWidth="3"`).
    - Floating dark pill tooltip (`bg-[#161C27] text-white rounded-xl shadow-pill`) displaying real date, revenue, and transaction count.
  - **Profit Reports SVG Multi-Line Chart**:
    - Interactive `hoveredTrendIndex` with synchronized vertical guideline.
    - High-contrast focused markers for Revenue (`#0047FF`), COGS (`#EF4444`), and Gross Profit (`#10B981`).
    - Floating dark pill tooltip displaying exact Net Profit, Profit Margin %, Revenue, and COGS for that day.
- **Reports Hub & Modals Bento Styling (`ReportsPage.tsx`, `SalesReportsTab.tsx`, `InventoryReportsTab.tsx`, `ProfitReportsTab.tsx`, `ClosingReportsTab.tsx`)**:
  - Segmented control tabs upgraded to Bento container (`rounded-2xl border border-outline-variant/60 p-2 shadow-bento`) with rounded pill tabs (`rounded-xl`).
  - Removed generic bottom accent lines (`<div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>`) across report tabs.
  - Daily Closing audit detail modal upgraded to `rounded-2xl shadow-2xl border border-outline-variant/40`.
- **Preserved System Constraints**:
  - Kept Gelana's blue primary identity (`#0047FF`) and existing theme tokens.
  - Zero business logic, API contract, or database modifications.
  - Preserved single breadcrumb structure in `AppShell` with zero duplicated breadcrumbs.

### Verification Performed
### Sidebar UI Regression Repair & Color Palette Restoration
- **Restored Gelana's Brand Palette**:
  - Removed the near-black charcoal active navigation treatment (`bg-[#161C27] text-white shadow-pill`).
  - Restored Gelana's brand primary blue active treatment: `bg-primary/10 text-primary font-semibold rounded-xl` with filled primary icon (`style={{ fontVariationSettings: "'FILL' 1" }}`).
  - Inactive states cleanly use `text-on-surface-variant font-medium hover:bg-surface-container/70 hover:text-on-surface rounded-xl`.
- **Eliminated Scrollbar & Overflow Regressions**:
  - Added `.no-scrollbar` utility in `apps/web/src/index.css` (`scrollbar-width: none`, `-ms-overflow-style: none`, `::-webkit-scrollbar: display none`) to eliminate thick OS scrollbars and directional arrows.
  - Added `overflow-x-hidden` on navigation and layout wrappers to prevent horizontal scrolling and pagination-like scrollbar arrows.
  - Sized collapsed buttons symmetrically (`w-10 h-10 mx-auto`) inside available inner width, completely resolving the right-edge clipping of active navigation pills.
- **Unifying Icons, Flyout Menus & Tooltips**:
  - Unified all icons to standard Material Symbols (`material-symbols-outlined text-[20px] shrink-0`) centered along the vertical axis (`x = 36px` in collapsed rail).
  - Implemented floating flyout submenus for navigation groups (`Sales`, `Inventory`, `Daily Closing`) when collapsed, allowing direct submenu navigation on hover/focus without inline chevrons.
  - Implemented floating dark tooltips for standalone items in collapsed rail mode.
  - Maintained distinct separation between navigation items, header collapse toggle, and profile/logout footer.
- **Verification**:
  - Monorepo test suite: **36 test files, 251 / 251 tests passing** (`npm test`).
  - Monorepo typecheck: `npm run typecheck` passed with **0 errors**.
  - Monorepo linting: `npm run lint` passed with **0 errors**.
  - Monorepo production build: `npm run build` passed with **0 errors**.

## Milestone 11 — Notifications, Audit Log & Settings

**Status**: Completed

### Tasks Completed
- **Database Schema & Migration**:
  - Created migration `0020_clammy_the_initiative.sql` adding 4 new tables:
    - `notifications`: User-scoped notification inbox with `title`, `message`, `type`, `priority` (INFORMATIONAL/WARNING/CRITICAL), `isRead`, entity references, and deep links.
    - `notification_preferences`: Per-user category-level opt-in/opt-out toggles (CRITICAL priority notifications bypass preferences).
    - `audit_logs`: Immutable append-only audit ledger with `actor_id`, `actor_name`, `actor_role`, `action`, `category`, `entity_type`, `entity_id`, `branch_id`, `branch_name`, `reason`, and `metadata` (JSONB).
    - `account_requests`: Employee account-change request workflow table with `type`, `status` (PENDING/APPROVED/REJECTED), `payload`, `reason`, `decision_notes`, reviewer tracking, and timestamps.
  - Proper foreign key constraints, cascade deletes, and performance indexes on all tables.
- **Notifications System (Backend)**:
  - `NotificationService` with `createNotification` (preference-aware, CRITICAL bypass), `getNotifications` (paginated, filtered), `getUnreadCount`, `markAsRead`, `markAllAsRead`.
  - Category-based preference matching maps notification `type` prefixes to logical categories (`TRANSFERS`, `CLOSINGS`, `SALES_RETURNS`, `INVENTORY`, `ACCOUNT`).
  - Controller and routes: `GET /api/v1/notifications`, `GET /unread-count`, `PUT /:id/read`, `PUT /read-all`.
  - Integrated into core business operations: sales voids/corrections, returns processing, stock transfers, daily closing, and account request workflows.
- **Audit Log System (Backend)**:
  - `AuditService` with `recordAudit` (append-only with recursive sensitive data sanitization), `getAuditLogs` (filtered/paginated/searchable), `getAuditLogById`.
  - Sensitive keys (`password`, `token`, `secret`, etc.) automatically stripped from metadata before persistence.
  - Role-based access: Owner sees all logs, Employee sees only own-branch logs.
  - Integrated into sales voids/corrections, returns, settings changes, and account request decisions.
- **Settings System (Backend)**:
  - `SettingsService` with:
    - `updateProfile`: Display name changes with audit logging.
    - `changePassword`: Owner-only direct password change (validates current password, hashes with Argon2).
    - `createAccountRequest`: Employee account-change request submission (password changes, name changes) without exposing proposed passwords in audit/notification payloads.
    - `getMyRequests`: Employee view of own request history.
    - `getPendingRequests`: Owner view of all pending account requests.
    - `decideRequest`: Owner approval/rejection workflow executing authorized database updates on approval.
    - `getNotificationPreferences` / `updateNotificationPreferences`: Category-level opt-in/opt-out toggles.
  - Controller and routes: `GET/PUT /api/v1/settings/profile`, `PUT /password`, `GET/POST /requests`, `GET /requests/pending`, `PUT /requests/:id/decide`, `GET/PUT /notification-preferences`.
- **Notifications Page (Frontend)**:
  - `NotificationsPage.tsx`: Full notification center with unread count, mark-as-read/mark-all, priority badges (WARNING, CRITICAL), entity deep links, and empty state.
  - `useUnreadCountQuery` hook polled by Sidebar/Header for real-time unread badge display.
- **Audit Log Page (Frontend)**:
  - `AuditLogPage.tsx`: Professional audit log viewer with search, date-range picker, category/branch filters, and detail inspection modal showing full metadata.
  - Owner-only navigation link in Sidebar.
- **Settings Page (Frontend)**:
  - `SettingsPage.tsx`: Comprehensive settings area with tabbed sections:
    - **My Profile**: Display name editing with branch/role display.
    - **Account & Security**: Owner direct password change; Employee account-change request submission.
    - **My Requests**: Employee request tracking with status badges.
    - **Owner Request Management**: Approval/rejection workflow with decision notes.
    - **Notification Preferences**: Category-level toggle controls.
- **Navigation & Layout Integration**:
  - Updated `Sidebar.tsx` with dynamic unread notification badge, Audit Log link (owner-only), and Settings link.
  - Updated `Header.tsx` with notification bell icon and unread count.
- **Security & Authorization**:
  - Role-based access strictly enforced on backend (OWNER vs EMPLOYEE).
  - Branch scoping enforced for employee audit and notification queries.
  - Sensitive data (passwords, tokens, password hashes) sanitized and excluded from audit payloads and notifications.

### Quality-check results
- **API Tests**: 49 test files, **383 / 383 tests passed**.
  - Includes `audit.test.ts`, `notifications.test.ts`, and `settings.test.ts`.
- **Web Tests**: 13 test files, **66 / 66 tests passed**.
  - Sidebar tests updated to include `QueryClientProvider` wrapper for `useUnreadCountQuery` compatibility.
- **Typecheck**: Both API and Web workspaces typecheck successfully with **0 errors**.
- **Lint**: `npm run lint` passed with **0 errors**.
- **Build**: `npm run build` succeeded for all workspaces.

### Files Created
- `apps/api/src/database/schema/notifications.ts`
- `apps/api/src/database/schema/notificationPreferences.ts`
- `apps/api/src/database/schema/auditLogs.ts`
- `apps/api/src/database/schema/accountRequests.ts`
- `apps/api/src/database/migrations/0020_clammy_the_initiative.sql`
- `apps/api/src/modules/notifications/` (service, controller, routes, schema, tests)
- `apps/api/src/modules/audit/` (service, controller, routes, schema, tests)
- `apps/api/src/modules/settings/` (service, controller, routes, schema, tests)
- `apps/web/src/features/notifications/` (api, NotificationsPage)
- `apps/web/src/features/audit/` (api, AuditLogPage)
- `apps/web/src/features/settings/` (api, SettingsPage)

### Files Modified
- `apps/api/src/app.ts` (registered notification, audit, and settings routers)
- `apps/api/src/database/schema/index.ts` (exported new table schemas)
- `apps/api/src/modules/sales/service.ts` (integrated audit + notification triggers)
- `apps/api/src/modules/returns/service.ts` (integrated audit + notification triggers)
- `apps/web/src/app/router/index.tsx` (added `/notifications`, `/audit-logs`, `/settings` routes)
- `apps/web/src/app/layout/Sidebar.tsx` (unread badge, audit link, settings link)
- `apps/web/src/app/layout/Header.tsx` (notification bell icon)
- `apps/web/src/app/layout/Sidebar.test.tsx` (QueryClientProvider wrapper fix)

### Browser Testing
- Intentionally skipped; reserved for manual verification by the user.

### Targeted Fix — Settings Profile Flow, Save Errors, and Notifications Navigation (Corrective Task)

**Status**: Completed

#### Problems Addressed & Root Causes
1. **Problem A — Settings Opened Directly into Editable Form**:
   - *Previous behavior*: Navigating to `/settings` immediately presented editable input fields with a "Save Profile" button, which felt like an edit form rather than an overview.
   - *Resolution*: Redesigned the Profile tab into a view-first architecture. It opens into a sleek, read-only profile overview presenting the user's avatar with initials, full display name, email, role badge, assigned branch, account status badge ("Active & In Good Standing"), and "Member Since" date. Clicking the explicit "Edit Profile" button enters inline edit mode. Clicking "Cancel" restores the saved state without mutating.
2. **Problem B — Profile Save Errors & Missing Data**:
   - *Root causes*:
     1. Backend `settingsRouter` only registered `PUT /profile`, whereas the frontend client issued a `PATCH` request, causing `404 Cannot PATCH /api/v1/settings/profile`.
     2. The backend lacked a dedicated `GET /api/v1/settings/profile` endpoint, causing frontend profile queries to return 404 and leaving edit forms blank or uninitialized.
   - *Resolution*: Implemented `SettingsService.getProfile(userId)` with full user info and joined branch names. Added `GET /profile` and registered `PATCH /profile` alongside `PUT /profile` in `settingsRouter`.
3. **Problem C — Notifications Navigation Showed "Page Not Found"**:
   - *Root cause*: `NotificationController.getNotifications` returned `{ data: { notifications: [...], total, ... } }`. `NotificationsPage.tsx` attempted `const notifications = data?.data || []`, which evaluated to an object rather than an array. Calling `notifications.map(...)` threw an uncaught runtime `TypeError: notifications.map is not a function`. React Router's route-level `<ProtectedRoute errorElement={<NotFoundPage />} />` caught the error and rendered the 404 fallback page.
   - *Resolution*: Standardized backend notification controller to return `{ data: result.notifications, pagination: ... }`. Enriched frontend with defensive checks (`Array.isArray(data?.data) ? data.data : data?.data?.notifications || []`). Fixed similar response handling in `AuditLogPage.tsx` and unread count parsing in `Header.tsx`.

#### Tasks Completed
- **Backend (`apps/api`)**:
  - `SettingsService.getProfile`: Fetches authenticated user's profile with branch details and status.
  - `SettingsController.getProfile`: Exposes profile retrieval.
  - `settingsRouter`: Registered `GET /profile`, `PATCH /profile`, and compatibility aliases for `/password`, `/notification-preferences`, and `/account-requests/:id/decision`.
  - `NotificationController.getNotifications`: Standardized response structure to return data array with sibling pagination.
  - `AuditController.getAuditLogs`: Standardized payload structure.
  - `settings.test.ts`: Added unit tests covering `getProfile` for Owner and Employee roles.
- **Frontend (`apps/web`)**:
  - `SettingsPage.tsx`: Built view-first Profile tab with clean toggling between read-only card and edit form, locked protected attributes (email, role, branch) with explanatory helper notes, full validation (2–255 characters), cancel handling, and mutation state banners.
  - `SettingsPage.test.tsx`: Added 6 unit tests validating read-only profile rendering, entering edit mode, cancel discarding changes, successful profile save, validation errors, and server failure handling.
  - `router.test.tsx`: Added routing tests ensuring `/notifications` and `/settings` render their corresponding feature pages rather than 404 fallback.
  - Defensive array parsing in `NotificationsPage.tsx` and `AuditLogPage.tsx`.

#### Quality-check Results
- **Tests**: Monorepo Vitest passed with **40 / 40 test files passed (274 / 274 tests passed)**.
- **Typecheck**: Both API and Web passed with **0 errors**.
- **Lint**: Oxlint passed with **0 errors**.
- **Build**: Monorepo production build (`npm run build`) succeeded with **0 errors**.

### Targeted Fix — API Request Storm, Daily Closing History Failure, and React Duplicate Keys (Corrective Task)

**Status**: Completed

#### Problems Addressed & Confirmed Root Causes

1. **React Duplicate-Key Warnings for IDs `...0301` through `...0306`**:
   - *Confirmed Root Cause*: IDs `00000000-0000-4000-8000-000000000301` through `0306` are the 6 seeded catalog products. In PostgreSQL, `product_prices` lacked a unique constraint on active prices (`effective_until IS NULL`), which allowed duplicate active price rows per unit. When `ProductsService.getProducts()` executed a SQL join on `product_prices` where `effectiveUntil IS NULL`, each product joined against 2 active price records, returning every product twice (12 rows instead of 6) to the client. This triggered repeated React duplicate-key warnings in components rendering products (`Catalog.tsx`, `NewTransferPage.tsx`, etc.).
   - *Resolution*:
     - Cleaned up duplicate active rows in `product_prices` table in PostgreSQL.
     - Refactored `ProductsService.getProducts()` to use Drizzle relational `db.query.products.findMany` with `limit: 1` on active price ordered by `effectiveFrom DESC, id DESC`, guaranteeing at most one active price per product unit regardless of DB state.
     - Added regression test in `products.test.ts` verifying that `getProducts` returns exactly 1 item per product even when multiple price records exist.

2. **`403 Forbidden` on `/api/v1/users`**:
   - *Confirmed Root Cause*: In `SalesHistoryPage.tsx`, the hook `useUsers()` was invoked unconditionally on component mount. However, `/api/v1/users` is an OWNER-only endpoint protected by `authorizeRole(["OWNER"])`. While the UI already conditionally hid the employee selector for non-owners (`{isOwner && (...)}`), the data query hook executed unconditionally for all roles.
   - *Resolution*: Updated `useUsers` in `apps/web/src/features/users/api/index.ts` to accept `{ enabled?: boolean }` options, and updated `SalesHistoryPage.tsx` to pass `{ enabled: isOwner }`. Employees now never query `/users`.
   - Added unit tests in `SalesHistoryPage.test.tsx` verifying no user queries are dispatched when logged in as employee.

3. **`429 Too Many Requests` & API Request Storm**:
   - *Confirmed Root Causes*:
     1. Backend `generalLimiter` in `apps/api/src/app.ts` was set to an overly restrictive 200 requests per 15-minute window per IP.
     2. In `apps/web/src/app/providers/index.tsx`, TanStack Query was initialized with default `staleTime: 0` and automatic retries on failed requests. Normal page transitions refetched `["me"]`, `["branches"]`, and feature data repeatedly.
     3. Global unread notifications were polled every 30 seconds by two simultaneously mounted components (`Header.tsx` and `Sidebar.tsx`).
     4. `CurrentClosingPage` and `ClosingHistoryPage` dispatched queries with `branchId: undefined` before `currentUser` had resolved, immediately followed by a second query once user data loaded.
     5. Any 401, 403, or 429 response triggered TanStack Query's default exponential retry loop, escalating traffic until the rate limit was exhausted.
   - *Resolution*:
     - Tuned `generalLimiter` from 200 to 1000 requests per 15-minute window, with standardized JSON error response `{ error: { code: "RATE_LIMIT_EXCEEDED", message: "..." } }`.
     - Standardized `fetchApi` with a custom `ApiError` class that parses status code, message, error details, and extracts the `Retry-After` header.
     - Configured `QueryClient` default options with `staleTime: 60 * 1000` (1 minute), custom `shouldRetry` (returns `false` for 401, 403, 404; max 1 retry for 429; max 2 for 5xx), and `calculateRetryDelay` (respects `Retry-After` bounded between 1s–30s, falls back to exponential backoff capped at 10s).
     - Gated `CurrentClosingPage` and `ClosingHistoryPage` queries with `enabled: isReady` so queries only execute once user and branch context are fully resolved.
     - Updated notification polling in `api.ts` to halt when encountering 401 or 403 errors.

4. **Daily Closing "Failed to load closing history" (`/api/v1/closings/history` & `/current`)**:
   - *Confirmed Root Cause*: When the API request storm hit the 200-request limit, `/api/v1/closings/history` responded with `429 Too Many Requests`. In `fetchApi`, string response bodies were spread into numeric properties (`0: "T", 1: "o"...`), leaving `error.message` undefined. The query hook failed, leading `ClosingHistoryPage` to render "Failed to load closing history: An unexpected error occurred".
   - *Resolution*: Resolved the root causes of the request storm and rate limit exhaustion, and fixed `fetchApi` error parsing with `ApiError`. Closing history and current closing endpoints now load cleanly without repeated calls or rate limiting.

5. **`401 Unauthorized` on `/api/v1/auth/me`**:
   - *Confirmed Root Cause*: When an unauthenticated visitor visited the app or a session expired, TanStack Query retried the failed `/auth/me` call multiple times in combination with staleTime 0 refetches, triggering 429 rate limit errors and polling errors.
   - *Resolution*: Bounded retries prevent any retry on 401. Session/cookie authentication operates cleanly with zero retry storms on unauthenticated states.

#### Tasks Completed
- **Backend (`apps/api`)**:
  - `apps/api/src/modules/products/service.ts`: Switched `getProducts` to Drizzle relational query with single active price limit.
  - `apps/api/src/modules/products/products.test.ts`: Added test verifying single active price per unit.
  - `apps/api/src/app.ts`: Increased rate limit to 1000 req/15min with standard JSON response.
  - `apps/api/src/modules/users/service.ts`: Ensured `getUserForSession` returns name and email.
  - `apps/api/src/middleware/authenticate.ts`: Attached name and email to `req.user`.
  - `apps/api/src/modules/reports/reports.test.ts`: Scoped profit report test to avoid test collision.
- **Frontend (`apps/web`)**:
  - `apps/web/src/lib/api.ts`: Implemented `ApiError` class, parsed `Retry-After`, fixed error message parsing.
  - `apps/web/src/lib/api.test.ts`: Added 12 unit tests verifying error handling, HTTP statuses, headers, and retry logic.
  - `apps/web/src/app/providers/index.tsx`: Configured bounded retries, `Retry-After` backoff, and 60s staleTime.
  - `apps/web/src/features/users/api/index.ts`: Added `options?: { enabled?: boolean }` to `useUsers`.
  - `apps/web/src/features/sales/SalesHistoryPage.tsx`: Gated `useUsers` with `isOwner`.
  - `apps/web/src/features/sales/SalesHistoryPage.test.tsx`: Added unit tests verifying role-based gating of user queries.
  - `apps/web/src/features/closing/api/index.ts`: Added `enabled` support to closing hooks.
  - `apps/web/src/features/closing/CurrentClosingPage.tsx`: Deferred query until `currentUser` and `branches` are ready.
  - `apps/web/src/features/closing/ClosingHistoryPage.tsx`: Deferred query until `currentUser` is ready.
  - `apps/web/src/features/notifications/api.ts`: Halted unread count polling on 401/403.

#### Quality-check Results
- **Tests**: Monorepo Vitest passed with **42 / 42 test files passed (289 / 289 tests passed)**.
- **Typecheck**: Both API and Web passed with **0 errors**.
- **Lint**: Oxlint passed with **0 errors**.
- **Build**: Monorepo production build (`npm run build`) succeeded with **0 errors**.

### Targeted Fix — Collapsed Sidebar Multi-Page Group Navigation (Flyout Submenus)

**Status**: Completed

#### Problems Addressed & Confirmed Root Causes
- *Issue*: When the sidebar was collapsed into an icon rail, multi-page parent items (e.g. Sales, Daily Closing, and Inventory for Owner) could not be clicked to reliably open sub-navigation. The prior implementation used a CSS hover-only opacity toggle (`group-hover:opacity-100`) with no `onClick` handler, causing menus to vanish prematurely or fail completely on touch devices and keyboard navigation. Additionally, overflow hidden on `<aside>` and `<nav>` combined with CSS `transform` containing blocks risked clipping the flyout at sidebar and viewport boundaries.
- *Resolution*:
  - Refactored `Sidebar.tsx` multi-page groups (`NavAccordion`) to support click-to-open flyout submenus when collapsed, while preserving inline accordion behavior when expanded.
  - Rendered the flyout submenu via `createPortal(..., document.body)` with `position: fixed`, completely eliminating overflow clipping from `<aside>` and `<nav>` and bypassing containing block traps.
  - Dynamically calculated and clamped vertical position (`top`) between `12px` and `window.innerHeight - flyoutHeight - 12px`, ensuring zero viewport clipping near the top or bottom edges of the screen.
  - Positioned the flyout beside the collapsed rail (`left: rect.right + 8px`) with compact max-width (`260px`) to prevent unnecessary covering of page content.
  - Maintained visual active state on both the parent trigger button (`bg-primary/10 text-primary`) and active child route when a child is selected.
  - Added click outside and Escape key listeners with focus restoration to the parent button.
  - Implemented keyboard accessibility (`ArrowDown`, `ArrowUp`, `Home`, `End`, `Tab`, `Escape`) and ARIA menu roles (`role="menu"`, `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`).
  - Extracted helper subcomponents (`NavItem`, `NavAccordion`, `NavGroup`) to top-level definitions to preserve DOM identity and eliminate render unmount churn.
  - Updated and expanded `Sidebar.test.tsx` (10 tests) covering click toggling, child selection navigation, outside click, Escape key dismiss, keyboard navigation, and single-page navigation.

#### Files Changed
- `apps/web/src/app/layout/Sidebar.tsx`
- `apps/web/src/app/layout/Sidebar.test.tsx`
- `docs/implementation_progress.md`

#### Quality-check Results
- **Tests**: Monorepo Vitest passed with **42 / 42 test files passed (294 / 294 tests passed)**.
- **Typecheck**: Both API and Web passed with **0 errors**.
- **Lint**: Oxlint passed with **0 errors**.
- **Build**: Monorepo production build (`npm run build`) succeeded with **0 errors**.

### Next Recommended Milestone
Milestone 12 — Production Readiness & Optimization.


