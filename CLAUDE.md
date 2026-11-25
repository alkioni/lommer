# Lommer website

One-page static site for Lommer, a product design studio. No build step.

- `index.html`: the whole page (sections: What we do, Client work, Our collection, Featured in, Studio, Contact).
- `style.css`: all styles. Mobile and tablet rules are in the "Mobile & tablet" block at the end (breakpoints 900px and 640px).
- `assets/img/`: images (WebP). `assets/js/main.js`: scroll reveal.
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
