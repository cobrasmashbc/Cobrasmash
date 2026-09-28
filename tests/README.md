# tests/

Manual test-case checklists for Tier 3 (complex) changes, per `SDD.md` rule 6. Not deployed — outside `public/`.

There's no test runner in this repo (static site, no build step — see `CLAUDE.md`), so these are plain-language checklists, not automated tests.

Each change gets `tests/<issue>-<slug>/test-cases.md`: one Given/When/Then case per requirement in the matching `spec/<issue>-<slug>/requirements.md`, run manually against `localhost` and the Cloudflare Pages preview during `/validate`, with results recorded in `spec/<issue>-<slug>/validation.md`.
