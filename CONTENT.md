# Content Templates: Latest Buzz and Slider

How to post a match result, news item or next-session update. These are routine content updates (SDD.md rule 5): they go straight to `main` and are live about a minute after pushing. In Claude Code, `/buzz` does all of this for you from a poster and a few details.

## Checklist

1. **Convert the media** (never commit PNG/GIF/JPG as site imagery):
   ```bash
   python tools/convert_media.py "<poster.png or .gif>" <FileName>            # both news + slider
   python tools/convert_media.py "<poster.png>" <FileName> --news             # Latest Buzz only
   python tools/convert_media.py "<poster.gif>" <FileName> --slider           # slider only
   python tools/convert_media.py "<clip.mp4>"   <FileName> --video            # for Facebook/Instagram
   ```
   - File name: `CS<Team>vs<Opponent><Mon><DD>`, e.g. `CSAvsBuckinghamASep20`, `CSBvsWoughtonDOct04`.
   - **The slider is always the animation; Latest Buzz is always the still.** Same `<FileName>` for
     both, so one post is one name in two folders. Run the tool twice when the two sources differ:
     the still PNG with `--news`, the animation with `--slider`. Never ship a still to the slider.
   - Needs Pillow once: `python -m pip install --user pillow`.
   - `--news` also writes `<FileName>.jpg` next to the WebP. That is not for the site - it is
     what the social Worker gives Instagram, whose API rejects WebP.
   - **If the animation is an MP4** (Pillow can't read video), decode it to frames first, then feed
     those to the tool. There's no ffmpeg on PATH; CapCut ships one at
     `%LOCALAPPDATA%/CapCut/Apps/<version>/ffmpeg.exe`:
     ```bash
     ffmpeg -i "<clip.mp4>" -vf "fps=24,scale=400:-1:flags=lanczos" frames/f_%04d.png
     ```
     Then assemble every other frame (12 fps, `duration=84`) as an animated WebP at
     `quality=65`. Keep the slider animation around **400x400 and under ~3 MB** - it's the first
     slide and loads eagerly, so weight here is a page-speed cost.
   - **If there is a clip, also run `--video`.** It writes `public/assets/videos/<FileName>.mp4`
     for the social Worker, which posts it as a Facebook video and an Instagram Reel - neither
     platform animates a WebP, so without this they get the flat still. The tool finds CapCut's
     ffmpeg itself, copies the video stream when it is already H.264, adds a silent AAC track and
     moves the moov atom to the front, all of which Meta requires.
2. **Add the Latest Buzz card** to `public/data/news.json` (template below). Put it **directly after** the pinned `news-next-session` card; the rest stay newest first. Only the first 6 cards show before "Show More News".
   Leave `"social"` off for now - the card goes live on the site, but nothing is posted to
   Facebook or Instagram until you approve it in step 6.
3. **Add the slide** at the **top** of `public/data/slider.json` (skip only for a next-session change).
   With a clip, add `"video": "assets/videos/<FileName>.mp4"` to the Latest Buzz card too - the
   site ignores it, the social Worker posts it.
4. **Bump** `<lastmod>` in `public/sitemap.xml` to today's date (`YYYY-MM-DD`).
5. **Check** both JSON files are valid, view the page locally (`python -m http.server 8000 --directory public`), commit as `Content: <summary>`, push, and check https://cobrasmash.org.uk/.
6. **Approve it for social.** Once the post looks right on the live site, add `"social": true` to
   the card and push that one-line change. The Worker picks it up within the hour and posts to
   Facebook and Instagram. Until then it logs `Holding <id>` and sends nothing - so a post you
   are not happy with never reaches anyone.

IDs continue the existing sequence: `news-mkdba-league-<N>` and `slide-mkdba-league-<N>` (next number after the highest one in the file).

## Latest Buzz: match result

```json
{
  "id": "news-mkdba-league-12",
  "title": "Cobras <Headline>: <Score> <Home/Away> Win vs <Opponent> 🏸🔥",
  "date": "October 4, 2026",
  "image": "assets/images/news/<FileName>.webp",
  "detailImage": "",
  "description": "<strong>🔥 <Headline>: <score summary> at MKDBA League 2026–27!</strong> <br> <br> <strong>🐍 Team:</strong> Cobra Smash <A/B> <br>  <strong>📅 Match Day:</strong> <Weekday>, <Mon DD> <br>  <strong>🔥 Opponent:</strong> <Opponent> <br>  <strong>👑 Captain:</strong> <Name> <br>  <strong>✅ The Super Six:</strong> <Name> &amp; <Name>, <Name> &amp; <Name>, <Name> &amp; <Name> <br>  <strong>📍 Battleground🏸:</strong> <Venue> (<Home/Away>) @ <H:MM>PM  <br> <br> <strong>🎯 RESULT:</strong> <score and one-line summary>",
  "video": "assets/videos/<FileName>.mp4",
  "expandable": true,
  "social": true
},
```

- `video` and `social` are read only by the social Worker, never by the site. `video` is optional;
  without `"social": true` nothing is posted at all.

- `date`: written out as `Month D, YYYY`; it drives the date badge.
- `description` is HTML: use `<br>` for line breaks and `<strong>` for labels. Keep emojis and labels consistent with earlier posts.
- `detailImage`: optional second image shown on the back of the card; leave `""` if none.
- Names: use first names as they appear in `public/data/players.json` (e.g. "Steffan").
- "The Super Six" carries the pairings when you have them - write it as the three pairs,
  `Mark &amp; Alex, Sridhar &amp; Phyo, Imran &amp; Ram`, not a flat list and not a
  separate "Pairings" line. With no pairing info, a flat list of the six is fine. Adding anything more personal (surnames with photos, phone numbers, etc.) is not a routine update; see `CLAUDE.md`.

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
  "expandable": true,
  "social": true
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
- `backgroundVideo` (optional): path to a `.webm` file (e.g. `assets/images/slider/<FileName>.webm`) to play instead of the static image. Keep `backgroundImage` too — it's used as the video's poster and as the lightbox/expand image. The video is muted, looped and lazy-loaded the same way the image is, and only plays while its slide is on screen; visitors with "reduce motion" enabled always see the static poster instead.
