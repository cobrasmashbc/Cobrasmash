# Tech Stack & Tooling

## Current

- **Site:** Static single page: `index.html`, modular CSS (`assets/css/`), vanilla JavaScript ES modules (`assets/js/`)
- **Content:** JSON files in `data/`, fetched at runtime
- **Build:** None; files are deployed as-is
- **Package Manager:** None
- **Hosting:** Cloudflare Pages (static, build output directory `public/`)
- **CI/CD:** Cloudflare Pages native Git integration (auto-deploy on push to `main`)
- **Search indexing:** `.github/workflows/indexnow.yml` pings IndexNow (Bing, Yandex) after a `public/**` push to `main`, once the deploy is live; key file lives at the site root and is public by protocol design
- **Social syndication:** `worker/social-publish/`, a Cloudflare Worker (Cron Trigger + KV) that auto-posts new Latest Buzz items to Facebook and Instagram via the Meta Graph API, as a video post and a Reel when the item has an MP4; deployed separately from Pages via `wrangler`, not through Git integration

## Possible future additions

- Cloudflare Pages Functions / Workers for server-side features (registrations, WhatsApp)
- A database for player stats and leaderboards
- Next.js (App Router, TypeScript) with Tailwind CSS: deferred, only if later phases outgrow the static site
