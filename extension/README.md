# SessionVault

A cross-browser (Chrome / Edge / Brave / Firefox) MV3 extension that captures the
**current tab's cookies + localStorage** and exports them in
**Playwright [`storageState`](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state) format**.

Built for capturing **your own** authenticated sessions to reuse in automation,
test runs, or monitoring (e.g. feeding a logged-in session into a Playwright job).

## What it does

Three outputs, all producing the same `storageState` JSON:

- **Copy to clipboard** — paste it anywhere.
- **Download `storageState.json`** — load directly via Playwright's `storageState` option.
- **POST to API** — sends to your endpoint with an API key header (`Authorization: Bearer` or `x-api-key`).

You choose what to grab with the **Cookies** / **localStorage** checkboxes.

## Why two capture paths

| Data | API used | Note |
|------|----------|------|
| Cookies (incl. `HttpOnly`) | `cookies.getAll({ url })` from the popup | Only way to read `HttpOnly` session cookies — `document.cookie` can't see them |
| localStorage | `scripting.executeScript` injected into the page | The extension has its own separate storage; localStorage must be read *in the page* |

The two are merged into one `storageState` object (`cookies[]` + `origins[].localStorage[]`).

## Install (unpacked, for development)

**Chrome / Edge / Brave**
1. `chrome://extensions` → enable **Developer mode**
2. **Load unpacked** → select this folder

**Firefox**
1. `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on** → pick `manifest.json`

The SessionVault logo icons are included at `icons/icon48.png` and `icons/icon128.png`.

## Using the output with Playwright

```js
const context = await browser.newContext({ storageState: "storageState.json" });
const page = await context.newPage();
await page.goto("https://app.example.com"); // already logged in
```

Or load the POSTed JSON server-side and pass it as an object:

```js
await browser.newContext({ storageState: receivedJson.storageState });
```

## The POST request (for your receiver)

When you click **POST to API**, the extension sends straight to the endpoint you configure —
nothing is stored by the extension. Your endpoint receives:

```http
POST https://your-app.com/sessions
Content-Type: application/json
x-api-key: <your key>          # or  Authorization: Bearer <your key>

{
  "url": "https://app.example.com",
  "capturedAt": "2026-06-05T12:00:00.000Z",
  "storageState": { "cookies": [ ... ], "origins": [ ... ] }
}
```

Do whatever you want with `storageState` on your side (use it now, forward it, etc.). The API
key is whatever **your** endpoint expects — you validate it; the extension just sends it.

## Notes / limits

- `sameSite` is mapped from Chrome's values (`no_restriction`→`None`, `lax`→`Lax`,
  `strict`→`Strict`, unspecified→`Lax`) so Playwright accepts it.
- Session cookies get `expires: -1`.
- Captures only the **active tab's** origin (cookies it would send + that origin's localStorage).
- Runs on demand from the popup — no background collection.
- This handles live session tokens. Treat the JSON like a password; only POST it over HTTPS to an endpoint you control.
