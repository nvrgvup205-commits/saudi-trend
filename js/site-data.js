(() => {
  const SOCIAL_SELECTOR = "[data-site-socials]";
  let contactCache = null;

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ar";
  }

  function basePath() {
    const path = window.location.pathname;
    if (path.includes("/services/")) return "../";
    return "";
  }

  async function loadContact() {
    if (contactCache) return contactCache;
    try {
      const res = await fetch(`${basePath()}data/contact.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error("contact.json");
      contactCache = await res.json();
      return contactCache;
    } catch {
      return null;
    }
  }

  function socialIcon(name) {
    const icons = {
      Instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm7.25-11.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"/></svg>',
      X: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      TikTok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>',
      Snapchat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.017 2c2.755 0 3.22.012 4.346.07 1.117.056 1.87.24 2.53.512.72.28 1.33.65 1.94 1.26.61.61.98 1.22 1.26 1.94.27.66.45 1.41.51 2.53.06 1.13.07 1.5.07 4.346s-.01 3.22-.07 4.346c-.056 1.117-.24 1.87-.512 2.53-.28.72-.65 1.33-1.26 1.94-.61.61-1.22.98-1.94 1.26-.66.27-1.41.45-2.53.51-1.13.06-1.5.07-4.346.07s-3.22-.01-4.346-.07c-1.117-.056-1.87-.24-2.53-.512a5.1 5.1 0 0 1-1.94-1.26 5.1 5.1 0 0 1-1.26-1.94c-.27-.66-.45-1.41-.51-2.53C2.032 15.22 2.02 14.85 2.02 12s.012-3.22.07-4.346c.056-1.117.24-1.87.512-2.53.28-.72.65-1.33 1.26-1.94.61-.61 1.22-.98 1.94-1.26.66-.27 1.41-.45 2.53-.51C8.78 2.012 9.15 2 12.017 2zm0 1.8c-2.7 0-3.03.01-4.09.066-.98.045-1.51.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.35-.31.88-.35 1.86-.06 1.06-.066 1.39-.066 4.09s.006 3.03.066 4.09c.045.98.21 1.51.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.14.88.31 1.86.35 1.06.06 1.39.066 4.09.066s3.03-.006 4.09-.066c.98-.045 1.51-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.35.31-.88.35-1.86.06-1.06.066-1.39.066-4.09s-.006-3.03-.066-4.09c-.045-.98-.21-1.51-.35-1.86-.18-.47-.4-.8-.75-1.15-.35-.35-.68-.57-1.15-.75-.35-.14-.88-.31-1.86-.35-1.06-.06-1.39-.066-4.09-.066z"/></svg>',
      Facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    };
    return icons[name] || "";
  }

  function renderSocials(container, social) {
    if (!container || !social?.length) return;
    container.innerHTML = "";
    social.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.url;
      a.className = "socials__link";
      a.innerHTML = socialIcon(item.name);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", item.name);
      container.appendChild(a);
    });
  }

  async function wireSocials() {
    const data = await loadContact();
    if (!data?.social) return;
    document.querySelectorAll(SOCIAL_SELECTOR).forEach((el) => {
      renderSocials(el, data.social);
    });
  }

  function wireMap() {
    const wrap = document.getElementById("site-map-lazy");
    const iframe = wrap?.querySelector("iframe[data-src]");
    if (!iframe) return;
    const load = () => {
      if (iframe.dataset.loaded) return;
      iframe.src = iframe.dataset.src;
      iframe.dataset.loaded = "1";
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            load();
            io.disconnect();
          }
        },
        { rootMargin: "180px" }
      );
      io.observe(wrap);
    } else {
      load();
    }
  }

  async function loadAbout() {
    const root = document.getElementById("about-root");
    if (!root) return;
    try {
      const res = await fetch(`${basePath()}data/about.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error("about.json");
      const all = await res.json();
      const d = all[lang()] || all.ar;
      document.title = d.metaTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = d.metaDescription;

      root.querySelector("[data-about-eyebrow]")?.replaceChildren(document.createTextNode(d.eyebrow));
      root.querySelector("[data-about-title]")?.replaceChildren(document.createTextNode(d.title));
      root.querySelector("[data-about-lead]")?.replaceChildren(document.createTextNode(d.lead));
      root.querySelector("[data-about-vision-title]")?.replaceChildren(document.createTextNode(d.vision.title));
      root.querySelector("[data-about-vision-text]")?.replaceChildren(document.createTextNode(d.vision.text));
      root.querySelector("[data-about-mission-title]")?.replaceChildren(document.createTextNode(d.mission.title));
      root.querySelector("[data-about-mission-text]")?.replaceChildren(document.createTextNode(d.mission.text));
      root.querySelector("[data-about-coverage]")?.replaceChildren(document.createTextNode(d.coverage));
      root.querySelector("[data-about-cr]")?.replaceChildren(document.createTextNode(d.cr));

      const valuesEl = root.querySelector("[data-about-values]");
      if (valuesEl) {
        valuesEl.innerHTML = d.values
          .map(
            (v) =>
              `<article class="about-card"><h3>${v.title}</h3><p>${v.text}</p></article>`
          )
          .join("");
      }

      const pillarsEl = root.querySelector("[data-about-pillars]");
      if (pillarsEl) {
        pillarsEl.innerHTML = d.pillars
          .map(
            (p) =>
              `<article class="about-pillar"><h3>${p.title}</h3><p>${p.text}</p></article>`
          )
          .join("");
      }

      const statsEl = root.querySelector("[data-about-stats]");
      if (statsEl) {
        statsEl.innerHTML = d.stats
          .map((s) => `<div class="about-stat"><strong>${s.value}</strong><span>${s.label}</span></div>`)
          .join("");
      }
    } catch {
      /* keep static fallbacks */
    }
  }

  function init() {
    wireSocials();
    wireMap();
    loadAbout();
    document.addEventListener("st:langchange", () => {
      loadAbout();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.STSiteData = { loadContact, wireSocials, loadAbout };
})();
