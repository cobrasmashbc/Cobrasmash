# spec/

Spec artifacts for Tier 3 (complex) changes, per `SDD.md` rule 6. Not deployed — outside `public/`.

Each change gets its own `spec/<issue>-<slug>/`:

- `plan.md` — from `/propose`: approach, files to create/modify/delete, external dependencies.
- `requirements.md` — from `/spec`: acceptance criteria.
- `validation.md` — from `/validate`: the test run log (date, environment, pass/fail per case, preview URL checked).

The matching manual test-case checklist lives in `tests/<issue>-<slug>/test-cases.md`.

These folders are committed with the change and kept permanently as part of the audit trail — they aren't cleaned up after merge. Tier 1 (routine content) and Tier 2 (simple) changes don't use this folder; Tier 2 keeps its 3-bullet spec inline in the issue/PR.
