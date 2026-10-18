# AI Agent Instructions

This file is the first source of truth for any AI coding agent working
on **gelana-inventory-and-sales-management-system**.

## Mandatory startup sequence

Before changing code, read these files in order:

1.  `project_decisions.md` (Business source of truth)
2.  `docs/technical_design.md` (Technical architecture)
3.  `docs/implementation_plan.md` (Vertical slice milestones)
4.  `docs/implementation_rules.md` (Rules for Antigravity)
5.  `docs/ui_design_reference.md` (Stitch UI references)
6.  `docs/implementation_progress.md` (Current progress)

Then inspect the relevant existing code before editing anything.

## Core rules

-   Documentation is project memory. Do not rely on previous chat
    history.
-   Continue from the next unfinished task in `project_progress.md`.
-   Work on one clear task at a time.
-   Do not implement undocumented features.
-   Do not make major architectural changes without explicit approval.
-   Do not replace the approved stack because another library is
    fashionable.
-   Preserve existing working code unless the task requires changing it.
-   Prefer the smallest correct change.
-   Never hide errors with `any`, `@ts-ignore`, disabled lint rules, or
    swallowed exceptions unless explicitly justified.
-   Keep TypeScript strict.
-   Validate external input at boundaries.
-   Enforce authorization on the backend, never only in React.
-   Use PostgreSQL transactions for multi-step financial/inventory
    mutations.
-   Completed financial records are not hard-deleted; use auditable
    reversal/void workflows.
-   Gelana operates strictly as an online-only application (Milestone 12
    is permanently skipped). Do not add offline/PWA complexity, local
    transaction sync queues, or offline conflict resolution.
-   Never commit secrets, `.env`, credentials, tokens, generated build
    output, or `node_modules`.
-   Do not run destructive database/Git commands unless explicitly
    requested.
-   Do not rewrite Git history.
-   Do not push automatically unless the current task explicitly
    requests a push.

## Definition of done

A task is not done until: - implementation is complete; - relevant
typecheck/lint/tests/build pass; - obvious edge cases are handled; -
documentation is updated; - `project_progress.md` reflects the new
state; - important architecture/product decisions are recorded in
`project_decisions.md`.

If code conflicts with documentation, report the conflict before
silently choosing one.
