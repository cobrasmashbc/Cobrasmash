# Requirements — Issue #37: publish the animated poster as video on Facebook and Instagram

Tier 3 acceptance criteria, from `/spec`, 8 October 2026. Test cases in
`tests/37-social-video-posts/test-cases.md` map one-to-one onto these.

## Publishing state

- **AC1** — KV tracks Facebook and Instagram independently. A successful post to one platform is
  recorded even when the other throws, so the next cron run retries only the platform that failed.
- **AC2** — Existing state is honoured without a migration: an id already in `posted-ids` is
  treated as done on both platforms and is never re-posted.
- **AC3** — An article whose id is in `EXCLUDED_IDS` (`news-next-session`) is never posted,
  regardless of KV contents or whether it has a video.

## Video publishing

- **AC4** — An article with a `video` field posts to Facebook via `POST /{page-id}/videos` using
  `file_url` and `description`, and the clip plays in the resulting Page post.
- **AC5** — The same article posts to Instagram via `POST /media` with `media_type=REELS` and
  `video_url`, and the Worker polls the container's `status_code` until `FINISHED` before calling
  `/media_publish`.
- **AC6** — A container that reaches `ERROR`, or that is still not `FINISHED` after a bounded
  number of polls, fails that platform's post with a logged reason and leaves it unmarked for
  retry — it never calls `/media_publish` on an unfinished container.
- **AC7** — Both platforms receive the same caption the image path produces today:
  `stripHtml(description)` under the title, with the `#latest-buzz` link last.

## Image fallback

- **AC8** — An article with no `video` field keeps the current behaviour on Facebook (WebP via
  `/photos`).
- **AC9** — The same article posts successfully to Instagram, using a JPEG URL rather than the
  WebP that the API rejects.
- **AC10** — An article with neither a usable image nor a video is skipped with a warning and not
  marked posted.

## Media pipeline

- **AC11** — `tools/convert_media.py --video <clip.mp4> <Name>` writes
  `public/assets/videos/<Name>.mp4` that satisfies Meta's Reel spec: H.264 yuv420p progressive,
  23–60 fps, at least 3 s, at most 300 MB, an AAC audio track (silent if the source has none), and
  the moov atom at the front (`+faststart`).
- **AC12** — The tool's existing `--news` and `--slider` behaviour is unchanged.

## Site and repo

- **AC13** — `public/data/news.json` validates with the new optional `video` field, and the live
  site renders the Latest Buzz card and slider exactly as before — the field is ignored by
  `contentLoader.js`.
- **AC14** — `public/_headers` serves `/assets/videos/*` with `X-Robots-Tag: noindex`, verified on
  a production response header (previews always get `noindex` from Cloudflare, so the check must
  be on production).
- **AC15** — `LICENSE` Part B lists the videos folder, and `README.md`'s License summary matches.
- **AC16** — `CONTENT.md` documents the video step in the `/buzz` checklist, and `CLAUDE.md`'s
  "never commit PNG/GIF/JPG" rule is reconciled with MP4 and the social JPEG now being committed.
- **AC17** — No new Cloudflare service is introduced; the Worker still deploys with
  `wrangler deploy` from `worker/social-publish/` and the Pages project is untouched.
