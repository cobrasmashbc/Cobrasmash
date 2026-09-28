# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static, single-page website for Cobra Smash Badminton Club (https://cobrasmash.org.uk/). Plain HTML + modular CSS + vanilla ES modules, no build step, no package manager, no tests, no linter. Most day-to-day changes are content updates (JSON + images), not code.

Project direction lives in `mission.md` (goals), `roadmap.md` (phased plan) and `techstack.md` (current vs. possible future stack). The site stays static for now and is deployed as-is to Cloudflare Pages project `cobrasmash` via Git integration (no build command, build output directory `public`): every push to `main` goes live on cobrasmash.org.uk, and any other pushed branch gets a preview at `https://<branch-name-with-dashes>.cobrasmash.pages.dev`. Everything under `public/` is served at the site root; nothing outside it is deployed, so docs and project notes stay at the repo root. `public/_headers` is Cloudflare Pages config (not served): security headers on all responses, plus `X-Robots-Tag: noindex` on `/data/*` and the players/news/slider image folders to keep member data and photos out of search; `robots.txt` must not block CSS/JS/data (Google needs them to render the JSON-driven sections). Add any new member-data or photo folder to both. Previews always get `noindex` from Cloudflare, so check `noindex` rules on production. Don't introduce a framework, bundler or `package.json` unless the roadmap calls for it.

Work follows the issue-driven loop in `SDD.md` (`/orient` → `/propose` → `/spec` → `/build` → `/validate` → `/document` → `/ship`, defined in `.claude/commands/`). Routine `public/data/*.json` content updates skip the loop and go straight to `main` (SDD.md rule 5). Run only the step requested, and confirm with the user before any outward-facing action (issues, board moves, push, PR, merge). The board is the public GitHub Project #1 owned by `cobrasmashbc` (https://github.com/users/cobrasmashbc/projects/1).

`LICENSE` is custom: code is reusable with visible credit (Part A), while club content and personal data are all rights reserved (Part B: `public/assets/images/`, `public/data/`, branding, contact details, club text). If a change adds a new place for club content or member data (e.g. blog posts), add it to Part B and the README's License summary.

**The repo is public, including its full git history.** Before adding anything confidential or personal beyond what's already published (first names, nicknames, photos, testimonials, club contact details), stop and warn the user, and recommend making the repo private or keeping the data out of the repo. That covers members' phone numbers, personal emails, addresses, dates of birth, payment/bank/WhatsApp details, registration or attendance records, health info, anything about minors, and club finances or internal notes. Secrets and API tokens never go in the repo; use Cloudflare Pages or GitHub secrets. Roadmap Phases 2 and 3 (registrations, payments, player stats) will need this decision at `/propose`.

## Running locally

ES modules and `fetch()` of the JSON files require an HTTP server (opening `index.html` via `file://` breaks content loading):

```bash
python -m http.server 8000 --directory public     # or: npx serve public
```

Then open http://localhost:8000. Serve `public/` as the root: `index.html` and `site.webmanifest` use root-absolute paths like `/assets/...`.

All paths below are relative to `public/`.

## Architecture

- `index.html` is the only page. It holds all static sections (about, playing details, FAQ, sponsorship, join-us, footer) and empty containers that JS fills at runtime. Container IDs the JS depends on: `news-card-grid` (inside `#latest-buzz`), `admin-card-grid` / `member-card-grid` (inside `#team`), `marquee-content-container` (inside `#testimonials`), `.slides-container` (inside `#hero-section`), `year`.
- `assets/js/main.js` (loaded as `type="module" defer`) is the entry point. It runs static UI initializers first, then loads all dynamic content in parallel with `Promise.all`, and only then runs `initFlipCards()` and `initMarquee()` — these must run after content is injected because they bind to generated DOM.
- `assets/js/modules/contentLoader.js` fetches `data/news.json`, `data/players.json`, `data/testimonials-latest.json` and renders them as HTML template strings. `heroSlider.js` fetches `data/slider.json`. If a data file fails to load or is empty, the corresponding section is hidden rather than erroring.
- JSON fields containing text (`description`, `title`, `text`) are injected as raw HTML, so `<br>`, `<strong>`, emoji, and links are used freely in the data files.
- CSS: `assets/css/main.css` only `@import`s partials in order (base → typography → layout → header → footer → hero-slider → components); don't put styles directly in it. Design tokens (e.g. `--color-cobra-yellow`) are CSS variables in `_base.css` and can be referenced from JSON (e.g. slide `titleColor`). Note: `_responsive.css` exists but is **not** currently imported by `main.css`.

## Content conventions

- **News** (`data/news.json` → `articles[]`): rendered in file order (no sorting), so newest items go at the top. Only the first 6 show until "Show More News" is clicked. `image` is the flip-card front; optional `detailImage` shows on the back and is what the expand/lightbox button opens (falls back to `image`). `date` is a human-readable string parsed with `new Date()` (e.g. `"September 2, 2026"`).
- **Slider** (`data/slider.json` → `slides[]`): also file order. Optional per-slide `duration` (ms, default 5000), `backgroundSize` (default `cover`), `imageAlignment`, `expandable`, `buttonText`/`buttonLink`. Only the first slide's image loads eagerly; others lazy-load as they come up.
- **Players** (`data/players.json`): `admins[]` and `members[]`; `image` is a filename relative to `assets/images/players/` (not a full path, unlike news/slider). Falls back to the Font Awesome `iconClass` if no image.
- Images are WebP; slider entries sometimes have a GIF variant alongside. News images live in `assets/images/news/`, slider images in `assets/images/slider/`.
- Any change to what the site says (JSON content, or text/info in `index.html`) must bump `<lastmod>` in `public/sitemap.xml` to that day's date, in the same commit.
- Latest Buzz and slider posts follow the templates in `CONTENT.md` (`/buzz` does the whole flow); convert media with `tools/convert_media.py` (Pillow) to WebP, never commit new PNG/GIF/JPG.
