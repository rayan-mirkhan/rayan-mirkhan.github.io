# Rayan Mirkhan — Portfolio

Bilingual one-page portfolio: Kurdish (Badini, RTL, default) and English (LTR).
Plain HTML/CSS/JS, with no build step and no framework. Hosted on GitHub Pages.

```
index.html               page markup (contains the Kurdish copy)
404.html                 "off air" page (self-contained on purpose)
assets/css/styles.css    design system: tokens → base → layout → components → utilities
assets/js/translations.js  all copy, { ku: {...}, en: {...} }
assets/js/i18n.js        language switching
assets/js/main.js        nav, reveals, ticker, counters, tilt
assets/img/              photos, favicon, social preview image
assets/cv/               rayan-mirkhan-cv-ku.pdf, rayan-mirkhan-cv-en.pdf
tooling/                 local-only scripts (images, QA, Lighthouse); never loaded by the site
```

Live at https://rayan-mirkhan.github.io/

To preview, open `index.html` directly in a browser, or run
`cd tooling && npm install && node serve.mjs` and open http://localhost:4173/.

## Edit text

Every piece of text has a key, for example `data-i18n="tagline"`.

- **English**: edit the value under `en` in `assets/js/translations.js`.
- **Kurdish**: edit the value under `ku` in `assets/js/translations.js` **and** the same text in
  `index.html`. The HTML copy is what search engines and no-JS visitors see; the JS copy is
  used when someone switches back from English.

Kurdish uses Eastern Arabic digits (٠١٢٣٤٥٦٧٨٩); English uses 0–9. The stat counters
(`data-count="4"`) and the footer year are converted automatically.

## Replace the photo

1. Put the new photo at `source-assets/profile.jpg` (portrait orientation works best).
2. Run `cd tooling && npm install && node images.mjs`.
   This writes `profile.jpg`/`.webp` (max 1200px tall) and `profile-480.jpg`/`.webp`.
3. If the new photo's aspect ratio isn't 3:4, update the `width`/`height` attributes on the
   two `<img>` tags in `index.html` to match the new output size (printed by the script).

If you can't run Node, export the four files at those sizes yourself with the same names.

## Update the CVs

Replace `assets/cv/rayan-mirkhan-cv-ku.pdf` and `assets/cv/rayan-mirkhan-cv-en.pdf`, keeping
the same file names. The "Download CV" button always serves the PDF for the active language.

These PDFs are public. Don't put a home or neighbourhood address in them; city and region are enough.

## Add social links

In `index.html`, search for `Social links`. There's a commented-out block with Instagram,
X and LinkedIn icons. Uncomment it, replace each `USERNAME` URL, and delete any you don't need.
Keep `target="_blank" rel="noopener noreferrer"` on every link.

## Redeploy

Every push to `main` republishes the site (GitHub Pages, deploying from `main` / root):

```bash
git add -A
git commit -m "content: update tagline"
git push
```

The live site updates within about a minute. If the site address ever changes, update the URL
in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `robots.txt`
and `sitemap.xml`.
