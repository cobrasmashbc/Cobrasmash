# Social publish worker

Cloudflare Worker for issue #23: polls `data/news.json` on an hourly Cron
Trigger and posts any new Latest Buzz article to Facebook and Instagram via
the Meta Graph API. See the issue for the full plan and acceptance criteria.

Deployed separately from the Pages project (`wrangler deploy`, run from this
directory) — nothing here is served by Cloudflare Pages.

## What gets posted (issue #37)

An article with a `video` field (an MP4 under `public/assets/videos/`, written
by `tools/convert_media.py --video`) is posted as a **Facebook video** and an
**Instagram Reel**. Instagram builds video containers asynchronously, so the
Worker polls the container's `status_code` until `FINISHED` before publishing,
and gives up rather than publishing an unfinished container.

An article without a video keeps the image path: the WebP goes to Facebook,
and the `.jpg` twin beside it goes to Instagram, whose Content Publishing API
accepts JPEG only.

Facebook and Instagram are tracked separately in KV, so one platform failing
never causes the other to be posted twice.

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

   Since #37 the Worker also keeps `posted-fb` and `posted-ig`, in the same
   array format. They're created on first use, and anything already listed in
   `posted-ids` counts as posted on both platforms — so there's nothing to
   migrate. To replay one platform only, remove the id from that platform's
   key (and from `posted-ids` if it's there).

3. **Set the secrets** (a Meta Developer App on the club's Facebook Page,
   with the Instagram professional account linked to that Page, and a
   long-lived Page Access Token — never commit these):
   ```bash
   wrangler secret put FB_PAGE_ID
   wrangler secret put FB_PAGE_ACCESS_TOKEN
   wrangler secret put IG_USER_ID
   ```
   The token needs `pages_manage_posts` (Facebook video posts) and
   `instagram_content_publish` (Reels) on top of the read scopes. A token
   without them fails at the Graph API with a permissions error, which shows
   up in the logs as `Failed to post <id> to ...`.

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
`Posted <id> to <platform>` / `Failed to post <id> to <platform>` log lines —
one per platform, since each is recorded separately.

## Ad-hoc trigger against production

The deployed Worker has no HTTP handler and no public route (`workers_dev
= false`) — it only runs on its hourly Cron Trigger. There's no dashboard
button to fire a deployed Worker's cron on demand.

To force a real run against the live production KV namespace and secrets
without waiting for the next hour, run Wrangler's dev mode against remote
resources instead of adding a permanent public endpoint:

```bash
wrangler dev --remote --test-scheduled
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

This reads/writes the real `SOCIAL_PUBLISH_KV` namespace and uses the real
secrets, so it will actually post to Facebook/Instagram if there's a new
article — nothing is simulated. Stop the `wrangler dev` process (Ctrl+C)
when done; it doesn't deploy or expose anything.
