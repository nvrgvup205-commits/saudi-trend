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
      Snapchat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.166 3c.96 0 1.74.08 2.5.24.7.14 1.3.34 1.86.62.5.25.9.54 1.28.92.36.36.65.78.9 1.26.22.42.38.88.48 1.38.1.5.14 1.08.14 1.76v.42c0 .5-.04.92-.12 1.28-.08.38-.2.72-.36 1.02-.14.28-.32.54-.54.76-.2.2-.44.38-.7.52-.24.14-.5.26-.78.34-.26.08-.54.14-.84.18v.02c.32.06.62.16.9.3.3.14.56.34.78.58.24.26.42.56.54.9.12.34.18.72.18 1.14 0 .46-.08.86-.24 1.2-.16.34-.38.62-.66.84-.28.22-.6.38-.96.48-.36.1-.74.16-1.14.18-.4.02-.8.02-1.2 0-.4-.02-.78-.08-1.14-.18a2.6 2.6 0 0 1-.96-.48 2.1 2.1 0 0 1-.66-.84c-.16-.34-.24-.74-.24-1.2 0-.42.06-.8.18-1.14.12-.34.3-.64.54-.9.22-.24.48-.44.78-.58.28-.14.58-.24.9-.3v-.02c-.3-.04-.58-.1-.84-.18a3.2 3.2 0 0 1-.78-.34 2.5 2.5 0 0 1-.7-.52 2.4 2.4 0 0 1-.54-.76 3.4 3.4 0 0 1-.36-1.02 5.5 5.5 0 0 1-.12-1.28v-.42c0-.68.04-1.26.14-1.76.1-.5.26-.96.48-1.38.25-.48.54-.9.9-1.26.38-.38.78-.67 1.28-.92.56-.28 1.16-.48 1.86-.62.76-.16 1.54-.24 2.5-.24z"/></svg>',
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
