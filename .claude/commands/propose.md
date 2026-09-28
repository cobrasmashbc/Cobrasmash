---
description: SDD step 2 - propose the technical solution for the active issue
argument-hint: "[issue number]"
---
Run step 2 (`/propose`) of the workflow in `SDD.md`. Only this step. The active issue is #$ARGUMENTS if given, otherwise the one selected in `/orient`.

Read the issue (`gh issue view`) and the relevant code. Respect the guardrails in `SDD.md` and the static-site stack in `techstack.md`.

Classify the change as Tier 2 (simple) or Tier 3 (complex) per SDD.md rule 5, and state which and why. Default to Tier 2 unless it clearly meets a Tier 3 criterion (new feature/section, cross-cutting or multi-file change, new integration, roadmap Phase 2+, or acceptance criteria that won't fit 3 bullets).

Output: the tier; a summary of the approach; files to create, modify or delete; and any external dependencies or service integrations required. Don't write code yet, and don't create the branch or any files — `/build` does that.
