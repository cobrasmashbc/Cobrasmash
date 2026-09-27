# CobraSmash Development Roadmap

**Phase 0: Infrastructure & Automation (Done)**
- [x] Analyze codebase and Cloudflare Pages requirements (static site, no build step needed).
- [x] Connect GitHub repository natively to Cloudflare Pages (framework preset: None, build command: empty, build output directory: `public`).
- [x] Point `cobrasmash.org.uk` at the Pages project.
- [x] Verify automatic deploys on push to `main` (JSON/image content updates go live without manual steps).

**Phase 1: Content & Social Syndication (Next)**
- [ ] Implement Markdown/CMS-based Blog architecture.
- [ ] Integrate Meta Graph API (or Zapier/Make) to auto-publish "Latest Buzz" to Facebook and Instagram.

**Phase 2: Club Operations**
- [ ] Build player registration workflows for club nights.
- [ ] Integrate WhatsApp API to automatically send payment instructions upon registration.

**Phase 3: Player Engagement**
- [ ] Design database schema for player statistics and match history.
- [ ] Build dynamic, auto-updating leaderboards based on doubles performance.

**Deferred: Framework migration**
- [ ] Re-evaluate moving to Next.js once later phases need server-side features beyond what the static site can reasonably support.
