---
description: SDD step 7 - commit, push, PR, merge and move the issue to Done
---
Run step 7 (`/ship`) of the workflow in `SDD.md`. Only this step.

Prepare the exact commands:
1. `git add` the relevant files (including any `spec/<issue>-<slug>/` and `tests/<issue>-<slug>/` files for Tier 3) and commit with a message referencing the issue (`Closes #<n>`).
2. `git push -u origin <branch>`.
3. `gh pr create` against `main`, then `gh pr merge`.
   - **Tier 2:** delete the branch on merge — pass `--delete-branch` to `gh pr merge` (or `-d`), and delete the local branch too.
   - **Tier 3:** don't delete the branch — no `--delete-branch` flag, and keep the local branch, so reverting stays a checkout/`git revert` away (SDD.md rule 7).
4. Move the issue to `Done` on the project board (`gh project item-edit`).

Show the commands and the board transition first, and run them only after the user confirms.
