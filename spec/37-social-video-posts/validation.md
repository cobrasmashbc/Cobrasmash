# Validation run log — Issue #37

**Date:** 8 October 2026
**Branch:** `feature/social-video-posts`
**Environment:** Windows 11, Python 3.13, Node 22.14.0, Pillow; local static server
`python -m http.server 8000 --directory public`; ffmpeg 18.1.0 (CapCut build, no `libx264`)
**Preview URL:** not yet pushed — see the preview checklist at the end
**Result:** 14 of 17 cases pass (TC15 and TC16 re-checked after `/document`); TC13 partial,
TC14 deferred to production, TC17 blocked on Cloudflare auth

## How TC1–TC10 were exercised

These cases publish to Facebook and Instagram, and no test Page or Instagram account has been
supplied, so they were **not** run against the real Graph API. Instead the Worker's publishing
logic was driven through a throwaway Node harness that stubs `fetch` and the KV binding. The
harness lives in the session scratchpad, **not in the repo** — SDD rule 3 keeps test tooling out
of the codebase — and asserts on the exact Graph API URLs, bodies and call ordering the Worker
produces.

This proves the logic (routing, parameters, polling order, KV bookkeeping, captions). It does
**not** prove Meta accepts the payloads; that still needs a real run against a test account.

## Results

| Case | Result | Evidence |
|---|---|---|
| TC1 (AC1) | **PASS** (stubbed) | Instagram forced to fail, handler run twice: exactly 1 Facebook video post across both runs; `posted-fb: ["vid-1"]`, `posted-ig` absent. A follow-up check confirmed the failed platform *is* retried on the second run. |
| TC2 (AC2) | **PASS** (stubbed) | With only legacy `posted-ids` seeded, 0 Graph API calls were made. |
| TC3 (AC3) | **PASS** (stubbed) | `news-next-session` given a `video` field: never appears in any request body. |
| TC4 (AC4) | **PASS** (stubbed) | `POST /PAGE/videos` with `file_url=https://cobrasmash.org.uk/assets/videos/CSBvsHarlingtonAOct08.mp4` and a `description`. |
| TC5 (AC5) | **PASS** (stubbed) | Container created with `media_type=REELS` + `video_url`; 2 `status_code` polls recorded, and the last poll precedes `/media_publish` in call order. |
| TC6 (AC6) | **PASS** (stubbed) | Container stubbed as `ERROR`: `media_publish` never called, `posted-ig` unchanged, `Instagram container ERROR` logged. |
| TC7 (AC7) | **PASS** (after a fix) | Caption renders as `Video Post\n\nLine one\n\nMark & Alex\n\nhttps://cobrasmash.org.uk/#latest-buzz` — no tags, no entities. See "Defect found" below. |
| TC8 (AC8) | **PASS** (stubbed) | No-video article posts `/photos` with the `.webp` URL. |
| TC9 (AC9) | **PASS** (stubbed) | Same article sends Instagram `image_url=.../old.jpg` and no `media_type`. |
| TC10 (AC10) | **PASS** (stubbed) | Article with no media logs `Skipping empty-1: no media to post`; no KV key gains the id. |
| TC11 (AC11) | **PASS** | `ffmpeg -i` on the output: `h264 (High)`, `yuv420p(progressive)`, 624x624, 24 fps, 5.21s, plus `Audio: aac (LC) 48000 Hz, stereo` added over the silent source. Top-level atoms are `ftyp, moov, free, mdat` — moov ahead of mdat, so faststart is correct. 2,140 KB. |
| TC12 (AC12) | **PASS** | Re-running `--news` left the committed WebP byte-identical (git reports no modification). Re-running `--slider` produced 63 frames, matching the committed file. `save_still` / `save_animated` are unchanged from `main`. |
| TC13 (AC13) | **PARTIAL** | `news.json` validates (26 articles), every `image` / `detailImage` / `video` path resolves on disk, `index.html` serves 200, and `contentLoader.js` never reads `video`, so the field is inert. The browser console check could not be done — the Chrome extension is not connected in this session. |
| TC14 (AC14) | **DEFERRED** | `public/_headers` carries the `/assets/videos/*` → `X-Robots-Tag: noindex` rule, but Cloudflare applies `noindex` to all previews, so this is only meaningful on production after merge. |
| TC15 (AC15) | **PASS** (after `/document`) | `LICENSE` Part B covers `public/assets/videos/`, and the README License summary now lists it too. Failed at first run because `/document` had not been run yet. |
| TC16 (AC16) | **PASS** (after `/document`) | `CONTENT.md` documents `--video` and the `.jpg` twin in the `/buzz` checklist; `CLAUDE.md` now states the two deliberate exceptions to "never commit PNG/GIF/JPG" rather than contradicting itself. |
| TC17 (AC17) | **BLOCKED** | `wrangler whoami` fails to reach Cloudflare from this session (earlier KV reads returned 401), so no deploy could be attempted. `wrangler.toml` is unchanged and still declares only the `SOCIAL_PUBLISH_KV` binding. |

## Defect found and fixed during validation

**Captions posted raw HTML entities.** `stripHtml()` removed tags but never decoded entities, so
`Mark &amp; Alex` in the JSON would have reached Facebook and Instagram verbatim. This affects
the **currently deployed** Worker too, not just the video path — any Buzz item containing `&`.
Fixed by decoding `&amp; &lt; &gt; &quot; &#39; &apos; &nbsp;` after tag stripping
(`worker/social-publish/src/index.js`). TC7 passes after the fix.

## Still needed before this can be called done

1. A **test Facebook Page and Instagram professional account** to re-run TC1–TC10 against the
   real Graph API. The stubbed results say the Worker asks for the right things; only a real run
   says Meta agrees — particularly that a 1:1 Reel is accepted and that the silent AAC track is
   enough.
2. Confirmation that the Page token carries `pages_manage_posts` and `instagram_content_publish`.
3. Production check of TC14 after merge.

## Preview checklist (once the branch is pushed)

Preview URL will be `https://feature-social-video-posts.cobrasmash.pages.dev`.

- [ ] Latest Buzz shows the Harlington card unchanged — same image, title, and the Super Six line
      reading `Mark & Alex, Sridhar & Phyo, Imran & Ram`.
- [ ] Hero slide 1 **animates** through to the "5-4 W" frame.
- [ ] `/data/news.json` loads and contains `"video": "assets/videos/CSBvsHarlingtonAOct08.mp4"`.
- [ ] `/assets/videos/CSBvsHarlingtonAOct08.mp4` returns 200 with `Content-Type: video/mp4` and
      plays in the browser — this is the URL Meta will fetch, so it must be publicly reachable.
- [ ] `/assets/images/news/CSBvsHarlingtonAOct08.jpg` returns 200 with `Content-Type: image/jpeg`.
- [ ] Browser console is clean on load.
- [ ] After merge only: production `/assets/videos/...mp4` returns `X-Robots-Tag: noindex` (TC14).
