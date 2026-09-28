# Tech Stack & Tooling

## Current

- **Site:** Static single page: `index.html`, modular CSS (`assets/css/`), vanilla JavaScript ES modules (`assets/js/`)
- **Content:** JSON files in `data/`, fetched at runtime
- **Build:** None; files are deployed as-is
- **Package Manager:** None
- **Hosting:** Cloudflare Pages (static, build output directory `public/`)
- **CI/CD:** Cloudflare Pages native Git integration (auto-deploy on push to `main`)
- **Social syndication:** `worker/social-publish/`, a Cloudflare Worker (Cron Trigger + KV) that auto-posts new Latest Buzz items to Facebook and Instagram via the Meta Graph API; deployed separately from Pages via `wrangler`, not through Git integration

## Possible future additions

- Cloudflare Pages Functions / Workers for server-side features (registrations, WhatsApp)
- A database for player stats and leaderboards
- Next.js (App Router, TypeScript) with Tailwind CSS: deferred, only if later phases outgrow the static site
