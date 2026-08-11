# Contributing

## Before coding

1.  Read `AGENTS.md`.
2.  Read `docs/instruction.md`.
3.  Read `docs/project_plan.md`.
4.  Read `docs/project_progress.md`.
5.  Read `docs/project_decisions.md`.
6.  Read the relevant architecture document.
7.  Pick one unfinished task.

## Development expectations

-   Keep changes focused.
-   Follow existing module/feature structure.
-   Use strict TypeScript.
-   Validate external input.
-   Add tests for important business rules.
-   Do not add dependencies casually.
-   Do not mix unrelated refactors into feature commits.
-   Update documentation when behavior or architecture changes.

## Before marking work done

Run the relevant commands from the repository root:

``` bash
npm run typecheck
npm run lint
npm run build
```

Run relevant tests once test scripts exist.

## Commit style

- Do not accumulate the entire project into one giant commit.
- Use small, coherent commits grouped by logical change.
- Do not make one commit per tiny line change either.
- Prefer professional commit messages such as:
  - `chore: configure drizzle schema`
  - `feat: add branch schema`
  - `feat: add user schema`
  - `test: add schema validation tests`
  - `docs: update database design`

## Pull request / review checklist

-   Does the change match `project_plan.md`?
-   Is it the current task in `project_progress.md`?
-   Are authorization rules enforced server-side?
-   Are database mutations transactional where required?
-   Are inputs validated?
-   Are errors handled?
-   Are tests appropriate?
-   Did documentation stay synchronized?
-   Did the change avoid unnecessary dependencies/abstractions?
