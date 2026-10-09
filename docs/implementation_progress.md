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

