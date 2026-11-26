# Lommer website

One-page static site for Lommer, a product design studio. No build step.

- `index.html`: the whole page (sections: What we do, Client work, Our collection, Featured in, Studio, Contact).
- `style.css`: all styles. Mobile and tablet rules are in the "Mobile & tablet" block at the end (breakpoints 900px and 640px).
- `assets/img/`: images (WebP). `assets/js/main.js`: scroll reveal and footer year. `assets/js/product-3d.js`: the 3D turn on the collection photos. `assets/js/intro.js`: the "Fold open" loading screen. `assets/js/consent.js`: cookie banner + Google Analytics. `privacy.html`: privacy page.
- `tools/`: helper scripts, not part of the published site.
- Live address: https://lommer.design/
- `llms.txt`, `robots.txt`: files for AI agents and crawlers.
- `favicon.ico`, `assets/img/favicon-32.png`, `assets/img/favicon-48.png` (source, from the studio), `assets/img/apple-touch-icon.png`: icons. `assets/img/og-image.jpg` (1200×630): the picture shown in link previews.

## Keep the agent files in sync (required)

The site has three descriptions of the studio that must always match:

1. The visible content in `index.html`
2. The JSON-LD block (`<script type="application/ld+json">`) in the `<head>` of `index.html`
3. `llms.txt`, the plain-text summary for AI agents

**Whenever you change content in `index.html`** (services, client work, products, awards, press, studio text, contact details or social links), **update `llms.txt` and the JSON-LD block in the same change.** Also update the `description`, `og:` and `twitter:` meta tags if the studio's one-line description changes. Links in meta tags, JSON-LD, `llms.txt` and `robots.txt` must be full addresses starting with `https://lommer.design/`. Before finishing, check the three still agree.

## Other conventions

- After editing `style.css`, bump the version in `style.css?v=N` in `index.html` so browsers load the new file.
- Check every layout change at phone width (375px) and tablet width (768px), not only desktop. Also check small phones (320px) and phones held sideways.
- Fonts load from Google Fonts (Roboto 300/400/500, IBM Plex Sans Condensed 400/500). Keep it that way unless told otherwise.
- Accessibility: keep the "Skip to content" link, visible keyboard focus outlines, and the keyboard-friendly photo lightbox (Enter/Space opens, Esc closes). Secondary grey text uses `--ink-2: #6b6b6b` for readable contrast; don't make it lighter.
- New images: WebP, with `loading="lazy" decoding="async"` and a real `alt` text (except the hero image, which loads first).

## Product 3D (collection photos)

Each product photo in "Our collection" has a depth map (`assets/img/depth/<name>-depth.png`, white = near, black = far) linked with `data-depth` on its `<img>`. `assets/js/product-3d.js` uses it to let the bag turn slightly (mouse, finger drag, gentle tilt while scrolling on phones). It is off with "Reduce motion" and falls back to the plain photo without WebGL.

**When a product photo is added or replaced, rebuild its depth map** and add `data-depth` to the `<img>`:

```
bash tools/make-depth.sh <name> <threshold%> <fill|nofill>
```

Product photos must be on the plain #EFEFEF background. Settings used so far (darker bags need a higher threshold; `nofill` keeps gaps such as rope loops or the space inside a strap):

| Photo | Command |
|---|---|
| evapack-studio | `make-depth.sh evapack-studio 8 nofill` |
| evatwo | `make-depth.sh evatwo 8 fill` |
| evapocket-crossbody | `make-depth.sh evapocket-crossbody 8 fill` |
| evaclutch | `make-depth.sh evaclutch 4 fill` |
| eva75 | `make-depth.sh eva75 8 nofill` |
| evabucket | `make-depth.sh evabucket 5 fill` |
| evaori | `make-depth.sh evaori 8 fill` |
| evaori-large | `make-depth.sh evaori-large 4 fill` |

## Publishing zip

`lommer-site.zip` holds only the files the page uses (every `src`, `href` and `data-depth` in `index.html`, plus `og-image.jpg`, `llms.txt`, `robots.txt`). Rebuild it after any change that is meant to be published.

## Intro ("Fold open" loading screen)

`#ldr` at the top of `<body>`, styled in the "Intro" block of `style.css`, run by `assets/js/intro.js`. A small inline script in `<head>` adds the class `intro` to `<html>` only on the first page view of a visit (sessionStorage key `lommer-intro`) and never with "Reduce motion"; without that class the screen is not shown. It lasts at least 2.2 s, waits for the page to load but never more than 6 s, and CSS hides it after 7 s even if the script fails. Keep these safeguards if you change it. Other designs that were tried are kept outside the repo in `~/Desktop/lommer-loaders`.

## Analytics and cookie consent

Google Analytics 4, Measurement ID `G-11KTFZB0KQ` (property "lommer.design - GA4"), set in `assets/js/consent.js`.

- Analytics is **only loaded after the visitor clicks Accept** in the cookie banner (GDPR). Never add the Google tag directly to the HTML.
- The choice is kept in localStorage (`lommer-consent`). "Cookie settings" in the footer (`data-consent-open`) reopens the banner; Decline switches analytics off and deletes the `_ga` cookies.
- On localhost the tag is held back, so testing doesn't add visits to the real property.
- If tracking changes (new tools, new cookies), update `privacy.html` (what is collected, the cookie table, "Last updated").

