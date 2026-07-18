(() => {
  const prefersFine = window.matchMedia("(pointer: fine)").matches;
  const isMobileMQ = window.matchMedia("(max-width: 720px)");

  /* ── Skills rotator (bilingual) ── */
  const skillEl = document.getElementById("hero-skill");
  let skillIndex = 0;
  const skillsFor = () =>
    window.ST_I18N
      ? window.ST_I18N.skills(window.ST_I18N.getLang())
      : [
          "تصميم الهوية التجارية",
          "برمجة المواقع والمتاجر الإلكترونية",
          "تهيئة محركات البحث (SEO)",
          "تصميم الفيديو والموشن جرافيك",
          "إدارة الحملات الإعلانية",
        ];
  if (skillEl) {
    const paintSkill = () => {
      const skills = skillsFor();
      skillEl.textContent = skills[skillIndex % skills.length];
    };
    setInterval(() => {
      skillEl.classList.add("is-fading");
      setTimeout(() => {
        skillIndex = (skillIndex + 1) % skillsFor().length;
        paintSkill();
        skillEl.classList.remove("is-fading");
      }, 220);
    }, 2600);
    window.addEventListener("st:langchange", () => {
      skillIndex = 0;
      paintSkill();
    });
  }

  /* ── Magic cursor + particle trail (desktop) ── */
  const cursor = document.getElementById("cursor");
  const cursorRing = cursor?.querySelector(".cursor__ring");
  const trailCanvas = document.getElementById("cursor-trail");
  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.45;
  let rx = mx;
  let ry = my;
  const particles = [];

  function spawnParticle(x, y) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4 - 0.4,
      life: 1,
      size: 2 + Math.random() * 3.5,
      color: Math.random() > 0.45 ? "rgba(77,182,160," : "rgba(212,175,55,",
    });
    if (particles.length > 90) particles.splice(0, particles.length - 90);
  }

  if (prefersFine && cursor) {
    document.body.classList.add("has-custom-cursor");
    if (trailCanvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resize = () => {
        trailCanvas.width = window.innerWidth * dpr;
        trailCanvas.height = window.innerHeight * dpr;
        trailCanvas.style.width = `${window.innerWidth}px`;
        trailCanvas.style.height = `${window.innerHeight}px`;
        const ctx = trailCanvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);
    }

    let lastSpawn = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.add("is-on");
      const now = performance.now();
      if (now - lastSpawn > 16) {
        spawnParticle(mx, my);
        lastSpawn = now;
      }
    });
    window.addEventListener("mousedown", () => {
      cursor.classList.add("is-click");
      for (let i = 0; i < 10; i++) spawnParticle(mx, my);
    });
    window.addEventListener("mouseup", () => cursor.classList.remove("is-click"));
    document.querySelectorAll("a, button, .filter-btn, .featured__dot, .flip-card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  } else {
    document.body.classList.remove("has-custom-cursor");
    cursor?.remove();
    trailCanvas?.remove();
  }

  /* Touch: eye looks toward tap / finger */
  window.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches[0]) return;
      mx = e.touches[0].clientX;
      my = e.touches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches[0]) return;
      mx = e.touches[0].clientX;
      my = e.touches[0].clientY;
    },
    { passive: true }
  );

  /* ── Eye: desktop water-dive / mobile astral spell ── */
  const eye = document.getElementById("site-eye");
  const ball = document.getElementById("eye-ball");
  const eyeSlot = document.getElementById("eye-slot");
  const eyeAnchor = document.getElementById("eye-anchor");
  const eyeRipple = document.getElementById("eye-ripple");
  const eyeSpell = document.getElementById("eye-spell");
  const eyePortal = document.getElementById("eye-portal");
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const hasHeroEye = document.body.classList.contains("has-hero-eye") && !!hero;
  const MAX_LOOK = 0.32;
  const DIVE_END = 0.48;
  /* Mobile spell phases (of total scroll progress 0→1) */
  const M_CHARGE = 0.22;
  const M_COLLAPSE = 0.42;
  const M_FLIGHT = 0.78;

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIn = (t) => t * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const spellParticles = [];
  let spellSparkAcc = 0;

  function resizeSpellCanvas() {
    if (!eyeSpell) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    eyeSpell.width = Math.floor(window.innerWidth * dpr);
    eyeSpell.height = Math.floor(window.innerHeight * dpr);
    eyeSpell.style.width = `${window.innerWidth}px`;
    eyeSpell.style.height = `${window.innerHeight}px`;
    const ctx = eyeSpell.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if (eyeSpell) {
    resizeSpellCanvas();
    window.addEventListener("resize", resizeSpellCanvas);
  }

  function spawnSpellSpark(x, y, burst = false) {
    const n = burst ? 10 : 2;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = burst ? 1.2 + Math.random() * 2.4 : 0.25 + Math.random() * 0.9;
      spellParticles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (burst ? 0.6 : 0.15),
        life: burst ? 1 : 0.7 + Math.random() * 0.35,
        size: burst ? 2.2 + Math.random() * 2.4 : 1.1 + Math.random() * 1.8,
        gold: Math.random() > 0.45,
      });
    }
  }

  function paintSpellSparks() {
    if (!eyeSpell) return;
    const ctx = eyeSpell.getContext("2d");
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = spellParticles.length - 1; i >= 0; i--) {
      const p = spellParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.012;
      p.life -= 0.018;
      if (p.life <= 0) {
        spellParticles.splice(i, 1);
        continue;
      }
      const col = p.gold ? "212, 175, 55" : "77, 182, 160";
      ctx.beginPath();
      ctx.fillStyle = `rgba(${col}, ${Math.max(0, p.life)})`;
      ctx.shadowColor = `rgba(${col}, 0.9)`;
      ctx.shadowBlur = 10;
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function placePortal(x, y, on) {
    if (!eyePortal) return;
    eyePortal.style.left = `${x}px`;
    eyePortal.style.top = `${y}px`;
    eyePortal.classList.toggle("is-on", !!on);
  }

  function heroStartRect() {
    if (eyeAnchor) {
      const r = eyeAnchor.getBoundingClientRect();
      if (r.width > 8 && r.height > 8) {
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      }
    }
    const heroRect = hero.getBoundingClientRect();
    const ww = window.innerWidth;
    const isMobile = isMobileMQ.matches;
    const width = isMobile ? Math.min(ww * 0.78, 300) : Math.min(ww * 0.22, 400);
    const height = width / 2.15;
    const left = isMobile ? (ww - width) / 2 : Math.max(ww * 0.06, 20);
    const top = isMobile
      ? heroRect.top + heroRect.height * 0.42
      : heroRect.top + heroRect.height - height - heroRect.height * 0.12;
    return { left, top, width, height };
  }

  function slotRect() {
    const r = eyeSlot.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function setEyeVisual({
    opacity,
    blur,
    sink,
    scale,
    diving,
    surfacing,
    docked,
    enchanting,
    orb,
    rotate = 0,
    glow = 0,
    lid = 0,
    sclera = 1,
    orbShow = 0,
  }) {
    if (!eye) return;
    eye.style.setProperty("--eye-opacity", String(opacity));
    eye.style.setProperty("--eye-blur", `${blur}px`);
    eye.style.setProperty("--eye-sink", `${sink}px`);
    eye.style.setProperty("--eye-scale", String(scale));
    eye.style.setProperty("--eye-rotate", `${rotate}deg`);
    eye.style.setProperty("--eye-glow", String(glow));
    eye.style.setProperty("--lid-close", String(lid));
    eye.style.setProperty("--sclera-fade", String(sclera));
    eye.style.setProperty("--orb-show", String(orbShow));
    eye.classList.toggle("is-diving", !!diving);
    eye.classList.toggle("is-surfacing", !!surfacing);
    eye.classList.toggle("is-docked", !!docked);
    eye.classList.toggle("is-enchanting", !!enchanting);
    eye.classList.toggle("is-orb", !!orb);
    header?.classList.toggle("is-eye-docked", !!docked);
  }

  function placeRipple(x, y, on) {
    if (!eyeRipple) return;
    eyeRipple.style.left = `${x}px`;
    eyeRipple.style.top = `${y}px`;
    eyeRipple.classList.toggle("is-on", !!on);
  }

  function applyEyeBox(box) {
    if (!eye) return;
    eye.style.left = `${box.left}px`;
    eye.style.top = `${box.top}px`;
    eye.style.width = `${box.width}px`;
    eye.style.height = `${box.height}px`;
  }

  function quadBezier(p0, p1, p2, t) {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
  }

  function updateEyeDockDesktop(t, from, to) {
    if (t <= DIVE_END) {
      const dive = easeIn(t / DIVE_END);
      const width = lerp(from.width, from.width * 0.35, dive);
      const height = lerp(from.height, from.height * 0.35, dive);
      applyEyeBox({
        left: from.left + (from.width - width) / 2,
        top: from.top,
        width,
        height,
      });
      setEyeVisual({
        opacity: lerp(1, 0, dive),
        blur: lerp(0, 14, dive),
        sink: lerp(0, Math.min(110, from.height * 0.85), dive),
        scale: lerp(1, 0.55, dive),
        diving: dive > 0.12,
        surfacing: false,
        docked: false,
        enchanting: false,
        orb: false,
      });
      placeRipple(
        from.left + from.width / 2,
        from.top + from.height * 0.72 + dive * 36,
        dive > 0.18 && dive < 0.98
      );
      placePortal(0, 0, false);
      return;
    }

    const rise = easeOut((t - DIVE_END) / (1 - DIVE_END));
    applyEyeBox({
      left: to.left,
      top: to.top,
      width: to.width,
      height: to.height,
    });
    setEyeVisual({
      opacity: rise,
      blur: lerp(10, 0, rise),
      sink: lerp(18, 0, rise),
      scale: lerp(0.7, 1, rise),
      diving: false,
      surfacing: rise < 0.98,
      docked: rise > 0.88,
      enchanting: false,
      orb: false,
    });
    placeRipple(to.left + to.width / 2, to.top + to.height / 2, rise > 0.05 && rise < 0.55);
    placePortal(0, 0, false);
  }

  function updateEyeDockMobile(t, from, to) {
    const cx0 = from.left + from.width / 2;
    const cy0 = from.top + from.height / 2;
    const cx1 = to.left + to.width / 2;
    const cy1 = to.top + to.height / 2;
    placeRipple(0, 0, false);

    /* 1) Charge — lids seal, iris ignites */
    if (t <= M_CHARGE) {
      const p = easeInOut(t / M_CHARGE);
      applyEyeBox(from);
      setEyeVisual({
        opacity: 1,
        blur: 0,
        sink: lerp(0, -10, p),
        scale: lerp(1, 1.06, p),
        diving: false,
        surfacing: false,
        docked: false,
        enchanting: true,
        orb: false,
        rotate: lerp(0, -4, p),
        glow: lerp(0.15, 0.85, p),
        lid: lerp(0, 0.92, p),
        sclera: 1,
        orbShow: lerp(0, 0.25, p),
      });
      placePortal(0, 0, false);
      if (p > 0.35 && Math.random() > 0.55) spawnSpellSpark(cx0, cy0, false);
      return;
    }

    /* 2) Collapse — eye becomes a living light orb */
    if (t <= M_COLLAPSE) {
      const p = easeInOut((t - M_CHARGE) / (M_COLLAPSE - M_CHARGE));
      const side = Math.min(from.width, from.height);
      const size = lerp(side, side * 0.42, p);
      applyEyeBox({
        left: cx0 - size / 2,
        top: cy0 - size / 2 - lerp(0, 8, p),
        width: size,
        height: size,
      });
      setEyeVisual({
        opacity: 1,
        blur: lerp(0, 1.5, p),
        sink: 0,
        scale: lerp(1.05, 0.92, p),
        diving: false,
        surfacing: false,
        docked: false,
        enchanting: true,
        orb: p > 0.35,
        rotate: lerp(-4, 18, p),
        glow: lerp(0.85, 1.15, p),
        lid: 1,
        sclera: lerp(1, 0.05, p),
        orbShow: lerp(0.25, 1, p),
      });
      placePortal(cx1, cy1, p > 0.55);
      if (p > 0.2) {
        spellSparkAcc += 1;
        if (spellSparkAcc % 2 === 0) spawnSpellSpark(cx0, cy0, p > 0.75);
      }
      return;
    }

    /* 3) Astral flight — comet arc into the header portal */
    if (t <= M_FLIGHT) {
      const p = easeInOut((t - M_COLLAPSE) / (M_FLIGHT - M_COLLAPSE));
      const ctrl = {
        x: lerp(cx0, cx1, 0.45) + (cx0 < cx1 ? -40 : 40),
        y: Math.min(cy0, cy1) - Math.min(120, window.innerHeight * 0.16),
      };
      const pt = quadBezier({ x: cx0, y: cy0 }, ctrl, { x: cx1, y: cy1 }, p);
      const size = lerp(Math.min(from.width, from.height) * 0.42, Math.max(to.width, to.height) * 1.35, p);
      applyEyeBox({
        left: pt.x - size / 2,
        top: pt.y - size / 2,
        width: size,
        height: size,
      });
      setEyeVisual({
        opacity: 1,
        blur: lerp(1, 0.5, p),
        sink: 0,
        scale: lerp(0.95, 0.7, p),
        diving: false,
        surfacing: false,
        docked: false,
        enchanting: true,
        orb: true,
        rotate: lerp(18, 220, p),
        glow: lerp(1.1, 0.95, p),
        lid: 1,
        sclera: 0,
        orbShow: 1,
      });
      placePortal(cx1, cy1, true);
      spawnSpellSpark(pt.x, pt.y, p > 0.85 && p < 0.95);
      if (Math.random() > 0.35) spawnSpellSpark(pt.x, pt.y, false);
      return;
    }

    /* 4) Materialize — portal blooms, eye reforms in the slot */
    const p = easeOutBack(clamp((t - M_FLIGHT) / (1 - M_FLIGHT), 0, 1));
    const pLin = clamp((t - M_FLIGHT) / (1 - M_FLIGHT), 0, 1);
    applyEyeBox({
      left: to.left,
      top: to.top,
      width: to.width,
      height: to.height,
    });
    setEyeVisual({
      opacity: 1,
      blur: lerp(2, 0, pLin),
      sink: 0,
      scale: lerp(0.55, 1, Math.min(1, p)),
      diving: false,
      surfacing: pLin < 0.9,
      docked: pLin > 0.72,
      enchanting: pLin < 0.95,
      orb: pLin < 0.45,
      rotate: lerp(40, 0, pLin),
      glow: lerp(1, 0.2, pLin),
      lid: lerp(1, 0.12, pLin),
      sclera: lerp(0.1, 1, easeOut(pLin)),
      orbShow: lerp(1, 0, easeIn(pLin)),
    });
    placePortal(cx1, cy1, pLin < 0.7);
    if (pLin < 0.35 && Math.random() > 0.4) spawnSpellSpark(cx1, cy1, true);
  }

  function updateEyeDock() {
    if (!eye || !eyeSlot) return;

    if (!hasHeroEye) {
      applyEyeBox(slotRect());
      setEyeVisual({
        opacity: 1,
        blur: 0,
        sink: 0,
        scale: 1,
        diving: false,
        surfacing: false,
        docked: true,
        enchanting: false,
        orb: false,
      });
      placeRipple(0, 0, false);
      placePortal(0, 0, false);
      return;
    }

    const heroRect = hero.getBoundingClientRect();
    const range = Math.max(hero.offsetHeight * 0.62, window.innerHeight * 0.4);
    const scrolled = clamp(-heroRect.top, 0, range);
    const t = scrolled / range;
    const from = heroStartRect();
    const to = slotRect();

    if (isMobileMQ.matches) {
      updateEyeDockMobile(t, from, to);
    } else {
      updateEyeDockDesktop(t, from, to);
      spellParticles.length = 0;
      if (eyeSpell) {
        const ctx = eyeSpell.getContext("2d");
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
      placePortal(0, 0, false);
    }
  }

  /* Gentle idle look on mobile when no touch */
  let idlePhase = 0;

  function tick(now = performance.now()) {
    if (prefersFine && cursor) {
      cursor.style.transform = `translate(${mx}px, ${my}px)`;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (cursorRing) cursorRing.style.transform = `translate(${rx - mx}px, ${ry - my}px)`;

      if (trailCanvas) {
        const ctx = trailCanvas.getContext("2d");
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.fillStyle = `${p.color}${p.life.toFixed(2)})`;
          ctx.shadowColor = p.color.includes("212") ? "#d4af37" : "#4db6a0";
          ctx.shadowBlur = 8;
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (!prefersFine && eye && !eye.classList.contains("is-docked")) {
      idlePhase = now * 0.001;
      const rect = eye.getBoundingClientRect();
      mx = rect.left + rect.width / 2 + Math.sin(idlePhase) * rect.width * 0.55;
      my = rect.top + rect.height / 2 + Math.cos(idlePhase * 0.8) * rect.height * 0.35;
    }

    updateEyeDock();

    if (isMobileMQ.matches) {
      paintSpellSparks();
    }

    if (eye && ball) {
      const rect = eye.getBoundingClientRect();
      if (rect.width > 0) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = (mx - cx) / (rect.width / 2 || 1);
        let dy = (my - cy) / (rect.height / 2 || 1);
        const len = Math.hypot(dx, dy) || 1;
        if (len > 1) {
          dx /= len;
          dy /= len;
        }
        const look = eye.classList.contains("is-docked")
          ? 0.2
          : eye.classList.contains("is-orb")
            ? 0.08
            : MAX_LOOK;
        const tx = dx * look * rect.width;
        const ty = dy * look * rect.height;
        ball.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      }
    }

    requestAnimationFrame(tick);
  }

  updateEyeDock();
  window.addEventListener("resize", updateEyeDock);
  window.addEventListener("orientationchange", () => setTimeout(updateEyeDock, 120));
  window.addEventListener("st:langchange", () => {
    // Recalculate eye/skill geometry after RTL ↔ LTR swap
    requestAnimationFrame(updateEyeDock);
    setTimeout(updateEyeDock, 80);
  });
  requestAnimationFrame(tick);

  /* ── Flip cards ── */
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      card.classList.toggle("is-flipped");
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("is-flipped");
      }
    });
  });

  /* ── Featured slider ── */
  const slides = [...document.querySelectorAll(".featured__slide")];
  const dots = [...document.querySelectorAll(".featured__dot")];
  let slideIndex = 0;

  const showSlide = (index) => {
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === slideIndex));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === slideIndex));
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));
  if (slides.length) setInterval(() => showSlide(slideIndex + 1), 5500);

  // swipe featured on mobile
  const featured = document.querySelector(".featured");
  if (featured && slides.length) {
    let startX = 0;
    featured.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );
    featured.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 40) return;
        // RTL: swipe right -> previous, left -> next visually feels natural
        showSlide(slideIndex + (dx > 0 ? -1 : 1));
      },
      { passive: true }
    );
  }

  /* ── Portfolio filters ── */
  const filterBtns = [...document.querySelectorAll(".filter-btn")];
  const cards = [...document.querySelectorAll(".work-card")];
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        card.hidden = !(filter === "all" || card.dataset.category === filter);
        if (card.hidden) card.classList.remove("is-flipped");
      });
    });
  });

  /* ── Menu overlay ── */
  const overlay = document.getElementById("nav-overlay");
  const openBtn = document.getElementById("menu-toggle");
  const closeBtn = document.getElementById("menu-close");
  const openMenu = () => {
    overlay?.classList.add("is-open");
    document.body.classList.add("menu-open");
  };
  const closeMenu = () => {
    overlay?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };
  openBtn?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  /* ── Back to top ── */
  const backTop = document.getElementById("back-top");
  window.addEventListener("scroll", () => {
    backTop?.classList.toggle("is-visible", window.scrollY > 500);
  }, { passive: true });
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ── Reveal on scroll ── */
  const revealEls = document.querySelectorAll(".service-card, .flip-card, .cta-band__inner");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = "0.55s ease";
            entry.target.style.opacity = "1";
            if (!entry.target.classList.contains("blog-card")) {
              entry.target.style.transform = "none";
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => {
      el.style.opacity = "0";
      if (!el.classList.contains("blog-card")) el.style.transform = "translateY(18px)";
      io.observe(el);
    });
  }
})();
