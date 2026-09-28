---
description: SDD step 4 - implement the spec on a feature branch
argument-hint: "<branch-name>"
---
Run step 4 (`/build`) of the workflow in `SDD.md`. Only this step.

1. Create the working branch: `git checkout -b feature/$ARGUMENTS` (derive a short name from the issue if none is given). If already on a feature branch for this issue, stay on it.
2. **Tier 3 only:** write `spec/<issue>-<slug>/plan.md` (the `/propose` output) and `spec/<issue>-<slug>/requirements.md` (the `/spec` acceptance criteria), and `tests/<issue>-<slug>/test-cases.md` (the `/spec` test-case checklist).
3. Implement the spec, keeping it lean: static files in `public/`, no framework, bundler or new dependencies unless the spec requires them.

Output: the changes made, listed by file path. Don't commit.
