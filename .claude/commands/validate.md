---
description: SDD step 5 - verify the change locally and on the Pages preview
---
Run step 5 (`/validate`) of the workflow in `SDD.md`. Only this step.

1. Serve the site: `python -m http.server 8000 --directory public` (run it in the background and stop it when done).
2. Check each acceptance criterion from `/spec`: fetch the affected pages and JSON files, confirm JSON is valid, and check paths resolve.
3. List what to check on the Cloudflare Pages preview URL for this branch once pushed.

Output: the commands run, pass/fail per acceptance criterion, and the preview checklist.
