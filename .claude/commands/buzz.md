---
description: Post a match result, news item or next-session update to Latest Buzz and the slider
argument-hint: "<poster path(s)> <details: date, opponent, score, home/away, team, captain, players...>"
---
Routine content update (SDD.md rule 5; templates in `CONTENT.md`). Details: $ARGUMENTS

1. Work out what's being posted: a match result, general news, or a next-session date change. Read any poster image to confirm the date, time, venue, teams and score, and check the weekday matches the date. If key details are missing or conflict, ask once before editing.
2. Personal data check: names must be first names already in `public/data/players.json`. Anything beyond the published baseline (see `CLAUDE.md`) is not routine: stop and warn.
3. Media: convert with `python tools/convert_media.py "<source>" <FileName> [--news|--slider]` (install Pillow if missing). Use the still for news and the animation for the slider. Look at one output frame to confirm the text is legible.
4. Edit `public/data/news.json` (after the pinned `news-next-session` card) and, for match results or big news, `public/data/slider.json` (top), following the `CONTENT.md` templates and continuing the ID sequence. For a next-session change, edit only the `news-next-session` card.
5. Bump `<lastmod>` in `public/sitemap.xml` to today.
6. Validate both JSON files and that every referenced image exists; serve `public/` locally and check the new slide and card render.
7. Show the user the card text and file sizes, then commit (`Content: <summary>`) and push to `main` only after they confirm. After Cloudflare deploys, check the live `data/news.json` / `data/slider.json` on https://cobrasmash.org.uk/.
