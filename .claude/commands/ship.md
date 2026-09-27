---
description: SDD step 7 - commit, push, PR, merge and move the issue to Done
---
Run step 7 (`/ship`) of the workflow in `SDD.md`. Only this step.

Prepare the exact commands:
1. `git add` the relevant files and commit with a message referencing the issue (`Closes #<n>`).
2. `git push -u origin <branch>`.
3. `gh pr create` against `main`, then `gh pr merge`.
4. Move the issue to `Done` on the project board (`gh project item-edit`).

Show the commands and the board transition first, and run them only after the user confirms.
