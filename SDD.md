# CobraSmash SDD Workflow

**Role:** Full-stack developer and DevOps engineer for CobraSmash (`cobrasmashbc/Cobrasmash`).
**Tech stack:** Static site (HTML, modular CSS, vanilla JS ES modules, JSON content) in `public/`, deployed as-is to Cloudflare Pages via native Git integration. See `techstack.md`.
**Project board:** GitHub Project linked to the repo, with columns `Todo`, `In Progress`, `Review`, `Done`. Project #1, public: https://github.com/users/cobrasmashbc/projects/1 (`gh project item-list 1 --owner cobrasmashbc`).

---

## Core operating rules

1. **Issue-driven development:** every task, fix or feature has a GitHub Issue on the CobraSmash project board before work begins, except Tier 1 routine content updates (rule 5).
2. **Backlog and history:**
   - New tasks go into **Todo**.
   - Previously completed work gets a retroactive issue, added to the board and moved straight to **Done**, for auditability.
3. **Guardrails:** keep implementations lean. No frameworks, bundlers, `package.json`, heavy abstractions, third-party libraries or extra process until explicitly required (see `roadmap.md`). This includes test tooling: there is no test runner, so "test cases" (rule 6) are always plain-language manual checklists, never automated test code.
4. **Outward-facing actions** (creating or editing issues, moving board items, pushing, opening or merging PRs) are shown first and run only after the user confirms.
5. **Change tiers.** Every change is classified into one of three tiers, which decides how much process it gets. Classification happens at `/orient` (obvious Tier 1) or `/propose` (Tier 2 vs. 3, once the approach is known); state the tier explicitly in the step's output. Default to Tier 2 unless a change clearly meets a Tier 3 criterion below — the user can always override.

   **Tier 1 — Routine content.** Simple, straightforward edits to the JSON files in `public/data/` (next session date, news posts, slider slides, testimonials, player entries) using the existing fields and format, plus any images they reference in `public/assets/images/`. Skips the loop entirely — straight to `main`, no issue, branch, PR or spec artifacts:
   - Validate the JSON before committing.
   - Follow the templates in `CONTENT.md` (or run `/buzz`); media goes in as WebP via `tools/convert_media.py`.
   - Bump `<lastmod>` in `public/sitemap.xml` to today in the same commit; this applies to every change to site content or info, at any tier.
   - Commit with a clear message (e.g. `Content: next session 30 Sep 2026`), push after the user confirms, then check the change on cobrasmash.org.uk once Cloudflare has deployed.
   - A content change that adds personal or confidential data beyond what's already published is never Tier 1 (see `CLAUDE.md`) — it goes through the full loop at Tier 2 or 3, and gets the PII warning regardless of tier.

   **Tier 2 — Simple.** Small, well-understood, single-purpose changes: a CSS/layout tweak, a copy edit in `index.html`, a bugfix contained to one JS module, a new field on an existing JSON schema. Full loop, but lightweight: one issue, one branch (`feature/<name>`), the acceptance criteria stay the 3 bullets from `/spec` stated inline in the issue/PR — no `spec/` or `tests/` files. Branch is deleted (local and remote) after merge.

   **Tier 3 — Complex.** New features or sections, cross-cutting or multi-file changes, new integrations or services (Workers, external APIs), anything from roadmap Phase 2+ (registrations, payments, stats), or a change whose acceptance criteria genuinely don't fit 3 bullets. Gets the full `spec/` + `tests/` artifacts (rule 6) and its branch is kept after merge, not deleted (rule 7).

6. **Artifact folders (Tier 3 only).** Written under `spec/<issue>-<slug>/` and `tests/<issue>-<slug>/` at the repo root — not under `public/`, so nothing in them deploys — and committed to the feature branch alongside the code, becoming part of the permanent audit trail (rule 2):
   - `spec/<issue>-<slug>/plan.md` — from `/propose`: approach, files to create/modify/delete, external dependencies.
   - `spec/<issue>-<slug>/requirements.md` — from `/spec`: acceptance criteria, as many as needed (not capped at 3).
   - `tests/<issue>-<slug>/test-cases.md` — from `/spec`: concrete manual checklist (Given/When/Then), one per requirement.
   - `spec/<issue>-<slug>/validation.md` — from `/validate`: the run log (date, environment, pass/fail per test case, preview URL checked).

   Keep the GitHub issue itself short and human-readable: problem statement, the acceptance-criteria summary, and — once the branch exists — a pointer like "Spec: `spec/42-member-login/` on `feature/member-login`". The detailed plan, requirements and test cases live in these files, not pasted into the issue body.

7. **Branch retention.** Tier 1 has no branch. Tier 2 branches are deleted (local and remote) once the PR merges, same as today. Tier 3 branches are kept after merge — don't pass `--delete-branch` to `gh pr merge` and don't delete the local branch — so reverting is a checkout or `git revert` away, not an archaeology exercise.

---

## Command loop

Run only the step requested. Don't skip or combine steps unless directed. Each step is a slash command in `.claude/commands/`.

### 1. `/orient`
- **Action:** inspect the repo, branch and git status, and the project board.
- **Output:** active branch and git status; the selected issue from the board; the target deliverable for this iteration.

### 2. `/propose`
- **Action:** work out the technical solution for the active issue, and classify it Tier 2 or Tier 3 (rule 5).
- **Output:** the tier and why; approach summary; files to create, modify or delete; external services or integrations needed (e.g. Meta Graph API, WhatsApp API, Cloudflare Workers).

### 3. `/spec`
- **Action:** write the acceptance criteria.
- **Output:** Tier 2 — exactly 3 bullets defining completion. Tier 3 — as many bullets as needed, plus a matching manual test-case checklist.

### 4. `/build`
- **Action:** create the working branch (`git checkout -b feature/<name>`); for Tier 3, write `spec/<issue>-<slug>/plan.md` and `requirements.md` (from `/propose` and `/spec`'s output) and `tests/<issue>-<slug>/test-cases.md` before implementing; then implement the spec.
- **Output:** the changes made, listed by file path.

### 5. `/validate`
- **Action:** verify the change. Tier 2 — check each acceptance criterion directly. Tier 3 — run every case in `tests/<issue>-<slug>/test-cases.md` and record the results.
- **Output:** local check commands (`python -m http.server 8000 --directory public`, then the pages and JSON files affected), pass/fail per case, and what to check on the Cloudflare Pages preview URL for the branch. Tier 3 also writes the run log to `spec/<issue>-<slug>/validation.md`.

### 6. `/document`
- **Action:** update docs to reflect the change.
- **Output:** updates to `README.md`, `roadmap.md` and, where relevant, `CLAUDE.md` / `techstack.md`.

### 7. `/ship`
- **Action:** commit (including any `spec/`/`tests/` files), push, open a PR, merge, and update the board. Delete the branch after merge for Tier 2; keep it for Tier 3 (rule 7).
- **Output:** exact `git` / `gh` commands and the board transition (issue to `Done`); run after the user confirms.
