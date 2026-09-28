# 🐍 CobraSmash

**CobraSmash** is the website of Cobra Smash Badminton Club, a friendly, non-profit club for intermediate to advanced players in Milton Keynes. It's a fast, fully responsive single-page site featuring the latest club news, player profiles, a hero slider, FAQs and ways to join or sponsor the club. It's built as a static site with modular code and JSON-driven content, so it's easy to maintain and extend.

---

## 🌐 Live Site

👉 **[cobrasmash.org.uk](https://cobrasmash.org.uk/)**

---

## 📁 Project Structure

```plaintext
/
├── public/                       # Everything deployed to Cloudflare Pages (site root)
│   ├── index.html                # Entry point of the website
│   ├── assets/
│   │   ├── css/                  # Modular CSS (components, layout, responsive, typography)
│   │   ├── js/                   # JS logic & modules (sliders, navigation, UI helpers)
│   │   └── images/               # Optimized web images (logos, players, news, slider)
│   ├── data/                     # JSON files powering dynamic content
│   ├── site.webmanifest          # PWA and web app support
│   ├── robots.txt, sitemap.xml   # SEO and web crawling configuration
│   ├── _headers                  # Cloudflare Pages response headers (not served as a file)
│   ├── favicon.ico               # Favicon
│   ├── BingSiteAuth.xml          # Bing site verification
│   └── browserconfig.xml         # Microsoft tile configuration
├── worker/social-publish/        # Cloudflare Worker: auto-posts Latest Buzz to Facebook/Instagram (deployed separately, not via Pages)
├── .claude/commands/             # Slash commands for the SDD workflow (not deployed)
├── spec/<issue>-<slug>/          # Plan, requirements & validation log for complex changes (not deployed)
├── tests/<issue>-<slug>/         # Manual test-case checklists for complex changes (not deployed)
├── mission.md, roadmap.md, techstack.md   # Project direction (not deployed)
├── SDD.md                        # Spec-driven development workflow (not deployed)
├── CONTENT.md                    # Templates for Latest Buzz and slider posts (not deployed)
├── tools/convert_media.py        # Converts posters/animations to WebP (not deployed)
├── CLAUDE.md                     # Guidance for Claude Code (not deployed)
├── LICENSE                       # License terms (not deployed)
└── README.md                     # Project documentation
```

---

## 🧰 Technologies Used

* **HTML5**
* **Modular CSS** (component-based partials imported by `main.css`)
* **Vanilla JavaScript** (ES modules in `assets/js/modules`)
* **JSON Data Files** (for dynamic content injection)
* **WebP Format** (optimized images for speed)
* **SEO Essentials**: meta and social preview tags, structured data, `sitemap.xml`, `robots.txt`, `site.webmanifest`, `browserconfig.xml`
* **Cloudflare Pages** for hosting, with no build step

---

## ✨ Key Features

* 🖼️ **Dynamic Hero Slider**: autoplaying image/video carousel with lazy-loaded slides.
* 📰 **Latest Buzz**: flip-card news and match results from `news.json`, with an image lightbox.
* 🧑‍🤝‍🧑 **Meet the Cobras**: Cobra Council and Strike Squad player profiles.
* 💬 **Member Testimonials**: a scrolling marquee of what members say.
* ❓ **FAQ, sponsorship tiers and Join Us**: guest-session requests and enquiries by pre-filled email.
* 📱 **Responsive Design**: mobile menu and layouts for phones and tablets.
* ⚡ **Fast Loading**: optimized assets and lean, performant scripts.
* 🔗 **SEO-Friendly**: social previews, structured data, sitemap and robots rules.
* 📣 **Auto-Publish to Social**: new Latest Buzz posts are shared to Facebook and Instagram by a Cloudflare Worker (see Deployment below).

The full feature history is tracked as issues on the [CobraSmash project board](https://github.com/users/cobrasmashbc/projects/1).

---

## 🚀 Getting Started

Clone this repo:

```bash
git clone https://github.com/cobrasmashbc/Cobrasmash.git
cd Cobrasmash
```

The site loads its content with JavaScript modules and `fetch()`, so it must be served over HTTP from the `public/` folder. Opening `index.html` directly from disk won't load the content. Run a local server, or use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code with `public/` as the root:

```bash
npx serve public
# or
python3 -m http.server 8000 --directory public
```

Then navigate to `http://localhost:8000` (or whichever port is shown).

---

## 🗃️ Data-Driven Architecture

Content is loaded at runtime from the `public/data/` folder:

* `news.json`: Latest Buzz articles and events.
* `players.json`: Club member profiles.
* `slider.json`: Hero slider images and content.
* `testimonials-latest.json`: Member testimonials.

Modular JS components like `contentLoader.js` and `heroSlider.js` fetch and display this data. To update content, edit the relevant JSON files and images; no back end is required. Templates for Latest Buzz posts, slider slides and the next session are in [`CONTENT.md`](CONTENT.md), and `tools/convert_media.py` converts posters to WebP. Bump `<lastmod>` in `public/sitemap.xml` whenever site content changes.

---

## ☁️ Deployment

The site is hosted on **Cloudflare Pages**, connected to this repo, with no build command and `public` as the output directory.

* A push to `main` goes live on [cobrasmash.org.uk](https://cobrasmash.org.uk/).
* Any other pushed branch gets its own preview at `https://<branch-name>.cobrasmash.pages.dev`, with `/` in the branch name replaced by `-`. Cloudflare marks previews `noindex` so they stay out of search engines.
* `public/_headers` sets response headers on Cloudflare: basic security headers everywhere, and `X-Robots-Tag: noindex` on `/data/` and member, news and slider photos so they stay out of search results. `robots.txt` also keeps those photos out of Google Images.

The [`worker/social-publish/`](worker/social-publish/) Cloudflare Worker auto-posts new Latest Buzz items to Facebook and Instagram on an hourly Cron Trigger. It's deployed independently of Pages via `wrangler deploy` from that folder, not through Git integration; see its `README.md` for one-time KV and secrets setup.

---

## 🛠️ How We Work

Changes follow an issue-driven, spec-driven workflow, sized to the change:

1. Every change starts as an issue on the [CobraSmash project board](https://github.com/users/cobrasmashbc/projects/1), except routine content updates, which go straight to `main`.
2. Simple changes get a lightweight 3-bullet spec inline in the issue/PR; complex changes get full `plan.md` / `requirements.md` / `validation.md` under `spec/` and a manual test-case checklist under `tests/`, kept permanently as an audit trail.
3. Work happens on a `feature/<name>` branch and is checked on its Cloudflare Pages preview. Simple-change branches are deleted after merge; complex-change branches are kept, so a revert is always available.
4. It's merged to `main` through a pull request, which deploys it.

See:

* [`SDD.md`](SDD.md): the workflow steps (`/orient` → `/propose` → `/spec` → `/build` → `/validate` → `/document` → `/ship`).
* [`roadmap.md`](roadmap.md), [`mission.md`](mission.md), [`techstack.md`](techstack.md): where the project is going.
* [`CLAUDE.md`](CLAUDE.md): guidance for working on this repo with Claude Code.

---

## 🔒 License

© 2025 Srikanth Gedela and Cobra Smash Badminton Club. This project uses a custom license; see [`LICENSE`](LICENSE) for the full terms. In summary:

* **The code** (HTML structure, CSS, JavaScript and docs) may be reused, modified and shared, **provided a visible credit is included** in your site or app (see Credits below).
* **Club content and personal data are excluded, with all rights reserved.** Nothing here may be reused without the club's written permission: photos and graphics in `public/assets/images/`, content and member data in `public/data/`, the club's name, logo and branding, its contact details, and its written text. Replace all of it with your own.

---

## 🙌 Contributions

Suggestions and pull requests are welcome. Please open an issue first so the change can be tracked on the project board.

---

## 📬 Contact

* Email: [info@cobrasmash.org.uk](mailto:info@cobrasmash.org.uk)
* Instagram: [@cobrasmashmk](https://www.instagram.com/cobrasmashmk)
* Facebook: [cobrasmashmk](https://www.facebook.com/cobrasmashmk)
* GitHub: [@cobrasmashbc](https://github.com/cobrasmashbc)

---

## 🏆 Credits

Built by **Srikanth Gedela** with AI-assisted, spec-driven development.

If you reuse the code, include this credit where users can see it:

> Based on the Cobra Smash website by Srikanth Gedela (https://github.com/cobrasmashbc/Cobrasmash)
