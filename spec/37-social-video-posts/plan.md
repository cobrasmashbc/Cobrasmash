# Plan — Issue #37: publish the animated poster as video on Facebook and Instagram

Tier 3 (SDD.md rule 5). From `/propose`, 8 October 2026.

## Why

The social-publish Worker posts the Latest Buzz **still** to Facebook and Instagram, so the
version that reaches members is the flat one. Posters are produced as animations. Neither
platform animates a WebP — Facebook needs `/videos` with a `file_url`, Instagram needs
`media_type=REELS` with a `video_url`, both MP4.

Two existing bugs surfaced while reading the Worker:

1. **Instagram rejects our posts.** The Content Publishing API takes JPEG only
   ([Meta content publishing](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing)),
   and `resolveImageUrl()` hands it a `.webp` URL.
2. **One platform failing re-posts the other.** `run()` marks an article posted only after both
   calls succeed, so a failing Instagram post makes the hourly cron publish to Facebook again
   every hour. `news-mkdba-league-12` is the first genuinely new article since the KV was seeded,
   so this is live now rather than theoretical.

## Approach

Four parts, in dependency order.

### 1. Per-platform publish state

Keep `posted-ids` as "done on both platforms" for backward compatibility, and add `posted-fb` and
`posted-ig` arrays. A platform is skipped when its own array **or** `posted-ids` contains the id.
No KV migration, and the existing seeded backlog keeps working. This is what makes the retry loop
safe, so it lands first.

### 2. Host an MP4 per post

Commit the clip to `public/assets/videos/<FileName>.mp4`. Cloudflare Pages serves it at a public
URL, which is all Meta needs — it fetches the file itself. This keeps the "no new services"
guardrail (SDD rule 3): no R2, no Stream. At ~2 MB and roughly two posts a month the git cost is
acceptable.

A new optional `"video"` field on the news article points at it. `contentLoader.js` ignores
unknown fields, so no site code changes.

### 3. Post video when the article has one

- **Facebook:** `POST /{page-id}/videos` with `file_url` and `description` (the videos edge uses
  `description`, not `caption`).
- **Instagram:** `POST /media` with `media_type=REELS` and `video_url`, then poll the container's
  `status_code` until `FINISHED` before `/media_publish`. Video containers are asynchronous — this
  is the main behavioural difference from the image path. Bounded polling; `ERROR` or exhausting
  the budget fails that platform without ever publishing an unfinished container.

Articles with no `video` keep the current image path.

### 4. Fix the image fallback for Instagram

`convert_media.py` also writes a social JPEG next to the news WebP, and the Worker uses it for
Instagram's `image_url`. Facebook keeps the WebP.

## Media constraints (verified against the source clip)

`Cobras Hit Back_ 5–4 Victory.mp4` reports H.264 High, yuv420p progressive, 624x624, 24 fps,
5.21 s, 2.1 MB — inside Meta's Reel limits (1:1 sits within the accepted 0.01:1–10:1 range,
though 9:16 is what Meta recommends to avoid padding). Two gaps the pipeline must close:

- **No audio track.** Meta specifies AAC, and silent video is a common Reels rejection. Add a
  silent AAC track via `anullsrc`.
- **moov atom placement.** Meta requires it at the front: `-movflags +faststart`.

There is no ffmpeg on PATH on the maintainer's machine; CapCut ships a working one at
`%LOCALAPPDATA%/CapCut/Apps/<version>/ffmpeg.exe`. That build has no `libx264`, so the pipeline
copies the video stream when it is already compliant H.264 (the normal case) and only falls back
to a hardware encoder when it is not.

## Files

| File | Change |
|---|---|
| `worker/social-publish/src/index.js` | modify — per-platform KV state, video branches, Reels polling |
| `worker/social-publish/README.md` | modify — token scopes, KV shape, video testing |
| `tools/convert_media.py` | modify — `--video` (faststart + silent AAC) and social JPEG output |
| `public/data/news.json` | modify — optional `video` field; set on `news-mkdba-league-12` |
| `public/assets/videos/CSBvsHarlingtonAOct08.mp4` | create — first committed MP4 |
| `public/_headers` | modify — `X-Robots-Tag: noindex` on `/assets/videos/*` |
| `LICENSE` | modify — videos folder into Part B |
| `CONTENT.md`, `CLAUDE.md`, `README.md`, `techstack.md` | modify at `/document` — MP4 and social JPEG are now committed media |

## External dependencies

- **Meta Graph API** `/videos` (Facebook) and `media_type=REELS` (Instagram). The Page token needs
  `pages_manage_posts` and `instagram_content_publish`; if it lacks them the failure is a Meta
  permissions error, not a code fault, and the fix is a new token via `wrangler secret put`.
- **ffmpeg** for MP4 prep — CapCut's bundled copy, nothing installed.
- No new Cloudflare service; the Worker still deploys with `wrangler deploy` from
  `worker/social-publish/`.

## Risks

Reels is a different product surface from a feed photo: square posters are padded or cropped in
the Reels tab, and the post appears as a Reel rather than an image. If the Instagram grid should
keep the poster look, the alternative is image-on-Instagram with video-on-Facebook-only.
