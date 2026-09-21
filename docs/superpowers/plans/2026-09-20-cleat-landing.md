# Cleat Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, bilingual (EN/PT-BR) landing page for Cleat using htmx and a committed Tailwind build, then publish it with `cleat drop` as a static app at `cleat.sites.gestaobem.com`.

**Architecture:** A plain static site — no server, no runtime build. `assets/styles.css` is generated once by the Tailwind CLI and committed; `assets/htmx.min.js` is vendored. Two full HTML pages (`/` EN, `/pt/` PT-BR) share a visual layout; the Panel/CLI/MCP tabs swap static HTML fragments via htmx `hx-get`, with the initial tab rendered inline so it works without JS.

**Tech Stack:** HTML, Tailwind CSS v4 (CLI, output committed), htmx 2.0.4 (vendored), GitHub Actions (CSS-in-sync check), `cleat` CLI for deploy.

---

## File structure

```
cleat-landing/
  index.html                 # EN page (default)
  pt/index.html              # PT-BR page
  partials/panel.html        # tab fragment (EN)
  partials/cli.html          # tab fragment (EN)
  partials/mcp.html          # tab fragment (EN)
  pt/partials/panel.html     # tab fragment (PT-BR)
  pt/partials/cli.html       # tab fragment (PT-BR)
  pt/partials/mcp.html       # tab fragment (PT-BR)
  assets/styles.css          # Tailwind output (committed)
  assets/htmx.min.js         # htmx 2.0.4 (committed)
  src/input.css              # Tailwind source
  package.json               # build:css script
  .github/workflows/ci.yml   # CSS-in-sync + required files
  .gitignore
  README.md
```

The working directory is `/Users/matheuspuppe/Desktop/Projetos/cleat/cleat-landing` on branch `feat/landing`. The repo `puppe1990/cleat-landing` already exists as the remote and the design doc is committed.

Note on Tailwind: the global `tailwindcss` binary is **v4.3.2** and is invoked as `tailwindcss -i src/input.css -o assets/styles.css --minify`. The npm script uses `npx @tailwindcss/cli@4` for portability.

---

## Task 1: Project scaffold and Tailwind build

**Files:**
- Create: `package.json`
- Create: `src/input.css`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cleat-landing",
  "version": "1.0.0",
  "private": true,
  "description": "Landing page for Cleat — self-hosted PaaS (htmx + Tailwind, EN/PT-BR)",
  "scripts": {
    "build:css": "npx --yes @tailwindcss/cli@4 -i src/input.css -o assets/styles.css --minify",
    "check:css": "npx --yes @tailwindcss/cli@4 -i src/input.css -o /tmp/cleat-landing-check.css --minify && diff -q /tmp/cleat-landing-check.css assets/styles.css"
  }
}
```

- [ ] **Step 2: Create `src/input.css`**

```css
@import "tailwindcss";

@source "../index.html";
@source "../pt";
@source "../partials";

@theme {
  --color-cleat-bg: #0b0f14;
  --color-cleat-surface: #131a22;
  --color-cleat-border: #22303c;
  --color-cleat-accent: #38bdf8;
  --color-cleat-accent-strong: #0ea5e9;
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", "JetBrains Mono", Menlo, monospace;
}
```

- [ ] **Step 3: Create `.gitignore`**

```
/tmp/
.DS_Store
node_modules/
```

- [ ] **Step 4: Create `README.md`**

```markdown
# cleat-landing

Static landing page for [Cleat](https://github.com/puppe1990/cleat-deploy) —
a self-hosted PaaS. Built with htmx and Tailwind CSS, bilingual (EN / PT-BR).

## Edit

Content lives in `index.html` (EN) and `pt/index.html` (PT-BR). Tab fragments
live in `partials/` and `pt/partials/`.

## Build the CSS

`assets/styles.css` is committed; the deploy runs no build. After changing
markup or `src/input.css`, regenerate and commit it:

```bash
npm run build:css
```

`npm run check:css` fails if the committed CSS is out of sync.

## Deploy

```bash
cleat drop . --app cleat
```

Served as a static app at https://cleat.sites.gestaobem.com.
```

- [ ] **Step 5: Write the first page stub so Tailwind has something to scan, then build**

Create `index.html` with a minimal stub:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cleat</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body class="bg-cleat-bg text-slate-100 font-sans">
  <h1 class="text-4xl font-bold">Cleat</h1>
</body>
</html>
```

Run: `npm run build:css`
Expected: creates `assets/styles.css` (non-empty, contains `.bg-cleat-bg`).

- [ ] **Step 6: Commit**

```bash
git add package.json src/input.css .gitignore README.md index.html assets/styles.css
git commit -m "chore: scaffold the landing and build the first Tailwind css"
```

---

## Task 2: Vendor htmx

**Files:**
- Create: `assets/htmx.min.js`

- [ ] **Step 1: Download htmx 2.0.4**

Run:

```bash
curl -sL -o assets/htmx.min.js https://unpkg.com/htmx.org@2.0.4/dist/htmx.min.js
```

Then verify:

```bash
head -c 15 assets/htmx.min.js
```

Expected: starts with `var htmx=function(`. Confirm the file is about 50 KB:

```bash
wc -c assets/htmx.min.js
```

Expected: a number near `50917`.

- [ ] **Step 2: Commit**

```bash
git add assets/htmx.min.js
git commit -m "chore: vendor htmx 2.0.4"
```

---

## Task 3: English page (full layout)

**Files:**
- Modify: `index.html` (replace the stub)
- Create: `partials/panel.html`
- Create: `partials/cli.html`
- Create: `partials/mcp.html`

- [ ] **Step 1: Create the three English tab fragments**

`partials/panel.html` (a fragment: no `<html>`/`<head>`, only the panel body). Use this exact content:

```html
<div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
  <p class="mb-4 text-sm text-slate-400">
    Register a VM, link a repo, click Deploy. Cleat provisions Caddy and a
    systemd unit for you.
  </p>
  <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code># register the server once
cleat servers create --name my-vps --ip 203.0.113.10 --ssh-key-file ~/.ssh/id_ed25519

# link the repo and deploy
cleat deploy --repo owner/app --server my-vps --host app.example.com --watch</code></pre>
</div>
```

`partials/cli.html`:

```html
<div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
  <p class="mb-4 text-sm text-slate-400">
    One binary. Deploy, tail build logs, manage env vars, all from the terminal.
  </p>
  <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code>cleat login --panel https://paas.example.com
cleat deploy lumina --watch
cleat logs 42 --follow
cleat env set lumina DATABASE_FILE=/var/lib/lumina/lumina.db --deploy</code></pre>
</div>
```

`partials/mcp.html`:

```html
<div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
  <p class="mb-4 text-sm text-slate-400">
    Run the CLI as a Model Context Protocol server, so coding agents deploy and
    inspect apps as native tools.
  </p>
  <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code>claude mcp add cleat -- cleat mcp
codex  mcp add cleat -- cleat mcp
grok   mcp add cleat -- cleat mcp</code></pre>
</div>
```

- [ ] **Step 2: Replace `index.html` with the full English page**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cleat — self-hosted PaaS over SSH</title>
  <meta name="description" content="Deploy Phoenix, Go, Node, Rails and static apps to your own servers over SSH, with GitHub push-to-deploy. Panel, CLI and MCP.">
  <link rel="canonical" href="https://cleat.sites.gestaobem.com/">
  <link rel="alternate" hreflang="en" href="https://cleat.sites.gestaobem.com/">
  <link rel="alternate" hreflang="pt-BR" href="https://cleat.sites.gestaobem.com/pt/">
  <link rel="alternate" hreflang="x-default" href="https://cleat.sites.gestaobem.com/">
  <link rel="stylesheet" href="/assets/styles.css">
  <script src="/assets/htmx.min.js" defer></script>
</head>
<body class="bg-cleat-bg text-slate-100 font-sans antialiased">

  <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
    <a href="/" class="text-lg font-semibold tracking-tight">Cleat</a>
    <nav class="flex items-center gap-4 text-sm">
      <a href="https://github.com/puppe1990/cleat-deploy" class="text-slate-300 transition-colors hover:text-white">GitHub</a>
      <a href="/pt/" class="rounded-md border border-cleat-border px-3 py-1 text-slate-300 transition-colors hover:border-cleat-accent hover:text-white">PT</a>
    </nav>
  </header>

  <section class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(56,189,248,0.18),transparent)]"></div>
    <div class="relative mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
      <span class="inline-flex items-center rounded-full border border-cleat-border bg-cleat-surface/60 px-3 py-1 text-xs text-slate-300">
        Self-hosted PaaS over SSH
      </span>
      <h1 class="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        Deploy to your own servers.
        <span class="text-cleat-accent">Not to someone else&rsquo;s.</span>
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
        Cleat is a control panel, a CLI and an MCP server for deploying
        Phoenix, Go, Node, Rails and static apps over SSH — with GitHub
        push-to-deploy.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href="#use" class="rounded-lg bg-cleat-accent-strong px-5 py-2.5 font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-cleat-accent">
          Get started
        </a>
        <a href="https://github.com/puppe1990/cleat-deploy" class="rounded-lg border border-cleat-border px-5 py-2.5 font-medium text-slate-200 transition-colors hover:border-cleat-accent hover:text-white">
          View on GitHub
        </a>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-6 py-16">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Runtimes</h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Phoenix / Elixir</h3>
        <p class="mt-1 text-sm text-slate-400">OTP release, migrations and systemd unit.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Go</h3>
        <p class="mt-1 text-sm text-slate-400">Cais binaries, built on the VM.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Node</h3>
        <p class="mt-1 text-sm text-slate-400">Next.js and TanStack Start, self-contained Nitro output.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Ruby on Rails</h3>
        <p class="mt-1 text-sm text-slate-400">Puma behind Caddy, assets and DB prep.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Static</h3>
        <p class="mt-1 text-sm text-slate-400">Pure HTML/CSS/JS served by Caddy. No git needed.</p>
      </article>
    </div>
  </section>

  <section class="border-y border-cleat-border bg-black/20">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">How it works</h2>
      <ol class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">01</span>
          <h3 class="mt-2 font-semibold">git push</h3>
          <p class="mt-1 text-sm text-slate-400">Push to the linked branch.</p>
        </li>
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">02</span>
          <h3 class="mt-2 font-semibold">Webhook</h3>
          <p class="mt-1 text-sm text-slate-400">HMAC-verified, queued with Oban.</p>
        </li>
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">03</span>
          <h3 class="mt-2 font-semibold">Build on the VM</h3>
          <p class="mt-1 text-sm text-slate-400">Cloned and built over SSH.</p>
        </li>
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">04</span>
          <h3 class="mt-2 font-semibold">Publish</h3>
          <p class="mt-1 text-sm text-slate-400">Release, systemd and Caddy.</p>
        </li>
      </ol>
    </div>
  </section>

  <section id="use" class="mx-auto max-w-6xl px-6 py-16">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Three ways to use it</h2>
    <div class="mt-6" hx-target="#use-panel" hx-swap="innerHTML">
      <div class="flex gap-2" role="tablist" aria-label="Ways to use Cleat">
        <button role="tab" aria-selected="true" data-tab="panel"
                class="rounded-lg border border-cleat-accent bg-cleat-surface px-4 py-2 text-sm font-medium text-white"
                hx-get="/partials/panel.html">Panel</button>
        <button role="tab" aria-selected="false" data-tab="cli"
                class="rounded-lg border border-cleat-border px-4 py-2 text-sm font-medium text-slate-300 hover:border-cleat-accent hover:text-white"
                hx-get="/partials/cli.html">CLI</button>
        <button role="tab" aria-selected="false" data-tab="mcp"
                class="rounded-lg border border-cleat-border px-4 py-2 text-sm font-medium text-slate-300 hover:border-cleat-accent hover:text-white"
                hx-get="/partials/mcp.html">MCP</button>
      </div>
      <div id="use-panel" class="mt-4">
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
          <p class="mb-4 text-sm text-slate-400">
            Register a VM, link a repo, click Deploy. Cleat provisions Caddy and a
            systemd unit for you.
          </p>
          <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code># register the server once
cleat servers create --name my-vps --ip 203.0.113.10 --ssh-key-file ~/.ssh/id_ed25519

# link the repo and deploy
cleat deploy --repo owner/app --server my-vps --host app.example.com --watch</code></pre>
        </div>
      </div>
    </div>
  </section>

  <section class="border-t border-cleat-border bg-black/20">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Features</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">GitHub webhooks</h3><p class="mt-1 text-sm text-slate-400">HMAC-verified push-to-deploy.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Oban queue</h3><p class="mt-1 text-sm text-slate-400">Background deploys, one per host.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Live build logs</h3><p class="mt-1 text-sm text-slate-400">Watch the terminal as it builds.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Encrypted env vars</h3><p class="mt-1 text-sm text-slate-400">Written to the server on deploy.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Disk &amp; memory</h3><p class="mt-1 text-sm text-slate-400">Per-server usage on the dashboard.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">MCP built in</h3><p class="mt-1 text-sm text-slate-400">Agents deploy without a shell.</p></div>
      </div>
    </div>
  </section>

  <footer class="border-t border-cleat-border">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <p>Deployed with Cleat.</p>
      <nav class="flex gap-4">
        <a href="https://github.com/puppe1990/cleat-deploy" class="transition-colors hover:text-white">cleat-deploy</a>
        <a href="https://github.com/puppe1990/cleat-cli" class="transition-colors hover:text-white">cleat-cli</a>
        <a href="/pt/" class="transition-colors hover:text-white">Português</a>
      </nav>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 3: Rebuild the CSS and verify the new classes are present**

Run: `npm run build:css`
Expected: `assets/styles.css` contains `.bg-cleat-bg`, `.text-cleat-accent`, `.rounded-xl`.

- [ ] **Step 4: Commit**

```bash
git add index.html partials assets/styles.css
git commit -m "feat: build the English landing page with htmx tabs"
```

---

## Task 4: Portuguese page and fragments

**Files:**
- Create: `pt/index.html`
- Create: `pt/partials/panel.html`
- Create: `pt/partials/cli.html`
- Create: `pt/partials/mcp.html`

- [ ] **Step 1: Create the three PT-BR tab fragments**

`pt/partials/panel.html`:

```html
<div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
  <p class="mb-4 text-sm text-slate-400">
    Cadastre uma VM, vincule um repositório, clique em Deploy. O Cleat provisiona
    o Caddy e a unit do systemd para você.
  </p>
  <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code># cadastre o servidor uma vez
cleat servers create --name meu-vps --ip 203.0.113.10 --ssh-key-file ~/.ssh/id_ed25519

# vincule o repositório e faça o deploy
cleat deploy --repo owner/app --server meu-vps --host app.example.com --watch</code></pre>
</div>
```

`pt/partials/cli.html`:

```html
<div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
  <p class="mb-4 text-sm text-slate-400">
    Um binário só. Deploy, logs de build, variáveis de ambiente — tudo no terminal.
  </p>
  <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code>cleat login --panel https://paas.example.com
cleat deploy lumina --watch
cleat logs 42 --follow
cleat env set lumina DATABASE_FILE=/var/lib/lumina/lumina.db --deploy</code></pre>
</div>
```

`pt/partials/mcp.html`:

```html
<div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
  <p class="mb-4 text-sm text-slate-400">
    Rode o CLI como servidor Model Context Protocol e os agentes fazem deploy e
    inspecionam apps como ferramentas nativas.
  </p>
  <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code>claude mcp add cleat -- cleat mcp
codex  mcp add cleat -- cleat mcp
grok   mcp add cleat -- cleat mcp</code></pre>
</div>
```

- [ ] **Step 2: Create `pt/index.html`**

Same structure as the English page with translated copy, `lang="pt-BR"`, PT-BR
`hreflang` links, the language toggle pointing to `/`, and `hx-get` pointing at
the `pt/partials/` fragments. Use this exact file:

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cleat — PaaS self-hosted via SSH</title>
  <meta name="description" content="Faça deploy de apps Phoenix, Go, Node, Rails e estáticos nos seus próprios servidores via SSH, com push-to-deploy do GitHub. Painel, CLI e MCP.">
  <link rel="canonical" href="https://cleat.sites.gestaobem.com/pt/">
  <link rel="alternate" hreflang="en" href="https://cleat.sites.gestaobem.com/">
  <link rel="alternate" hreflang="pt-BR" href="https://cleat.sites.gestaobem.com/pt/">
  <link rel="alternate" hreflang="x-default" href="https://cleat.sites.gestaobem.com/">
  <link rel="stylesheet" href="/assets/styles.css">
  <script src="/assets/htmx.min.js" defer></script>
</head>
<body class="bg-cleat-bg text-slate-100 font-sans antialiased">

  <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
    <a href="/pt/" class="text-lg font-semibold tracking-tight">Cleat</a>
    <nav class="flex items-center gap-4 text-sm">
      <a href="https://github.com/puppe1990/cleat-deploy" class="text-slate-300 transition-colors hover:text-white">GitHub</a>
      <a href="/" class="rounded-md border border-cleat-border px-3 py-1 text-slate-300 transition-colors hover:border-cleat-accent hover:text-white">EN</a>
    </nav>
  </header>

  <section class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(56,189,248,0.18),transparent)]"></div>
    <div class="relative mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
      <span class="inline-flex items-center rounded-full border border-cleat-border bg-cleat-surface/60 px-3 py-1 text-xs text-slate-300">
        PaaS self-hosted via SSH
      </span>
      <h1 class="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        Deploy nos seus servidores.
        <span class="text-cleat-accent">Não nos de outra pessoa.</span>
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
        O Cleat é um painel, um CLI e um servidor MCP para fazer deploy de apps
        Phoenix, Go, Node, Rails e estáticos via SSH — com push-to-deploy do GitHub.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a href="#use" class="rounded-lg bg-cleat-accent-strong px-5 py-2.5 font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-cleat-accent">
          Começar
        </a>
        <a href="https://github.com/puppe1990/cleat-deploy" class="rounded-lg border border-cleat-border px-5 py-2.5 font-medium text-slate-200 transition-colors hover:border-cleat-accent hover:text-white">
          Ver no GitHub
        </a>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-6 py-16">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Runtimes</h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Phoenix / Elixir</h3>
        <p class="mt-1 text-sm text-slate-400">Release OTP, migrations e unit do systemd.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Go</h3>
        <p class="mt-1 text-sm text-slate-400">Binários Cais, compilados na VM.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Node</h3>
        <p class="mt-1 text-sm text-slate-400">Next.js e TanStack Start, saída Nitro autossuficiente.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Ruby on Rails</h3>
        <p class="mt-1 text-sm text-slate-400">Puma atrás do Caddy, assets e preparo do banco.</p>
      </article>
      <article class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5 transition-colors hover:border-cleat-accent/60">
        <h3 class="font-semibold">Estático</h3>
        <p class="mt-1 text-sm text-slate-400">HTML/CSS/JS puro servido pelo Caddy. Sem git.</p>
      </article>
    </div>
  </section>

  <section class="border-y border-cleat-border bg-black/20">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Como funciona</h2>
      <ol class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">01</span>
          <h3 class="mt-2 font-semibold">git push</h3>
          <p class="mt-1 text-sm text-slate-400">Push na branch vinculada.</p>
        </li>
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">02</span>
          <h3 class="mt-2 font-semibold">Webhook</h3>
          <p class="mt-1 text-sm text-slate-400">Verificado por HMAC, enfileirado no Oban.</p>
        </li>
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">03</span>
          <h3 class="mt-2 font-semibold">Build na VM</h3>
          <p class="mt-1 text-sm text-slate-400">Clonado e compilado via SSH.</p>
        </li>
        <li class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5">
          <span class="text-cleat-accent font-mono text-sm">04</span>
          <h3 class="mt-2 font-semibold">Publicar</h3>
          <p class="mt-1 text-sm text-slate-400">Release, systemd e Caddy.</p>
        </li>
      </ol>
    </div>
  </section>

  <section id="use" class="mx-auto max-w-6xl px-6 py-16">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Três formas de usar</h2>
    <div class="mt-6" hx-target="#use-panel" hx-swap="innerHTML">
      <div class="flex gap-2" role="tablist" aria-label="Formas de usar o Cleat">
        <button role="tab" aria-selected="true" data-tab="panel"
                class="rounded-lg border border-cleat-accent bg-cleat-surface px-4 py-2 text-sm font-medium text-white"
                hx-get="/pt/partials/panel.html">Painel</button>
        <button role="tab" aria-selected="false" data-tab="cli"
                class="rounded-lg border border-cleat-border px-4 py-2 text-sm font-medium text-slate-300 hover:border-cleat-accent hover:text-white"
                hx-get="/pt/partials/cli.html">CLI</button>
        <button role="tab" aria-selected="false" data-tab="mcp"
                class="rounded-lg border border-cleat-border px-4 py-2 text-sm font-medium text-slate-300 hover:border-cleat-accent hover:text-white"
                hx-get="/pt/partials/mcp.html">MCP</button>
      </div>
      <div id="use-panel" class="mt-4">
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/60 p-5">
          <p class="mb-4 text-sm text-slate-400">
            Cadastre uma VM, vincule um repositório, clique em Deploy. O Cleat provisiona
            o Caddy e a unit do systemd para você.
          </p>
          <pre class="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-sm text-slate-200"><code># cadastre o servidor uma vez
cleat servers create --name meu-vps --ip 203.0.113.10 --ssh-key-file ~/.ssh/id_ed25519

# vincule o repositório e faça o deploy
cleat deploy --repo owner/app --server meu-vps --host app.example.com --watch</code></pre>
        </div>
      </div>
    </div>
  </section>

  <section class="border-t border-cleat-border bg-black/20">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-500">Recursos</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Webhooks do GitHub</h3><p class="mt-1 text-sm text-slate-400">Push-to-deploy verificado por HMAC.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Fila Oban</h3><p class="mt-1 text-sm text-slate-400">Deploys em background, um por host.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Logs de build ao vivo</h3><p class="mt-1 text-sm text-slate-400">Acompanhe o terminal enquanto compila.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Env vars criptografadas</h3><p class="mt-1 text-sm text-slate-400">Gravadas no servidor no deploy.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">Disco e memória</h3><p class="mt-1 text-sm text-slate-400">Uso por servidor no dashboard.</p></div>
        <div class="rounded-xl border border-cleat-border bg-cleat-surface/40 p-5"><h3 class="font-semibold">MCP embutido</h3><p class="mt-1 text-sm text-slate-400">Agentes fazem deploy sem shell.</p></div>
      </div>
    </div>
  </section>

  <footer class="border-t border-cleat-border">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <p>Deployed with Cleat.</p>
      <nav class="flex gap-4">
        <a href="https://github.com/puppe1990/cleat-deploy" class="transition-colors hover:text-white">cleat-deploy</a>
        <a href="https://github.com/puppe1990/cleat-cli" class="transition-colors hover:text-white">cleat-cli</a>
        <a href="/" class="transition-colors hover:text-white">English</a>
      </nav>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 3: Rebuild the CSS**

Run: `npm run build:css`
Expected: `assets/styles.css` unchanged in content (same classes) — but rebuild and confirm no error.

- [ ] **Step 4: Commit**

```bash
git add pt assets/styles.css
git commit -m "feat: add the Portuguese landing page"
```

---

## Task 5: Tab highlighting without manual JS

**Files:**
- Modify: `index.html` (tab buttons)
- Modify: `pt/index.html` (tab buttons)

- [ ] **Step 1: Add htmx tab-state handling to the English tabs**

In `index.html`, add `hx-on::after-request` to the `#use` wrapper so the active
tab gets the accent border and `aria-selected="true"`. Replace the opening
`<div class="mt-6" hx-target="#use-panel" hx-swap="innerHTML">` with:

```html
    <div class="mt-6" hx-target="#use-panel" hx-swap="innerHTML"
         hx-on::after-request="document.querySelectorAll('[role=tab]').forEach(t=>{const on=t===event.target;t.setAttribute('aria-selected',on);t.classList.toggle('border-cleat-accent',on);t.classList.toggle('bg-cleat-surface',on);t.classList.toggle('text-white',on);t.classList.toggle('border-cleat-border',!on);t.classList.toggle('text-slate-300',!on);});">
```

- [ ] **Step 2: Apply the identical wrapper to `pt/index.html`**

Replace the opening `<div class="mt-6" hx-target="#use-panel" hx-swap="innerHTML">`
in `pt/index.html` with the same block shown in Step 1.

- [ ] **Step 3: Rebuild CSS**

Run: `npm run build:css`
Expected: no error; output includes the tab state classes (they are already in the fragments/pages).

- [ ] **Step 4: Commit**

```bash
git add index.html pt/index.html assets/styles.css
git commit -m "feat: keep the active tab highlighted after an htmx swap"
```

---

## Task 6: CI — CSS in sync and required files

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build the CSS
        run: npx --yes @tailwindcss/cli@4 -i src/input.css -o /tmp/styles.css --minify

      - name: CSS must be committed and in sync
        run: diff -u assets/styles.css /tmp/styles.css

      - name: Required files exist
        run: |
          for f in index.html pt/index.html assets/htmx.min.js \
                   partials/panel.html partials/cli.html partials/mcp.html \
                   pt/partials/panel.html pt/partials/cli.html pt/partials/mcp.html; do
            test -s "$f" || { echo "missing or empty: $f"; exit 1; }
          done
```

- [ ] **Step 2: Run the CSS sync check locally**

Run: `npm run check:css`
Expected: exits 0 (no diff).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: verify the committed css is in sync and files exist"
```

---

## Task 7: Deploy with `cleat drop`

**Files:**
- Modify: `README.md` (add the live URL)

- [ ] **Step 1: Confirm the CLI is authenticated and find the server id**

Run:

```bash
cleat whoami
cleat servers list
```

Expected: an authenticated user and a server list including `gestaobem-cx33`
(id `5`). If the id differs, use the one shown.

- [ ] **Step 2: Publish the site**

Run:

```bash
cleat drop . --server 5 --host cleat.sites.gestaobem.com --slug cleat --watch
```

Expected: the command registers the static app `cleat` (if needed) and streams
the deploy log ending in `Deployment successful — live at https://cleat.sites.gestaobem.com`.

- [ ] **Step 3: Smoke test the deployment**

Run:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://cleat.sites.gestaobem.com/
curl -s -o /dev/null -w "%{http_code}\n" https://cleat.sites.gestaobem.com/pt/
curl -s -o /dev/null -w "%{http_code}\n" https://cleat.sites.gestaobem.com/partials/cli.html
curl -s https://cleat.sites.gestaobem.com/ | grep -c "cleat.sites.gestaobem.com/pt/"
```

Expected: three `200`s and a non-zero count for the hreflang link (verifies the
HTML was served). If the app is not registered as `static`, fix with
`cleat apps update cleat --runtime static` and re-run the drop.

- [ ] **Step 4: Record the URL in the README**

Add under the Deploy section of `README.md`:

```markdown
Live: https://cleat.sites.gestaobem.com (EN) · https://cleat.sites.gestaobem.com/pt/ (PT-BR)
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: point the readme at the live landing"
```

---

## Task 8: Push the repository

**Files:** none

- [ ] **Step 1: Push the branch**

Run:

```bash
git push -u origin feat/landing
```

Expected: the branch is pushed to `puppe1990/cleat-landing` and the CI workflow starts.

- [ ] **Step 2: Verify CI**

Run:

```bash
gh run list --repo puppe1990/cleat-landing --limit 3
```

Expected: a run for `feat/landing` that completes `success` (check with
`gh run watch` if it is still in progress).

- [ ] **Step 3: Report**

Report the PR/compare URL and the live URL. Do not merge unless asked.

---

## Self-review notes

- **Spec coverage:** Goal (Task 3-4), runtimes/how-it-works/features sections (Task 3-4), htmx tabs + no-JS fallback (Tasks 3-5), EN/PT-BR with hreflang (Task 4), committed Tailwind (Task 1, guarded by Task 6), vendored htmx (Task 2), deploy as static app at the agreed host (Task 7), CI CSS-in-sync (Task 6), README (Tasks 1, 7), push (Task 8).
- **Placeholder scan:** no TBD/TODO; every code step contains the full file or snippet and exact commands.
- **Consistency:** the tab wrapper id `#use-panel`, the `hx-get` paths (`/partials/*.html`, `/pt/partials/*.html`), the Tailwind theme colors (`cleat-bg`, `cleat-surface`, `cleat-border`, `cleat-accent`, `cleat-accent-strong`), and the htmx version (`2.0.4`) are used identically across tasks.
- **Known deviation:** the spec described a language toggle as a simple link; implemented as a header link (`PT` / `EN`) plus a footer link, which satisfies it.
- **Out of scope preserved:** no lead capture, no live demo, no extra languages.
