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

## Deploy

```bash
cleat drop . --app cleat
```

Served as a static app at https://cleat.sites.gestaobem.com.

There is **no linked git repo and no push-to-deploy**: the static app `cleat`
was created with `cleat drop`, so every content change must be published with
the command above (run `npm run build:css` and commit first if the markup
changed).

Live: https://cleat.sites.gestaobem.com (EN) · https://cleat.sites.gestaobem.com/pt/ (PT-BR)
