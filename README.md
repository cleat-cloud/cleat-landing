# cleat-landing

Static landing page for [Cleat](https://github.com/puppe1990/cleat-deploy) —
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

## Deploy

```bash
cleat drop . --app cleat
```

Served as a static app at https://cleat.sites.gestaobem.com.
