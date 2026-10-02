# cleat-landing

Static landing page for [Cleat](https://github.com/cleat-cloud/cleat-deploy) —
a self-hosted PaaS. Built with htmx and Tailwind CSS, bilingual (EN / PT-BR).

## Edit

Content lives in `index.html` (EN) and `pt/index.html` (PT-BR). Tab fragments
live in `partials/` and `pt/partials/`.

## Build the CSS

`assets/styles.css` is committed; the deploy runs no build. Install the pinned
Tailwind once, then regenerate and commit the CSS after changing markup or
`src/input.css`:

```bash
npm install
npm run build:css
```

`npm run check:css` fails if the committed CSS is out of sync.

CI also validates HTML (`npm run check:html`), checks that internal `href`/`src`/`hx-get` targets exist (`npm run check:links`), and runs Playwright smoke tests for `index.html` and `pt/index.html` plus a WCAG A/AA axe scan (`npm run test:smoke`). Chromium install adds about a minute on GitHub Actions.

## Deploy

Merges to `main` publish automatically (`cleat drop . --app cleat --watch`)
after CI (`npm ci`, `check:css` with Tailwind 4.3.3, HTML/link checks, smoke).
Repo secrets: `CLEAT_PANEL_URL` (https://paas.gestaobem.com) and `CLEAT_TOKEN`.

Emergency / local:

```bash
npm ci
npm run build:css   # only if markup or src/input.css changed; then commit the CSS
cleat drop . --app cleat --watch
```

Rollback: revert the merge on `main` and push (the deploy job republishes), or
check out the last good commit and run the local drop command.

Live: https://cleat.sites.gestaobem.com (EN) · https://cleat.sites.gestaobem.com/pt/ (PT-BR)
