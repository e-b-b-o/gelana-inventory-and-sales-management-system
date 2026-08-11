# AI Agent Instructions

This file is the first source of truth for any AI coding agent working
on **gelana-inventory-and-sales-management-system**.

## Mandatory startup sequence

Before changing code, read these files in order:

1.  `docs/instruction.md`
2.  `docs/project_plan.md`
3.  `docs/project_progress.md`
4.  `docs/project_decisions.md`
5.  `docs/src.md`
6.  `docs/database.md` when touching persistence
7.  `docs/api.md` when touching backend/API contracts

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
-   Do not add offline/PWA complexity until the online workflow is
    stable and the progress document reaches that phase.
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
