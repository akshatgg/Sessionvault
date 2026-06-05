# Releasing the SessionVault extension (Firefox / AMO)

Published to **addons.mozilla.org (AMO)** on the **listed** channel — publicly listed, and
Firefox auto-updates installed users for you.

Two phases: a **one-time manual submission** (AMO requires the first listed version by hand),
then **automated publishing** of every later change via GitHub Actions.

---

## Phase 1 — First submission (one time, manual)

You're doing this now in the Add-on Developer Hub:

1. **Add-on Developer Hub** → [Submit a New Add-on](https://addons.mozilla.org/developers/addon/submit/distribution).
2. **How to distribute:** choose **"On this site"** (listed) → **Continue**.
3. **Upload** a zip of the extension folder:
   ```bash
   cd extension
   zip -r ../sessionvault-extension.zip . -x "*.DS_Store" "README.md"
   ```
4. AMO validates it, then asks for listing details — name, summary, category, at least one
   screenshot, and how it handles data (it reads cookies/host data and only sends them to the
   endpoint the user configures; it stores nothing).
5. Submit. Mozilla reviews it (manual review can take a while). Once approved it's live.

> The add-on's identity is the `browser_specific_settings.gecko.id` in `manifest.json`
> (`sessionvault@local`). Keep it stable — every automated update must use the same id so AMO
> knows it's the same add-on.

---

## Phase 2 — Get AMO API credentials (one time)

1. Go to [AMO → Manage API Keys](https://addons.mozilla.org/developers/addon/api/key/).
2. Generate credentials. You get two values:
   - **JWT issuer** (the API key, looks like `user:12345:67`)
   - **JWT secret** (a long hex string — shown once, copy it now)

---

## Phase 3 — Wire up GitHub Actions

1. Push this repo to GitHub.

2. Repo → **Settings → Secrets and variables → Actions → New repository secret**, add two:

   | Secret | Value |
   |---|---|
   | `AMO_JWT_ISSUER` | the JWT issuer from Phase 2 |
   | `AMO_JWT_SECRET` | the JWT secret from Phase 2 |

3. Done. The workflow [`.github/workflows/publish-firefox.yml`](.github/workflows/publish-firefox.yml)
   runs on every push to `main` that touches `extension/**`:
   - stamps a unique version (`<major>.<minor>.<run-number>`),
   - runs `web-ext sign --channel listed` to upload + submit the new version to AMO.

### Day-to-day

Edit files in `extension/` → commit → push to `main`. The pipeline submits the new version
automatically. Bump `major.minor` in `extension/manifest.json` only for a meaningful version
jump; the patch number is handled for you.

### Good to know

- **First version can't be automated** — the listing must exist first (Phase 1). `web-ext` can
  only upload *new versions* to an add-on that already exists on AMO.
- **Review delay:** each new listed version is subject to Mozilla review before going live.
  After approval, Firefox auto-updates installed users within a day — nothing for them to do.
- **No build/source upload needed:** the extension is plain JS (no bundler/minifier), so AMO
  doesn't require a source-code upload.
- **Also want Chrome?** Add a second job using `mnao305/chrome-extension-upload` with the
  Chrome Web Store secrets, or switch to [`PlasmoHQ/bpp`](https://github.com/PlasmoHQ/bpp) to
  publish to Firefox + Chrome + Edge from one workflow.
