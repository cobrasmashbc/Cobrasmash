---
description: SDD step 2 - propose the technical solution for the active issue
argument-hint: "[issue number]"
---
Run step 2 (`/propose`) of the workflow in `SDD.md`. Only this step. The active issue is #$ARGUMENTS if given, otherwise the one selected in `/orient`.

Read the issue (`gh issue view`) and the relevant code. Respect the guardrails in `SDD.md` and the static-site stack in `techstack.md`.

Output: a summary of the approach; files to create, modify or delete; and any external dependencies or service integrations required. Don't write code yet.
