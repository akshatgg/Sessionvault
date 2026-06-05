<div align="center">
  <img src="Sessionvault-frontend/public/logo.svg" width="84" height="84" alt="SessionVault logo" />
  <h1>SessionVault</h1>
  <p><strong>Capture sessions. Store them safely. Reuse anywhere.</strong></p>
</div>

---

SessionVault captures a browser tab's **cookies + localStorage** and exports them in
Playwright [`storageState`](https://playwright.dev/docs/auth) format — so you can reuse a
logged-in session in automated tests, sync it to another browser, or POST it to your own API.

**No server. No database. Nothing stored.** The extension copies, downloads, or sends the
capture to an endpoint *you* control — and that's it.

## What's inside

```
sessionvault/
├── extension/              Cross-browser MV3 extension — captures & exports the session
├── Sessionvault-frontend/  Next.js docs / landing site (deploy on Vercel)
└── README.md
```

| Component | Stack | Purpose |
|---|---|---|
| [`extension/`](extension) | Manifest V3 (Chrome/Edge/Brave/Firefox) | Capture cookies + localStorage → copy / download / POST |
| [`Sessionvault-frontend/`](Sessionvault-frontend) | Next.js (App Router) | Documentation site, deployable on Vercel |

## Quickstart

**1. Load the extension**

- Chrome/Edge/Brave: `chrome://extensions` → Developer mode → **Load unpacked** → pick `extension/`
- Firefox: `about:debugging` → **Load Temporary Add-on** → pick `extension/manifest.json`

**2. Export a session**

Open a site you're logged into → click the toolbar icon → tick Cookies / localStorage → choose:
- **Copy to clipboard** or **Download `storageState.json`** (no setup needed), or
- **POST to API** — set your endpoint URL + API key in *API settings* first.

**3. Run / deploy the docs site**

```bash
cd Sessionvault-frontend && npm install && npm run dev   # http://localhost:3000
```

Deploy on Vercel with **Root Directory = `Sessionvault-frontend`**. After deploy, set the
production URL as `DOCS_URL` in `extension/popup.js` so the **📖 Docs** button opens it.

## How it works

```
 BROWSER (extension)                          YOUR ENDPOINT  (you build this)
   capture cookies + localStorage
   → storageState JSON
   POST https://your-app.com/…  ──────────►   1. check the API key
   x-api-key: sv_…  (your key)                 2. read { url, capturedAt, storageState }
   ◄──────────────────────────────────────    3. use it / 200 OK

 The extension stores nothing — the capture exists only in this one request.
```

There is **no SessionVault backend**. The API key is a secret *you* create, store on your
endpoint, and paste into the extension; your endpoint verifies it. Full guide + example
receivers (Express / FastAPI) in [`docs`](docs).

## Security

A `storageState` holds **live session tokens** — treat it like a password. Serve your
receiving endpoint over HTTPS and validate the API key on your side. Only export sessions
you own or are authorised to use.
