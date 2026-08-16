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

  function renderSocials(container, social, { includeWeb = false, website } = {}) {
    if (!container || !social?.length) return;
    container.innerHTML = "";
    const items = [...social];
    if (includeWeb && website) {
      items.push({ name: "Website", label: "WEB", url: website });
    }
    items.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.url;
      a.textContent = item.label || item.name;
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
      const includeWeb = el.dataset.siteSocials === "full";
      renderSocials(el, data.social, { includeWeb, website: data.website });
    });
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
