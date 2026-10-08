# Test cases — Issue #37: publish the animated poster as video on Facebook and Instagram

Manual checklist (SDD rule 3 — there is no test runner). One case per acceptance criterion in
`spec/37-social-video-posts/requirements.md`. Results are recorded at `/validate` in
`spec/37-social-video-posts/validation.md`.

## Before you start

**TC1–TC10 publish real posts.** Point `FB_PAGE_ID` / `IG_USER_ID` at a test Facebook Page and a
test Instagram professional account before running them — never the club's live Page.

Local harness:

```bash
cd worker/social-publish
wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

Watch the `wrangler dev` console (or `wrangler tail` against the deployed Worker) for
`Posted <id> to ...` / `Failed to post <id>` lines. Inspect KV between runs with:

```bash
wrangler kv key get posted-fb --binding=SOCIAL_PUBLISH_KV --remote
wrangler kv key get posted-ig --binding=SOCIAL_PUBLISH_KV --remote
```

## Publishing state

**TC1 (AC1) — one platform failing must not re-post the other**
Given an article with a video and a deliberately broken `IG_USER_ID`,
when the scheduled handler runs twice,
then Facebook receives exactly one post, the Instagram failure is logged on both runs, and
`posted-fb` contains the id while `posted-ig` does not.

**TC2 (AC2) — legacy KV state is honoured**
Given `posted-ids` contains `news-mkdba-league-12` and `posted-fb` / `posted-ig` are absent,
when the handler runs,
then nothing is posted to either platform and no error is logged.

**TC3 (AC3) — the pinned card is never posted**
Given `news-next-session` is absent from every KV key and has a `video` field added,
when the handler runs,
then it is not posted.

## Video publishing

**TC4 (AC4) — Facebook video post**
Given an article with `"video": "assets/videos/CSBvsHarlingtonAOct08.mp4"`,
when the handler runs,
then the test Page shows a video post whose clip plays through to the "5-4 W" frame.

**TC5 (AC5) — Instagram Reel with status polling**
Given the same article,
when the handler runs,
then the log shows at least one `status_code` poll before `/media_publish`, and the Reel appears
on the test Instagram account.

**TC6 (AC6) — unfinished container is never published**
Given a `video` path pointing at a file that does not exist,
when the handler runs,
then the container ends in `ERROR` or the poll budget is exhausted, `/media_publish` is never
called, `Failed to post` is logged with the reason, and `posted-ig` does not gain the id.

**TC7 (AC7) — caption is unchanged**
Given the Harlington article,
when both posts succeed,
then each caption reads "Pressure Hit, Cobras Hit Back…" followed by the stripped description and
the `#latest-buzz` URL, with no HTML tags and no `&amp;`.

## Image fallback

**TC8 (AC8) — Facebook photo path still works**
Given an article with an image and no `video`,
when the handler runs,
then the test Page shows a photo post using the WebP.

**TC9 (AC9) — Instagram accepts the JPEG**
Given the same article,
when the handler runs,
then Instagram accepts the container and publishes, confirming the JPEG fixed the rejection the
WebP caused.

**TC10 (AC10) — nothing to post is skipped cleanly**
Given an article with empty `image`, `detailImage` and `video`,
when the handler runs,
then `Skipping <id>: no media to post` is logged and neither KV key gains the id.

## Media pipeline

**TC11 (AC11) — the MP4 meets Meta's Reel spec**
Given `Cobras Hit Back_ 5–4 Victory.mp4`,
when `python tools/convert_media.py "<clip>" CSBvsHarlingtonAOct08 --video` is run,
then `ffmpeg -i` on the output reports H.264 yuv420p, 24 fps, ~5.2 s and an AAC stream, and the
moov atom precedes the mdat.

**TC12 (AC12) — existing conversions are untouched**
Given the Harlington still and animation,
when `--news` and `--slider` are re-run,
then the outputs match the files on `main` in dimensions and frame count.

## Site and repo

**TC13 (AC13) — the site is unaffected by the new field**
Given the updated `news.json`,
when the site is served locally (`python -m http.server 8000 --directory public`) and on the
branch preview,
then the JSON validates, the Latest Buzz card and slider render as before, and the console is
clean.

**TC14 (AC14) — videos are noindex on production**
Given the branch is merged and deployed,
when `https://cobrasmash.org.uk/assets/videos/CSBvsHarlingtonAOct08.mp4` is requested,
then the response carries `X-Robots-Tag: noindex`.

**TC15 (AC15) — licence covers the new folder**
Given the merged branch,
when `LICENSE` Part B and the README License summary are read,
then both list the videos folder.

**TC16 (AC16) — docs are consistent**
Given the merged branch,
when `CONTENT.md` and `CLAUDE.md` are read,
then the video step appears in the `/buzz` checklist and the media-format rule covers MP4 and the
social JPEG without contradicting itself.

**TC17 (AC17) — deployment is unchanged**
Given the merged branch,
when `wrangler deploy` is run from `worker/social-publish/`,
then it succeeds with no bindings beyond `SOCIAL_PUBLISH_KV`, and cobrasmash.org.uk is unaffected.
