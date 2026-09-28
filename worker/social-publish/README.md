# Social publish worker

Cloudflare Worker for issue #23: polls `data/news.json` on an hourly Cron
Trigger and posts any new Latest Buzz article to Facebook and Instagram via
the Meta Graph API. See the issue for the full plan and acceptance criteria.

Deployed separately from the Pages project (`wrangler deploy`, run from this
directory) — nothing here is served by Cloudflare Pages.

## One-time setup

1. **Create the KV namespace** and paste the returned id into `id` in
   `wrangler.toml`:
   ```bash
   wrangler kv namespace create SOCIAL_PUBLISH_KV
   ```

2. **Seed it with every existing article id**, so the current backlog never
   gets bulk-posted — only genuinely new Buzz items from here on:
   ```bash
   wrangler kv key put posted-ids '["news-next-session","news-mkdba-league-11","news-new-joiners-aug22","news-3x15-live","news-cobra-elections","news-mkdba-league-10","news-mkdba-league-9","news-mkdba-league-8","news-mkdba-league-7","news-mkdba-league-6","news-mkdba-league-5","news-mkdba-league-4","news-mkdba-league-3","news-mkdba-league-2","news-mkdba-league","news-enfes-social","news-mens-doubles-2025","news-mixed-doubles-2025","yehlex-voted","prabhu-joins","news-sri-mksm-winner","airchy-tested","phyo-joins","shuttle-test-yehlex"]' --binding=SOCIAL_PUBLISH_KV --remote
   ```
   (`news-next-session` is excluded by the worker itself regardless, but
   including it here is harmless.)

3. **Set the secrets** (a Meta Developer App on the club's Facebook Page,
   with the Instagram professional account linked to that Page, and a
   long-lived Page Access Token — never commit these):
   ```bash
   wrangler secret put FB_PAGE_ID
   wrangler secret put FB_PAGE_ACCESS_TOKEN
   wrangler secret put IG_USER_ID
   ```

4. **Deploy:**
   ```bash
   wrangler deploy
   ```

## Local testing

```bash
wrangler dev --test-scheduled
```

Then trigger the scheduled handler without waiting for the real cron:

```bash
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

Check `wrangler tail` (or the `wrangler dev` console) for the
`Posted <id> to Facebook and Instagram` / `Failed to post <id>` log lines.
