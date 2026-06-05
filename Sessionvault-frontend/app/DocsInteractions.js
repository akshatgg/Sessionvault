"use client";
import { useEffect } from "react";

// Client-side enhancements for the static docs page:
// copy buttons on code blocks, scrollspy nav highlighting, and mobile sidebar.
export default function DocsInteractions() {
  useEffect(() => {
    // 1) copy button on every <pre>
    document.querySelectorAll("main pre").forEach((pre) => {
      if (pre.querySelector(".copy")) return; // guard against StrictMode double-run
      const btn = document.createElement("button");
      btn.className = "copy";
      btn.type = "button";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        const code = pre.querySelector("code");
        try {
          await navigator.clipboard.writeText(code ? code.innerText : pre.innerText);
          btn.textContent = "Copied";
          btn.classList.add("done");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("done");
          }, 1400);
        } catch {
          btn.textContent = "Failed";
        }
      });
      pre.appendChild(btn);
    });

    // 2) scrollspy — highlight the active sidebar link
    const sideLinks = [...document.querySelectorAll("nav.side a")];
    const byId = new Map(
      sideLinks.map((a) => [a.getAttribute("href").slice(1), a])
    );
    const sections = [...document.querySelectorAll("main.content section[id]")];
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            sideLinks.forEach((a) => a.classList.remove("active"));
            const link = byId.get(e.target.id);
            if (link) link.classList.add("active");
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));

    // 3) mobile sidebar toggle
    const toggle = document.querySelector(".nav-toggle");
    const side = document.querySelector("nav.side");
    const onToggle = () => side && side.classList.toggle("open");
    const onSideClick = (e) => {
      if (e.target.tagName === "A" && side) side.classList.remove("open");
    };
    if (toggle) toggle.addEventListener("click", onToggle);
    if (side) side.addEventListener("click", onSideClick);

    return () => {
      spy.disconnect();
      if (toggle) toggle.removeEventListener("click", onToggle);
      if (side) side.removeEventListener("click", onSideClick);
    };
  }, []);

  return null;
}
