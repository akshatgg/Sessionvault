// Cross-browser: Firefox exposes promise-based `browser.*`; Chrome/Edge/Brave
// expose `chrome.*` which returns promises for these APIs under MV3.
const api = globalThis.browser ?? globalThis.chrome;

// Where the "Docs" button points. Change this to your deployed docs URL.
const DOCS_URL = "https://sessionvault-frontend.vercel.app/";

const els = {
  site: document.getElementById("site"),
  docs: document.getElementById("btn-docs"),
  wantCookies: document.getElementById("want-cookies"),
  wantLocal: document.getElementById("want-local"),
  copy: document.getElementById("btn-copy"),
  download: document.getElementById("btn-download"),
  send: document.getElementById("btn-send"),
  apiUrl: document.getElementById("api-url"),
  apiKey: document.getElementById("api-key"),
  apiHeader: document.getElementById("api-header"),
  saveSettings: document.getElementById("btn-save-settings"),
  status: document.getElementById("status"),
};

function setStatus(msg, kind = "") {
  els.status.textContent = msg;
  els.status.className = "status" + (kind ? " " + kind : "");
}

async function getActiveTab() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// chrome.cookies sameSite -> Playwright sameSite
function mapSameSite(s) {
  switch (s) {
    case "no_restriction": return "None";
    case "strict": return "Strict";
    case "lax": return "Lax";
    default: return "Lax"; // "unspecified" / undefined -> Playwright requires a value
  }
}

async function captureCookies(tab) {
  // `url` filter returns exactly the cookies the browser would send to this page,
  // including HttpOnly session cookies (which document.cookie cannot see).
  const cookies = await api.cookies.getAll({ url: tab.url });
  return cookies.map((c) => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path,
    expires: c.session || !c.expirationDate ? -1 : Math.round(c.expirationDate),
    httpOnly: !!c.httpOnly,
    secure: !!c.secure,
    sameSite: mapSameSite(c.sameSite),
  }));
}

async function captureLocalStorage(tab) {
  // Must run IN the page — the extension context has its own separate storage.
  const results = await api.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const name = localStorage.key(i);
        items.push({ name, value: localStorage.getItem(name) });
      }
      return { origin: location.origin, items };
    },
  });
  const r = results && results[0] && results[0].result;
  if (!r || r.items.length === 0) return [];
  return [{ origin: r.origin, localStorage: r.items }];
}

async function buildStorageState() {
  const tab = await getActiveTab();
  if (!tab || !tab.url || !/^https?:/i.test(tab.url)) {
    throw new Error("Open a normal http(s) page first.");
  }
  const state = { cookies: [], origins: [] };
  if (els.wantCookies.checked) state.cookies = await captureCookies(tab);
  if (els.wantLocal.checked) state.origins = await captureLocalStorage(tab);
  if (!els.wantCookies.checked && !els.wantLocal.checked) {
    throw new Error("Pick at least one of cookies / localStorage.");
  }
  return state;
}

function download(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "storageState.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function postToApi(state) {
  const { apiUrl, apiKey, apiHeader } = await api.storage.local.get([
    "apiUrl", "apiKey", "apiHeader",
  ]);
  if (!apiUrl) throw new Error("Set an API endpoint in API settings first.");

  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    if (apiHeader === "x-api-key") headers["x-api-key"] = apiKey;
    else headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      url: (await getActiveTab()).url,
      capturedAt: new Date().toISOString(),
      storageState: state,
    }),
  });
  if (!res.ok) throw new Error(`API responded ${res.status} ${res.statusText}`);
}

function summarize(state) {
  return `${state.cookies.length} cookies, ` +
    `${state.origins[0]?.localStorage.length ?? 0} localStorage keys`;
}

// --- wire up buttons -------------------------------------------------------

async function withCapture(action, doneMsg) {
  try {
    setStatus("Capturing…");
    const state = await buildStorageState();
    await action(state);
    setStatus(`${doneMsg} — ${summarize(state)}`, "ok");
  } catch (err) {
    setStatus(err.message || String(err), "err");
  }
}

els.copy.addEventListener("click", () =>
  withCapture(
    (state) => navigator.clipboard.writeText(JSON.stringify(state, null, 2)),
    "Copied"
  )
);

els.download.addEventListener("click", () =>
  withCapture((state) => download(state), "Downloaded")
);

els.send.addEventListener("click", () =>
  withCapture((state) => postToApi(state), "Sent to API")
);

els.docs.addEventListener("click", () => {
  api.tabs.create({ url: DOCS_URL });
  window.close();
});

els.saveSettings.addEventListener("click", async () => {
  await api.storage.local.set({
    apiUrl: els.apiUrl.value.trim(),
    apiKey: els.apiKey.value,
    apiHeader: els.apiHeader.value,
  });
  setStatus("Settings saved.", "ok");
});

// --- init ------------------------------------------------------------------

(async function init() {
  try {
    const tab = await getActiveTab();
    els.site.textContent = tab?.url ? new URL(tab.url).origin : "No active tab";
  } catch {
    els.site.textContent = "No active tab";
  }
  const s = await api.storage.local.get(["apiUrl", "apiKey", "apiHeader"]);
  if (s.apiUrl) els.apiUrl.value = s.apiUrl;
  if (s.apiKey) els.apiKey.value = s.apiKey;
  if (s.apiHeader) els.apiHeader.value = s.apiHeader;
})();
