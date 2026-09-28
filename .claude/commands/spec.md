---
description: SDD step 3 - write acceptance criteria (3 bullets for Tier 2, requirements + test cases for Tier 3)
---
Run step 3 (`/spec`) of the workflow in `SDD.md`. Only this step.

Based on the agreed proposal and its tier (from `/propose`):

- **Tier 2:** write the acceptance criteria as exactly 3 bullets that are concrete and checkable (in a browser, on the Pages preview, or by inspecting files).
- **Tier 3:** write as many acceptance-criteria bullets as needed, plus a matching manual test-case checklist (Given/When/Then, one case per requirement) — content only, don't write any files yet, `/build` persists them to `spec/<issue>-<slug>/requirements.md` and `tests/<issue>-<slug>/test-cases.md`.

Don't write code yet.
