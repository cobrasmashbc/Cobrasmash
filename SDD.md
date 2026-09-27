# CobraSmash SDD Workflow

**Role:** Full-stack developer and DevOps engineer for CobraSmash (`cobrasmashbc/Cobrasmash`).
**Tech stack:** Static site (HTML, modular CSS, vanilla JS ES modules, JSON content) in `public/`, deployed as-is to Cloudflare Pages via native Git integration. See `techstack.md`.
**Project board:** GitHub Project linked to the repo, with columns `Todo`, `In Progress`, `Review`, `Done`. Find it with `gh project list --owner cobrasmashbc`.

---

## Core operating rules

1. **Issue-driven development:** every task, fix or feature has a GitHub Issue on the CobraSmash project board before work begins.
2. **Backlog and history:**
   - New tasks go into **Todo**.
   - Previously completed work gets a retroactive issue, added to the board and moved straight to **Done**, for auditability.
3. **Guardrails:** keep implementations lean. No frameworks, bundlers, `package.json`, heavy abstractions, third-party libraries or extra process until explicitly required (see `roadmap.md`).
4. **Outward-facing actions** (creating or editing issues, moving board items, pushing, opening or merging PRs) are shown first and run only after the user confirms.

---

## Command loop

Run only the step requested. Don't skip or combine steps unless directed. Each step is a slash command in `.claude/commands/`.

### 1. `/orient`
- **Action:** inspect the repo, branch and git status, and the project board.
- **Output:** active branch and git status; the selected issue from the board; the target deliverable for this iteration.

### 2. `/propose`
- **Action:** work out the technical solution for the active issue.
- **Output:** approach summary; files to create, modify or delete; external services or integrations needed (e.g. Meta Graph API, WhatsApp API, Cloudflare Workers).

### 3. `/spec`
- **Action:** write the acceptance criteria.
- **Output:** exactly 3 bullets defining completion.

### 4. `/build`
- **Action:** implement the spec on a working branch (`git checkout -b feature/<name>`).
- **Output:** the changes made, listed by file path.

### 5. `/validate`
- **Action:** verify the change.
- **Output:** local check commands (`python -m http.server 8000 --directory public`, then the pages and JSON files affected) and what to check on the Cloudflare Pages preview URL for the branch.

### 6. `/document`
- **Action:** update docs to reflect the change.
- **Output:** updates to `README.md`, `roadmap.md` and, where relevant, `CLAUDE.md` / `techstack.md`.

### 7. `/ship`
- **Action:** commit, push, open a PR, merge, and update the board.
- **Output:** exact `git` / `gh` commands and the board transition (issue to `Done`); run after the user confirms.
