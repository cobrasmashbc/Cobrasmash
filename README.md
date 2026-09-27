The entire CobraSmash website was designed and developed by Srikanth Gedela using the Vibe Coding.
For project inquiries, collaboration, or technical details, feel free to get in touch.

---

````markdown
# 🐍 CobraSmash

**CobraSmash** is a modern, fast-loading, and fully responsive website designed for a badminton community, featuring player profiles, news updates, dynamic sliders, and more. Built with a focus on clean code structure and modularity, this site is easy to maintain and extend.

---

## 🌐 Live Site

> [Coming Soon](#) — The site will be hosted shortly. Stay tuned!

---

## 📁 Project Structure

```plaintext
/
├── index.html                 # Entry point of the website
├── assets/
│   ├── css/                   # Modular CSS (components, layout, responsive, typography)
│   ├── js/                    # JS logic & modules (sliders, navigation, UI helpers)
│   ├── images/               # Optimized web images (logos, players, news, slider)
├── data/                     # JSON files powering dynamic content
├── site.webmanifest          # PWA and web app support
├── robots.txt, sitemap.xml   # SEO and web crawling configuration
├── favicon.ico, .png, .svg   # Icons and favicons for multiple platforms
├── BingSiteAuth.xml          # Bing site verification
├── browserconfig.xml         # Microsoft tile configuration
├── move_files.bat            # Utility script for deployment or migration
└── README.md                 # Project documentation
````

---

## 🧰 Technologies Used

* **HTML5**
* **Modular CSS** (custom component-based SCSS-like structure)
* **Vanilla JavaScript** (modular pattern with `js/modules`)
* **JSON Data Files** (for dynamic content injection)
* **WebP Format** (optimized images for speed)
* **SEO Essentials**: `sitemap.xml`, `robots.txt`, `manifest`, `browserconfig.xml`

---

## ✨ Key Features

* 🖼️ **Dynamic Hero Slider** — Smooth and customizable image carousel.
* 📰 **News Module** — Renders latest events and news from `news.json`.
* 🧑‍🤝‍🧑 **Player Profiles** — Gallery of members with image and details.
* 📱 **Responsive Design** — Fully mobile-ready with custom breakpoints.
* ⚡ **Fast Loading** — Optimized assets and clean, performant scripts.
* 🔗 **SEO-Friendly** — Includes manifest, robot rules, and sitemaps.

---

## 🚀 Getting Started

Clone this repo and open it in your browser:

```bash
git clone https://github.com/cobrasmashbc/cobrasmash.git
cd cobrasmash
```

You can open `index.html` directly in a browser, or use a local server (recommended for JS modules):

### Option 1: Open in browser (no module support)

* Drag and drop `index.html` into Chrome or Edge (not Firefox, due to module CORS issues)

### Option 2: Use a local dev server

Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code or run:

```bash
npx serve .
# or
python3 -m http.server
```

Then navigate to `http://localhost:8000` (or whichever port is shown).

---

## 🗃️ Data-Driven Architecture

Data is dynamically loaded from the `/data/` folder:

* `news.json` — Articles and latest events.
* `players.json` — Club member profiles.
* `slider.json` — Hero slider image/content.
* `testimonials-latest.json` — Testimonials display.

Modular JS components like `contentLoader.js` and `heroSlider.js` fetch and display this data seamlessly.

---

## 🛠️ Development Tips

```bash
# Common Git workflow
git add .
git commit -m "Describe your changes"
git pull --rebase origin main
git push origin main
```

To update content, edit the relevant JSON files and assets — no back-end required.

---

## 🔒 License

This project is licensed under the MIT License © [cobrasmashbc](https://github.com/cobrasmashbc)

---

## 🙌 Contributions

This is a community-driven project! Contributions, suggestions, and pull requests are welcome.

---

## 📬 Contact

Reach out via GitHub:

* [@cobrasmashbc](https://github.com/cobrasmashbc)

```

---

### ✅ Suggestions to Improve the Repo Further

| Area        | Suggestion |
|-------------|------------|
| **README**  | Add screenshots or a preview GIF to enhance presentation. |
| **Assets**  | Include lazy loading for images for better performance. |
| **Codebase**| Add comments in JS modules to document functionality. |
| **Hosting** | Consider deploying via GitHub Pages or Netlify. |

Would you like me to generate badges (e.g., GitHub stars, last commit, license) for the top of this README?
```
