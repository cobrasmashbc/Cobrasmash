---
description: SDD step 5 - verify the change locally and on the Pages preview
---
Run step 5 (`/validate`) of the workflow in `SDD.md`. Only this step.

1. Serve the site: `python -m http.server 8000 --directory public` (run it in the background and stop it when done).
2. **Tier 2:** check each acceptance criterion from `/spec` directly: fetch the affected pages and JSON files, confirm JSON is valid, and check paths resolve.
   **Tier 3:** run every case in `tests/<issue>-<slug>/test-cases.md` and record the result of each.
3. List what to check on the Cloudflare Pages preview URL for this branch once pushed.
4. **Tier 3 only:** write the run log to `spec/<issue>-<slug>/validation.md` (date, environment, pass/fail per test case, preview URL checked).

Output: the commands run, pass/fail per acceptance criterion or test case, and the preview checklist.
