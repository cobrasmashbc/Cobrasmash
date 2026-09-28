# Content Templates: Latest Buzz and Slider

How to post a match result, news item or next-session update. These are routine content updates (SDD.md rule 5): they go straight to `main` and are live about a minute after pushing. In Claude Code, `/buzz` does all of this for you from a poster and a few details.

## Checklist

1. **Convert the media** to WebP (never commit PNG/GIF/JPG for new posts):
   ```bash
   python tools/convert_media.py "<poster.png or .gif>" <FileName>            # both news + slider
   python tools/convert_media.py "<poster.png>" <FileName> --news             # Latest Buzz only
   ```
   - File name: `CS<Team>vs<Opponent><Mon><DD>`, e.g. `CSAvsBuckinghamASep20`, `CSBvsWoughtonDOct04`.
   - Use the still PNG for `--news` and the animated GIF (if any) for `--slider`.
   - Needs Pillow once: `python -m pip install --user pillow`.
2. **Add the Latest Buzz card** to `public/data/news.json` (template below). Put it **directly after** the pinned `news-next-session` card; the rest stay newest first. Only the first 6 cards show before "Show More News".
3. **Add the slide** (optional) at the **top** of `public/data/slider.json`.
4. **Bump** `<lastmod>` in `public/sitemap.xml` to today's date (`YYYY-MM-DD`).
5. **Check** both JSON files are valid, view the page locally (`python -m http.server 8000 --directory public`), commit as `Content: <summary>`, push, and check https://cobrasmash.org.uk/.

IDs continue the existing sequence: `news-mkdba-league-<N>` and `slide-mkdba-league-<N>` (next number after the highest one in the file).

## Latest Buzz: match result

```json
{
  "id": "news-mkdba-league-12",
  "title": "Cobras <Headline>: <Score> <Home/Away> Win vs <Opponent> 🏸🔥",
  "date": "October 4, 2026",
  "image": "assets/images/news/<FileName>.webp",
  "detailImage": "",
  "description": "<strong>🔥 <Headline>: <score summary> at MKDBA League 2026–27!</strong> <br> <br> <strong>🐍 Team:</strong> Cobra Smash <A/B> <br>  <strong>📅 Match Day:</strong> <Weekday>, <Mon DD> <br>  <strong>🔥 Opponent:</strong> <Opponent> <br>  <strong>👑 Captain:</strong> <Name> <br>  <strong>✅ The Super Six:</strong> <Name>, <Name>, <Name>, <Name>, <Name>, <Name> <br>  <strong>📍 Battleground🏸:</strong> <Venue> (<Home/Away>) @ <H:MM>PM  <br> <br> <strong>🎯 RESULT:</strong> <score and one-line summary>",
  "expandable": true
},
```

- `date`: written out as `Month D, YYYY`; it drives the date badge.
- `description` is HTML: use `<br>` for line breaks and `<strong>` for labels. Keep emojis and labels consistent with earlier posts.
- `detailImage`: optional second image shown on the back of the card; leave `""` if none.
- Names: use first names as they appear in `public/data/players.json` (e.g. "Steffan"). Adding anything more personal (surnames with photos, phone numbers, etc.) is not a routine update; see `CLAUDE.md`.

## Latest Buzz: general news

Same fields; the description is free-form HTML:

```json
{
  "id": "news-<short-slug>",
  "title": "<Title> <emoji>",
  "date": "October 4, 2026",
  "image": "assets/images/news/<FileName>.webp",
  "detailImage": "",
  "description": "<strong>⚡ <Lead line></strong><br><br><Body text with <br><br> between paragraphs>",
  "expandable": true
},
```

## Next session (pinned first card)

Edit the existing `news-next-session` card; change only the dates unless the courts or time change:

```json
  "date": "October 7, 2026",
  "description": "📅 Next Session: <strong>Wednesday, 7 October 2026</strong><br><br>🕖 <strong>Courts 4, 5 & 6: 7:00 PM - 9:00 PM</strong><br><br>📍 <strong>National Badminton Centre, Bradwell Rd, Milton Keynes MK8 9LA</strong> 🏸",
```

## Slider slide

```json
    {
  "id": "slide-mkdba-league-9",
  "backgroundImage": "assets/images/slider/<FileName>.webp",
  "backgroundColorOverlay": "rgba(0, 0, 0, 0)",
  "title": "<br>",
  "text": "<br><br>",
  "buttonText": "See Latest Buzz",
  "buttonLink": "#latest-buzz",
  "backgroundSize": "contain",
  "titleColor": "var(--color-cobra-yellow)",
  "date": "2026-10-04",
  "duration": 10000,
  "expandable": true
},
```

- `date`: `YYYY-MM-DD`; drives the badge.
- `duration`: milliseconds on screen. Use 8000 for stills; for animations use the length `convert_media.py` prints (e.g. 10000).
- The poster carries the text, so `title`/`text` stay as `<br>` spacers. For a text slide, put real text in them and use `"backgroundColorOverlay": "rgba(0, 0, 0, 0.5)"` so it stays readable.
