import DocsInteractions from "./DocsInteractions";

const codeFormat = `{
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": ".example.com",
      "path": "/",
      "expires": -1,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "https://example.com",
      "localStorage": [
        { "name": "token", "value": "xyz" }
      ]
    }
  ]
}`;

const codePwFile = `const context = await browser.newContext({ storageState: "storageState.json" });
const page = await context.newPage();
await page.goto("https://app.example.com"); // already logged in`;

const codePwBody = `// req.body.storageState is the object the extension POSTed
const context = await browser.newContext({ storageState: req.body.storageState });`;

const codeGen = `# pick ONE of these
openssl rand -hex 32
# or with Node:
node -e "console.log('sv_' + require('crypto').randomBytes(24).toString('hex'))"`;

const codeSchemaPost = `POST https://your-app.com/sessions
Content-Type: application/json
x-api-key: sv_your_key

{
  "url": "https://app.example.com",
  "capturedAt": "2026-06-05T12:00:00.000Z",
  "storageState": {
    "cookies": [ { "name": "session", "value": "abc123", "domain": ".example.com",
                   "path": "/", "expires": -1, "httpOnly": true, "secure": true, "sameSite": "Lax" } ],
    "origins": [ { "origin": "https://app.example.com",
                   "localStorage": [ { "name": "token", "value": "xyz" } ] } ]
  }
}`;

const codeExpress = `import express from "express";
const app = express();

app.post("/sessions", express.json({ limit: "10mb" }), (req, res) => {
  // 1. verify the API key
  if (req.get("x-api-key") !== process.env.MY_KEY) return res.sendStatus(401);

  // 2. read the schema
  const { url, capturedAt, storageState } = req.body;

  // 3. use it now (run Playwright, forward it, etc.) — nothing is stored unless you choose to
  console.log(\`got \${storageState.cookies.length} cookies from \${url}\`);
  res.json({ ok: true });
});

app.listen(8080);`;

const codeFastapi = `from fastapi import FastAPI, Header, HTTPException
import os

app = FastAPI()

@app.post("/sessions")
async def sessions(payload: dict, x_api_key: str = Header(None)):
    # 1. verify the API key
    if x_api_key != os.environ["MY_KEY"]:
        raise HTTPException(status_code=401)

    # 2. read the schema
    url = payload["url"]
    storage_state = payload["storageState"]

    # 3. use it now — nothing is persisted unless you choose to
    print(f"got {len(storage_state['cookies'])} cookies from {url}")
    return {"ok": True}`;

const codeExGen = `node -e "console.log('sv_' + require('crypto').randomBytes(24).toString('hex'))"
# -> sv_9f2c8a1b4d7e0c3a...`;

const codeExRun = `MY_KEY=sv_9f2c8a1b4d7e0c3a... node receiver.js
# listening on :8080`;

export default function Page() {
  return (
    <>
      <header className="site">
        <div className="nav">
          <a className="logo" href="#top">
            <img src="/logo.svg" alt="" /> SessionVault
          </a>
          <span className="spacer"></span>
          <button className="nav-toggle" aria-label="Toggle navigation">
            ☰
          </button>
          <nav className="links">
            <a href="#install">Install</a>
            <a href="#capture">Usage</a>
            <a href="#apikey">API key</a>
            <a href="#example">Example</a>
            <a className="btn primary" href="#install">
              Get the extension
            </a>
          </nav>
        </div>
      </header>

      <a id="top"></a>
      <section className="hero">
        <span className="badge">Cross-browser · MV3 · Playwright-ready</span>
        <div>
          <img className="mark" src="/logo.svg" alt="SessionVault logo" />
        </div>
        <h1>
          Capture &amp; reuse{" "}
          <span className="brand-gradient">browser sessions</span>
        </h1>
        <p className="lead">
          SessionVault is a browser extension that exports the current tab&apos;s{" "}
          <strong>cookies + localStorage</strong> in Playwright{" "}
          <code>storageState</code> format — copy it, download it, or POST it
          straight to your own endpoint.{" "}
          <strong>No server, no database, nothing stored.</strong>
        </p>
        <div className="cta">
          <a className="btn primary" href="#install">
            Get started
          </a>
          <a className="btn" href="#how-it-works">
            How it works
          </a>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="ico">🍪</div>
          <h3>Cookies + localStorage</h3>
          <p>
            Grabs both — including <code>HttpOnly</code> session cookies that{" "}
            <code>document.cookie</code> can&apos;t see.
          </p>
        </div>
        <div className="feature">
          <div className="ico">📦</div>
          <h3>Three outputs</h3>
          <p>
            Copy to clipboard, download <code>storageState.json</code>, or POST to
            your own endpoint.
          </p>
        </div>
        <div className="feature">
          <div className="ico">🚫</div>
          <h3>Nothing stored</h3>
          <p>
            No backend, no database. Captures go only where you send them, on
            demand — then they&apos;re gone.
          </p>
        </div>
      </section>

      <div className="layout">
        <nav className="side" aria-label="Docs navigation">
          <div className="group">Getting started</div>
          <a href="#introduction">Introduction</a>
          <a href="#how-it-works">How it works</a>
          <a href="#install">Install the extension</a>
          <div className="group">Using it</div>
          <a href="#capture">Capture &amp; export</a>
          <a href="#format">storageState format</a>
          <a href="#send">Send to your API</a>
          <a href="#playwright">Use with Playwright</a>
          <div className="group">Build your endpoint</div>
          <a href="#apikey">How the API key works</a>
          <a href="#schema">Request schema</a>
          <a href="#receiver">Example receiver</a>
          <a href="#example">End-to-end example</a>
          <div className="group">Reference</div>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </nav>

        <main className="content">
          <section id="introduction">
            <h2>Introduction</h2>
            <p>
              SessionVault is a Manifest V3 browser extension (Chrome, Edge, Brave,
              Firefox) that snapshots the authenticated state of the tab you&apos;re
              on and hands it back in the exact shape Playwright and Puppeteer
              expect.
            </p>
            <p>
              That snapshot — the <code>storageState</code> — lets you reuse a login
              without typing a password again: feed it into an automated test, sync
              a session to another browser, or POST it to your own service.{" "}
              <strong>SessionVault has no server and no database</strong> — the data
              goes only where you choose, when you click.
            </p>
            <div className="note tip">
              <span className="tag">Intended use</span>
              <div>
                This is a tool for exporting <strong>your own</strong> sessions, on
                demand, from a popup you control — the normal test-automation /
                session-sync workflow. It does no background collection and stores
                nothing.
              </div>
            </div>
          </section>

          <section id="how-it-works">
            <h2>How it works</h2>
            <p>
              Two storage areas need two different browser APIs, which the extension
              merges into one object:
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Data</th>
                  <th>Read via</th>
                  <th>Why</th>
                </tr>
                <tr>
                  <td>
                    Cookies (incl. <code>HttpOnly</code>)
                  </td>
                  <td>
                    <code>cookies.getAll()</code>
                  </td>
                  <td>
                    The only way to read <code>HttpOnly</code> cookies — JS on the
                    page cannot.
                  </td>
                </tr>
                <tr>
                  <td>localStorage</td>
                  <td>
                    <code>scripting.executeScript()</code>
                  </td>
                  <td>
                    localStorage lives in the page; the extension must run code
                    inside it.
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              When you click <strong>POST to API</strong>, the capture goes directly
              to your endpoint — no server in between, nothing saved:
            </p>
            <div className="flow">
              <pre>{`
 BROWSER (extension)                          YOUR ENDPOINT  (you build this)
 ───────────────────                          ─────────────────────────────
 click "POST to API"
   │  gather cookies + localStorage
   │  → storageState JSON
   ▼
 POST https://your-app.com/…  ────────────►   1. check the API key
   x-api-key: sv_…  (your key)                 2. read { url, capturedAt, storageState }
   ◄──────────────────────────────────────    3. use it / return 200 OK

 The extension stores nothing — the capture exists only in this one request.
              `}</pre>
            </div>
          </section>

          <section id="install">
            <h2>Install the extension</h2>
            <p>There are two ways to use SessionVault:</p>
            <ul>
              <li>
                <strong>From the add-on store</strong> — once it&apos;s published,
                install in one click and get automatic updates.
              </li>
              <li>
                <strong>Download &amp; run it locally</strong> — grab the{" "}
                <code>extension</code> folder and load it <em>unpacked</em> (steps
                below). No store account needed — you can use it right now.
              </li>
            </ul>
            <h3>Chrome / Edge / Brave</h3>
            <ol className="steps">
              <li>
                <strong>Open the extensions page</strong> Go to{" "}
                <code>chrome://extensions</code>.
              </li>
              <li>
                <strong>Enable Developer mode</strong> Toggle it on (top-right).
              </li>
              <li>
                <strong>Load unpacked</strong> Click it and select the extension
                folder. The logo appears in your toolbar.
              </li>
            </ol>
            <h3>Firefox</h3>
            <ol className="steps">
              <li>
                <strong>Open the debugging page</strong> Go to{" "}
                <code>about:debugging#/runtime/this-firefox</code>.
              </li>
              <li>
                <strong>Load Temporary Add-on</strong> Pick the{" "}
                <code>manifest.json</code> file.
              </li>
            </ol>
            <div className="note">
              <span className="tag">Firefox note</span>
              <div>
                Firefox treats <code>&lt;all_urls&gt;</code> as an optional host
                permission. If cookie capture comes back empty, open the add-on&apos;s
                permissions and grant site access.
              </div>
            </div>
          </section>

          <section id="capture">
            <h2>Capture &amp; export</h2>
            <ol className="steps">
              <li>
                <strong>Open the target site</strong> Log in normally, then click the
                extension&apos;s toolbar icon.
              </li>
              <li>
                <strong>Choose what to grab</strong> Tick <em>Cookies</em>,{" "}
                <em>localStorage</em>, or both.
              </li>
              <li>
                <strong>Pick an output</strong> Use one of the three buttons:
              </li>
            </ol>
            <table>
              <tbody>
                <tr>
                  <th>Button</th>
                  <th>What it does</th>
                </tr>
                <tr>
                  <td>Copy to clipboard</td>
                  <td>
                    Puts the <code>storageState</code> JSON on your clipboard.
                  </td>
                </tr>
                <tr>
                  <td>Download state.json</td>
                  <td>Saves a file you can pass straight to Playwright.</td>
                </tr>
                <tr>
                  <td>POST to API</td>
                  <td>
                    Sends it to the endpoint configured in <em>API settings</em>.
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              The status line confirms what was captured, e.g.{" "}
              <code>Sent to API — 7 cookies, 3 localStorage keys</code>.
            </p>
          </section>

          <section id="format">
            <h2>storageState format</h2>
            <p>
              Output matches Playwright&apos;s <code>storageState</code> schema
              exactly:
            </p>
            <pre>
              <code>{codeFormat}</code>
            </pre>
            <p className="lead-sm">
              Session cookies get <code>expires: -1</code>. <code>sameSite</code> is
              normalised to <code>Strict</code> / <code>Lax</code> / <code>None</code>{" "}
              so Playwright accepts it.
            </p>
          </section>

          <section id="send">
            <h2>Send to your API</h2>
            <p>
              The extension doesn&apos;t decide where data goes — <strong>you do</strong>.
              In the popup, open <em>API settings</em> and fill in three fields:
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Field</th>
                  <th>What to put</th>
                </tr>
                <tr>
                  <td>Endpoint URL</td>
                  <td>
                    Your own receiver, e.g.{" "}
                    <code>https://your-app.com/sessions</code>
                  </td>
                </tr>
                <tr>
                  <td>API key</td>
                  <td>A secret you create (see below). The extension just sends it.</td>
                </tr>
                <tr>
                  <td>Auth header</td>
                  <td>
                    <code>x-api-key</code> or <code>Authorization: Bearer</code>
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              Click <strong>Save settings</strong> once. From then on,{" "}
              <strong>POST to API</strong> sends the capture to that URL with that
              key. Nothing is stored by the extension.
            </p>
          </section>

          <section id="playwright">
            <h2>Use with Playwright</h2>
            <p>From a downloaded file:</p>
            <pre>
              <code>{codePwFile}</code>
            </pre>
            <p>Or from the JSON your endpoint received:</p>
            <pre>
              <code>{codePwBody}</code>
            </pre>
          </section>

          <section id="apikey">
            <h2>How the API key works</h2>
            <p>
              This is the part to understand clearly:{" "}
              <strong>SessionVault does not generate or check API keys.</strong> The
              key is a secret <em>you</em> create and <em>you</em> verify. It exists
              so that <strong>only you</strong> can post to your endpoint — without
              it, anyone who found the URL could send data to it.
            </p>
            <p>The flow is just a shared secret:</p>
            <ol className="steps">
              <li>
                <strong>You create a secret string</strong> Any hard-to-guess value.
                For example:
                <pre>
                  <code>{codeGen}</code>
                </pre>
                You&apos;ll get something like <code>sv_9f2c8a1b…</code>.
              </li>
              <li>
                <strong>You store it on your server</strong> as a secret (an
                environment variable), e.g. <code>MY_KEY=sv_9f2c8a1b…</code>.
              </li>
              <li>
                <strong>You paste the same value</strong> into the extension&apos;s{" "}
                <em>API key</em> field and pick the header (<code>x-api-key</code> or
                Bearer).
              </li>
              <li>
                <strong>On every POST</strong> the extension sends that key in the
                header. Your endpoint compares it to <code>MY_KEY</code> — if they
                match, accept; if not, return <code>401</code>.
              </li>
            </ol>
            <div className="note tip">
              <span className="tag">In short</span>
              <div>
                The API key is yours end-to-end. The extension only carries it. There
                is no SessionVault account, no key server, nothing to sign up for.
              </div>
            </div>
          </section>

          <section id="schema">
            <h2>Request schema</h2>
            <p>
              Your endpoint must accept a <code>POST</code> with a JSON body. This is
              the exact shape the extension sends — build your receiver to read these
              fields:
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
                <tr>
                  <td>
                    <code>url</code>
                  </td>
                  <td>string</td>
                  <td>The page the session was captured from.</td>
                </tr>
                <tr>
                  <td>
                    <code>capturedAt</code>
                  </td>
                  <td>string (ISO 8601)</td>
                  <td>
                    When it was captured, e.g.{" "}
                    <code>2026-06-05T12:00:00.000Z</code>.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>storageState</code>
                  </td>
                  <td>object</td>
                  <td>
                    The Playwright session — <code>{"{ cookies[], origins[] }"}</code>.
                    See <a href="#format">storageState format</a>.
                  </td>
                </tr>
              </tbody>
            </table>
            <p>Headers:</p>
            <table>
              <tbody>
                <tr>
                  <th>Header</th>
                  <th>Value</th>
                </tr>
                <tr>
                  <td>
                    <code>Content-Type</code>
                  </td>
                  <td>
                    <code>application/json</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>x-api-key</code> <em>or</em> <code>Authorization</code>
                  </td>
                  <td>
                    <code>sv_your_key</code> <em>or</em> <code>Bearer sv_your_key</code>
                  </td>
                </tr>
              </tbody>
            </table>
            <p>Full request as it arrives at your endpoint:</p>
            <pre>
              <code>{codeSchemaPost}</code>
            </pre>
          </section>

          <section id="receiver">
            <h2>Example receiver</h2>
            <p>
              Any HTTP endpoint works — accept JSON, check your key, use{" "}
              <code>storageState</code>. Two minimal versions:
            </p>
            <h3>Node / Express</h3>
            <pre>
              <code>{codeExpress}</code>
            </pre>
            <h3>Python / FastAPI</h3>
            <pre>
              <code>{codeFastapi}</code>
            </pre>
          </section>

          <section id="example">
            <h2>End-to-end example</h2>
            <p>The whole thing, start to finish:</p>
            <ol className="steps">
              <li>
                <strong>Make a key</strong>
                <pre>
                  <code>{codeExGen}</code>
                </pre>
              </li>
              <li>
                <strong>Run your receiver with that key</strong> (using the Express
                example above)
                <pre>
                  <code>{codeExRun}</code>
                </pre>
              </li>
              <li>
                <strong>Configure the extension</strong> Open the popup →{" "}
                <em>API settings</em>:
                <ul>
                  <li>
                    Endpoint URL: <code>http://localhost:8080/sessions</code>
                  </li>
                  <li>
                    API key: <code>sv_9f2c8a1b4d7e0c3a...</code>
                  </li>
                  <li>
                    Auth header: <code>x-api-key</code>
                  </li>
                </ul>
                Click <strong>Save settings</strong>.
              </li>
              <li>
                <strong>Capture</strong> Go to a site you&apos;re logged into, open the
                popup, tick Cookies + localStorage, click <strong>POST to API</strong>.
              </li>
              <li>
                <strong>Done</strong> Your receiver prints{" "}
                <code>got 7 cookies from https://app.example.com</code>. The session
                is now yours to use — and SessionVault kept nothing.
              </li>
            </ol>
          </section>

          <section id="security">
            <h2>Security</h2>
            <ul>
              <li>
                A <code>storageState</code> contains <strong>live session tokens</strong>{" "}
                — anyone holding it is logged in as you. Treat it like a password.
              </li>
              <li>
                SessionVault stores nothing. Once you POST, the data lives only on{" "}
                <strong>your</strong> endpoint — securing it there is up to you.
              </li>
              <li>
                Always serve your receiver over <strong>HTTPS</strong> so the capture
                isn&apos;t sent in the clear.
              </li>
              <li>
                Validate the API key on your endpoint, and reject anything else with{" "}
                <code>401</code>.
              </li>
              <li>Only export sessions you own or are authorised to use.</li>
            </ul>
            <div className="note warn">
              <span className="tag">Important</span>
              <div>
                This tool runs on demand in your own browser; it is not for capturing
                anyone else&apos;s session.
              </div>
            </div>
          </section>

          <section id="faq">
            <h2>FAQ</h2>
            <h3>Who creates the API key?</h3>
            <p>
              You do. SessionVault has no accounts and no key server — the key is just
              a secret you generate, store on your endpoint, and paste into the
              extension. See <a href="#apikey">How the API key works</a>.
            </p>
            <h3>Does it capture HttpOnly cookies?</h3>
            <p>
              Yes. It uses the browser&apos;s <code>cookies</code> API, which can read{" "}
              <code>HttpOnly</code> cookies that page JavaScript cannot.
            </p>
            <h3>Where does my session data go?</h3>
            <p>
              Only where you send it. Copy/Download keep it local; POST sends it to
              the one endpoint you configure. The extension never stores captures and
              has no server.
            </p>
            <h3>Does it capture multiple domains at once?</h3>
            <p>
              No — it captures the active tab&apos;s origin (its cookies + that
              origin&apos;s localStorage). Multi-origin capture is a planned option.
            </p>
            <h3>Which browsers are supported?</h3>
            <p>
              Chrome, Edge, Brave (Chromium MV3) and Firefox 121+. The same codebase
              runs on both via the <code>browser</code>/<code>chrome</code> API shim.
            </p>
          </section>
        </main>
      </div>

      <footer className="site">
        <div className="foot">
          <span className="logo">
            <img src="/logo.svg" alt="" /> SessionVault
          </span>
          <span className="spacer"></span>
          <span>Capture sessions. Store them safely. Reuse anywhere.</span>
        </div>
      </footer>

      <DocsInteractions />
    </>
  );
}
