# Cleat landing page — design

Data: 2026-09-20
Status: aprovado (design) — pronto para plano de implementação

## Problema

O Cleat (PaaS self-hosted: painel Phoenix + CLI + servidor MCP) não tem landing
page. Quem chega pelo GitHub não tem uma página clara explicando o que é, quais
runtimes suporta e como se usa.

## Objetivo

Uma landing page estática, em inglês e português (BR), apresentando o Cleat:
o que faz, os runtimes, como o deploy funciona e os três modos de uso
(painel, CLI, MCP). Publicada pelo próprio Cleat como app `static`.

## Decisões (do brainstorming)

- **Projeto novo e separado**: repo `puppe1990/cleat-landing` (público),
  clonado em `~/Desktop/Projetos/cleat/cleat-landing`.
- **Estático puro**: HTML + `styles.css` compilado com a CLI do Tailwind v4 +
  `htmx.min.js` vendorizado localmente. **Sem build no deploy** — é um site
  estático normal.
- **htmx** usado em um lugar que faz sentido num site estático: abas
  (Painel / CLI / MCP) que fazem `hx-get` de parciais estáticas e trocam o
  painel de código sem reload. Estado inicial renderizado no HTML, então
  funciona sem JavaScript.
- **i18n EN + PT-BR sem framework**: páginas separadas (`index.html` em `/`,
  EN como padrão; `pt/index.html` em `/pt/`). Cada idioma é HTML completo com
  `lang` correto e links recíprocos `<link rel="alternate" hreflang>`. O toggle
  é um link simples. Indexável e funciona sem JS.
- **Deploy**: `cleat drop` cria o app static `cleat` no servidor `gestaobem-cx33`
  e publica em `cleat.sites.gestaobem.com` (wildcard `*.sites.gestaobem.com` já
  resolve para o servidor). Caddy serve com SPA fallback; sem systemd.
- **Sem selo linkado** no footer (só o texto "Deployed with Cleat").

## Arquitetura

```
cleat-landing/
  index.html              # EN (padrao)
  pt/index.html           # PT-BR
  partials/
    panel.html            # fragmento da aba Painel (EN)
    cli.html
    mcp.html
  pt/partials/
    panel.html            # fragmentos PT-BR
    cli.html
    mcp.html
  assets/
    styles.css            # Tailwind compilado (commitado)
    htmx.min.js           # vendorizado (commitado)
  src/
    input.css             # fonte Tailwind (@import "tailwindcss" + @source)
  package.json            # scripts: build:css
  .github/workflows/ci.yml# build do CSS + checagem de links/arquivos
  README.md
```

CI: um workflow que roda o build do Tailwind e falha se `assets/styles.css`
estiver desatualizado (garante que o CSS commitado bate com o `input.css`), e
valida que as 6 parciais e as duas páginas existem.

- `styles.css` e `htmx.min.js` são **commitados**; o deploy não roda build.
- `src/input.css` usa Tailwind v4:
  `@import "tailwindcss";` + `@source "../index.html"; @source "../pt";`
- Os fragmentos de aba são HTML sem `<html>`/`<head>` (só o miolo que o htmx
  injeta), com as classes Tailwind já presentes no `@source`.

## Conteúdo da página

Seções, na ordem, iguais em EN e PT-BR:

1. **Hero** — nome "Cleat", tagline "Self-hosted PaaS over SSH", três badges
   (Painel · CLI · MCP) e dois CTAs: GitHub (`cleat-deploy`) e "Get started"
   (âncora para a seção de uso).
2. **Runtimes** — grid com Phoenix/Elixir (release OTP), Go (binários Cais),
   Node (Next.js / TanStack Start), Ruby on Rails (Puma), Static (Caddy).
   Cada card: nome + uma linha do que o deploy faz.
3. **How it works** — 4 passos: `git push` → webhook HMAC → build on the VM via
   SSH → publish release + systemd/Caddy.
4. **Three ways to use it** — o bloco com **htmx**: abas Painel / CLI / MCP.
   - Painel: "register a VM, link a repo, click Deploy".
   - CLI: `cleat login`, `cleat deploy lumina --watch`, `cleat logs 42`.
   - MCP: `claude mcp add cleat -- cleat mcp` (+ codex/grok).
   Cada aba aponta para uma parcial; estado inicial = aba Painel.
5. **Features** — 6 cards: webhooks HMAC, fila Oban, build logs ao vivo,
   env vars criptografadas, disk/mem do servidor, MCP embutido.
6. **Footer** — links para `cleat-deploy` e `cleat-cli`, toggle de idioma e
   "Deployed with Cleat".

## i18n

- `index.html` (EN): `<html lang="en">`, alternates:
  `<link rel="alternate" hreflang="en" href="https://cleat.sites.gestaobem.com/">`
  e `hreflang="pt-BR" href=".../pt/"`; toggle para `/pt/`.
- `pt/index.html`: `<html lang="pt-BR">`, alternates recíprocos; toggle para `/`.
- `x-default` aponta para a versão EN.
- Textos são escritos direto em cada arquivo (sem dicionário JS).
- Os fragmentos das abas são duplicados por idioma; o código dentro deles é
  idêntico, só os rótulos mudam.

## Estilo / UX

- Dark theme (combina com o painel), com gradiente sutil no hero.
- Tipografia forte, espaçamento generoso, grid responsivo mobile-first.
- Microinterações: hover nos cards, transição de opacidade/cor nas abas ativas,
  botões com leve elevação. Transições via classes Tailwind.
- Acessibilidade: abas como `role="tablist"`/`role="tab"` com `aria-selected`
  atualizado pelo htmx (`hx-on`), foco visível, contraste adequado, `alt`/`aria`
  onde couber.

## Deploy

```bash
cleat drop ./cleat-landing \
  --server 5 \
  --host cleat.sites.gestaobem.com \
  --slug cleat
```

Isso cria o app static `cleat` (runtime `static`) e publica o conteúdo. O htmx
busca `partials/*.html` no mesmo host; o SPA fallback do Caddy
(`try_files {path} /index.html`) não interfere porque as parciais são arquivos
reais.

## Verificação

- `npm run build:css` gera `assets/styles.css` sem erro.
- `index.html` e `pt/index.html` abrem e contêm as 6 seções; os links hreflang
  são recíprocos e válidos.
- As 6 parciais existem e são servidas (200) no host final.
- Smoke HTTP: `GET https://cleat.sites.gestaobem.com/` → 200; `/pt/` → 200.
- Toggle de idioma navega entre `/` e `/pt/`.
- Abas trocam sem reload com JS; sem JS, a aba inicial aparece.
- O CI falha se o `assets/styles.css` commitado divergir do build.

## Fora de escopo

- Formulário / captura de leads.
- Demo live chamando o painel.
- Mais idiomas além de EN e PT-BR.
- Blog, docs completos, changelog.
- Selo "Deployed with Cleat" linkado.

## Critério de sucesso

1. A landing está no ar em `https://cleat.sites.gestaobem.com` (EN) e `/pt/`
   (PT-BR), servida como app `static` do Cleat.
2. htmx alterna as três abas sem reload e o conteúdo aparece sem JS.
3. Nenhum build acontece no deploy (só arquivos estáticos), e o CSS commitado
   está sempre em sincronia com a fonte (garantido pelo CI).
