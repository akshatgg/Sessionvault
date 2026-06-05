# SessionVault — Frontend

The SessionVault documentation / landing site, built with **Next.js (App Router)** and
ready to deploy on **Vercel**.

## Develop

```bash
cd Sessionvault-frontend
npm install
npm run dev          # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel → **New Project** → import the repo.
3. Set **Root Directory** to `Sessionvault-frontend` (since the Next.js app lives in a subfolder).
4. Framework preset auto-detects **Next.js** — no other config needed. Deploy.

After deploy, copy the production URL (e.g. `https://sessionvault.vercel.app`) and set it as
`DOCS_URL` in `../extension/popup.js` so the extension's **📖 Docs** button opens it.

## Structure

```
Sessionvault-frontend/
├── app/
│   ├── layout.js            html shell + metadata + favicon
│   ├── page.js              the docs page (static, server component)
│   ├── DocsInteractions.js  "use client" — copy buttons, scrollspy, mobile nav
│   └── globals.css          dark theme + layout
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── next.config.mjs
└── package.json
```

Content lives in `app/page.js`. Section `id`s must match the sidebar `href`s — `DocsInteractions.js`
relies on that for scrollspy.
