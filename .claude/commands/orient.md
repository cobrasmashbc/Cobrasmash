---
description: SDD step 1 - inspect repo state and the project board, pick the issue to work on
argument-hint: "[issue number]"
---
Run step 1 (`/orient`) of the workflow in `SDD.md`. Only this step.

1. Show the active branch and `git status`.
2. Review the CobraSmash project board (`gh project list --owner cobrasmashbc`, then `gh project item-list <number> --owner cobrasmashbc`) and open issues (`gh issue list`).
3. Select the issue: use #$ARGUMENTS if given, otherwise propose the top `Todo` item that fits `roadmap.md`.

Output: active branch and git status, the selected issue, and the target deliverable for this iteration. Don't change anything.
