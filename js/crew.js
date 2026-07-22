(() => {
  /* Mouse/trackpad only — tablets & phones use free eye motion */
  const eyeFollowMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobileMQ = window.matchMedia("(max-width: 720px)");

  /* ── Why Us: one sentence rises bottom → top (same on all screens) ── */
  const whyTicker = document.getElementById("why-ticker");
  const whyLine = document.getElementById("why-ticker-line");
  const WHY_FALLBACK = [
    "أفكارنا غير… وهذا فرقنا",
    "متمكّنين من شغلنا — مو كلام فاضي",
    "ننفّذ أي فكرة… حرفيًا",
    "عقود مرنة، والتفاوض لمصلحتك",
    "القيمة أولًا — قبل أي رقم",
    "نشتغل على مشروعك كأنه مشروعنا",
    "نتائج تِبان… مو وعود تطير",
    "عقود واضحة من أوّل يوم — بلا لخبطة",
    "بنكتب اللي اتفقنا عليه… ونلتزم فيه",
    "ضمانات ذهبية على جودة التنفيذ",
    "لو فيه خلل منّا — نصلّحه، مو نتهرّب",
    "مراحل العمل مضمونة بجدول واضح",
    "تدفع على مراحل… وأنت مرتاح",
    "حقوقك محفوظة في العقد — مو كلام طيب",
    "نراجع العقد معك كلمة بكلمة",
    "التزام بالمواعيد… هذا أساسنا",
    "ضمان متابعة بعد التسليم",
    "شفافية كاملة في التكاليف والبنود",
    "ما في مفاجآت بعد التوقيع",
    "ضمان ذهبي: شغل يستاهل اسمك",
    "العقد يحميك… وإحنا نحترم توقيعنا",
    "ضمانات مكتوبة — مو وعود بالهوا",
    "نضمن النتيجة المتفق عليها",
    "خدمة بعد المشروع… موجودة وما تختفي",
  ];
  const skillsFor = () => {
    const fromI18n =
      window.ST_I18N && typeof window.ST_I18N.skills === "function"
        ? window.ST_I18N.skills(window.ST_I18N.getLang())
        : null;
    return fromI18n && fromI18n.length ? fromI18n : WHY_FALLBACK;
  };

  let whyIndex = 0;
  let whyTimer = 0;
  let whyBusy = false;
  const reduceWhyMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showWhyLine = (text, animateIn) => {
    if (!whyLine) return;
    whyLine.textContent = text;
    whyLine.classList.remove("is-out");
    if (!animateIn || reduceWhyMotion) {
      whyLine.classList.add("is-in");
      return;
    }
    whyLine.classList.remove("is-in");
    /* force reflow so enter transition runs */
    void whyLine.offsetWidth;
    whyLine.classList.add("is-in");
  };

  const advanceWhy = () => {
    if (!whyLine || whyBusy) return;
    const skills = skillsFor();
    if (!skills.length) return;
    whyBusy = true;
    whyTicker?.classList.add("is-changing");

    const finishIn = () => {
      whyIndex = (whyIndex + 1) % skills.length;
      showWhyLine(skills[whyIndex], true);
      window.setTimeout(() => {
        whyTicker?.classList.remove("is-changing");
        whyBusy = false;
      }, 420);
    };

    if (reduceWhyMotion) {
      finishIn();
      return;
    }

    whyLine.classList.remove("is-in");
    whyLine.classList.add("is-out");
    window.setTimeout(finishIn, 380);
  };

  const startWhyRotate = () => {
    if (whyTimer) window.clearInterval(whyTimer);
    whyTimer = 0;
    if (!whyLine) return;
    const skills = skillsFor();
    whyIndex = Math.max(0, skills.indexOf(whyLine.textContent.trim()));
    if (whyIndex < 0) whyIndex = 0;
    showWhyLine(skills[whyIndex] || WHY_FALLBACK[0], true);
    whyTimer = window.setInterval(advanceWhy, 3200);
  };

  if (whyLine) {
    startWhyRotate();
    window.addEventListener("st:langchange", () => {
      whyIndex = 0;
      startWhyRotate();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (whyTimer) window.clearInterval(whyTimer);
        whyTimer = 0;
      } else {
        startWhyRotate();
      }
    });
  }

  /* Native OS cursor — brand tint via CSS; drop heavy custom cursor DOM */
  document.getElementById("cursor-trail")?.remove();
  document.getElementById("cursor")?.remove();
  document.body.classList.remove("has-custom-cursor");
  document.body.classList.add("has-brand-cursor");

  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.45;

  if (eyeFollowMouse) {
    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );
  }

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

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIn = (t) => t * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function clearSpellFX() {
    if (eyeSpell) {
      const ctx = eyeSpell.getContext("2d");
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    if (eyePortal) eyePortal.classList.remove("is-on");
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

  /* Locked viewport box — never follows the scrolling anchor */
  let frozenEyeBox = null;

  function captureFrozenEye(box) {
    frozenEyeBox = {
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    };
  }

  /* Mobile: 100% fixed while dissolving — only opacity/blur/water change */
  function updateEyeDockMobile(t, rest, to) {
    clearSpellFX();
    const diveEnd = 0.52;
    const smooth = (x) => easeInOut(clamp(x, 0, 1));
    const box = rest || to;

    if (t <= diveEnd) {
      const p = smooth(t / diveEnd);
      applyEyeBox(box);
      const opacity = 1 - p;
      const blur = lerp(0.85, 5.5, p);
      setEyeVisual({
        opacity,
        blur,
        sink: 0,
        scale: 1,
        diving: p > 0.01,
        surfacing: false,
        docked: false,
        enchanting: false,
        orb: false,
        rotate: 0,
        glow: 0,
        lid: lerp(0, 0.45, p),
        sclera: 1,
        orbShow: 0,
      });
      if (eye) {
        eye.style.setProperty("--water-opacity", String(lerp(0.25, 1, p)));
        eye.style.setProperty("--rise", "0");
        eye.style.setProperty("--eye-sink", "0px");
        eye.style.visibility = opacity < 0.02 ? "hidden" : "visible";
      }
      placeRipple(
        box.left + box.width / 2,
        box.top + box.height * 0.72,
        p > 0.08 && p < 0.95
      );
      return;
    }

    /* Resurface in header — same water blur language */
    const p = smooth((t - diveEnd) / (1 - diveEnd));
    applyEyeBox(to);
    if (eye) {
      eye.style.visibility = "visible";
      eye.style.setProperty("--water-opacity", String(lerp(1, 0, p)));
      eye.style.setProperty("--rise", String(p));
      eye.style.setProperty("--eye-sink", "0px");
    }
    setEyeVisual({
      opacity: p,
      blur: lerp(5.5, 0, p),
      sink: 0,
      scale: 1,
      diving: false,
      surfacing: p < 0.96,
      docked: p > 0.82,
      enchanting: false,
      orb: false,
      rotate: 0,
      glow: 0,
      lid: lerp(0.4, 0.08, p),
      sclera: 1,
      orbShow: 0,
    });
    placeRipple(
      to.left + to.width / 2,
      to.top + to.height / 2,
      p > 0.02 && p < 0.7
    );
  }

  let eyeTSmooth = 0;

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
        rotate: 0,
        glow: 0,
        lid: 0,
        sclera: 1,
        orbShow: 0,
      });
      if (eye) eye.style.visibility = "visible";
      placeRipple(0, 0, false);
      clearSpellFX();
      return;
    }

    const heroRect = hero.getBoundingClientRect();
    /* Fast dissolve range — fade only, never move with page scroll */
    const range = Math.max(hero.offsetHeight * 0.08, window.innerHeight * 0.06, 48);
    const scrolled = clamp(-heroRect.top, 0, range);
    const targetT = clamp(scrolled / range, 0, 1);
    eyeTSmooth += (targetT - eyeTSmooth) * 0.22;
    if (Math.abs(targetT - eyeTSmooth) < 0.001) eyeTSmooth = targetT;
    const t = eyeTSmooth;
    const from = heroStartRect();
    const to = slotRect();

    /* Hard-pin on real scroll: 0% movement while fading */
    if (scrolled <= 1) {
      captureFrozenEye(from);
    } else if (!frozenEyeBox) {
      captureFrozenEye(from);
    }
    updateEyeDockMobile(t, frozenEyeBox, to);
  }

  /* Mobile/tablet: free varying gaze (no touch tracking) */
  let idlePhase = 0;

  function tick(now = performance.now()) {
    if (!eyeFollowMouse && eye) {
      idlePhase = now * 0.001;
      const rect = eye.getBoundingClientRect();
      if (rect.width > 0) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const amp = eye.classList.contains("is-docked") ? 0.38 : 0.62;
        mx =
          cx +
          (Math.sin(idlePhase * 0.7) * 0.55 +
            Math.sin(idlePhase * 1.35 + 1.2) * 0.35 +
            Math.cos(idlePhase * 0.45 + 0.4) * 0.25) *
            rect.width *
            amp;
        my =
          cy +
          (Math.cos(idlePhase * 0.55) * 0.4 +
            Math.sin(idlePhase * 1.1 + 2.1) * 0.35 +
            Math.cos(idlePhase * 0.9 + 0.8) * 0.2) *
            rect.height *
            amp;
      }
    }

    updateEyeDock();

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
        const look = eye.classList.contains("is-docked") ? 0.2 : MAX_LOOK;
        const tx = dx * look * rect.width;
        const ty = dy * look * rect.height;
        ball.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      }
    }

    requestAnimationFrame(tick);
  }

  updateEyeDock();
  window.addEventListener("resize", () => {
    frozenEyeBox = null;
    updateEyeDock();
  });
  window.addEventListener("orientationchange", () => {
    frozenEyeBox = null;
    setTimeout(updateEyeDock, 120);
  });
  window.addEventListener("st:langchange", () => {
    // Recalculate eye/skill geometry after RTL ↔ LTR swap
    requestAnimationFrame(updateEyeDock);
    setTimeout(updateEyeDock, 80);
  });
  requestAnimationFrame(tick);

  /* ── SAUDI TREND: calm sequential free-fall (wide poster type) ── */
  (() => {
    const title = document.getElementById("hero-title");
    if (!title) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = ["SAUDI", "TREND"];
    title.textContent = "";
    title.setAttribute("aria-label", "SAUDI TREND");
    title.setAttribute("dir", "ltr");

    const letters = [];
    words.forEach((word, lineIndex) => {
      const line = document.createElement("span");
      line.className = "hero__title-line";
      line.setAttribute("dir", "ltr");
      [...word].forEach((ch, charIndex) => {
        const span = document.createElement("span");
        span.className = "hero__title-char";
        span.textContent = ch;
        line.appendChild(span);
        const order = lineIndex * 5 + charIndex;
        letters.push({
          el: span,
          /* Higher start + gentle stagger = calm, readable sequence */
          y: -(260 + charIndex * 22 + lineIndex * 48),
          vy: 0,
          delay: 0.18 + order * 0.16,
          age: 0,
          settled: false,
          bounces: 0,
        });
      });
      title.appendChild(line);
    });

    const xScale = 1.08;
    const paint = (L) => {
      L.el.style.transform = `translate3d(0, ${L.y.toFixed(2)}px, 0) scaleX(${xScale})`;
    };

    if (reduceMotion) {
      letters.forEach((L) => {
        L.y = 0;
        L.settled = true;
        paint(L);
        L.el.classList.add("is-settled");
      });
      return;
    }

    /* Softer gravity + longer hang = impressive, not rushed */
    const G = 980;
    const REST = 0;
    const RESTITUTION = 0.22;
    const FRICTION = 0.78;
    const SETTLE_V = 18;
    let last = performance.now();

    function step(now) {
      const rawDt = (now - last) / 1000;
      last = now;
      /* Cap dt but keep motion silky on fast refresh rates */
      const dt = Math.min(0.028, Math.max(0.008, rawDt));
      let moving = false;

      for (const L of letters) {
        if (L.settled) continue;
        moving = true;
        L.age += dt;
        if (L.age < L.delay) {
          paint(L);
          continue;
        }

        /* Ease into gravity so the first frames feel weighty, not snapped */
        const fallAge = L.age - L.delay;
        const gScale = Math.min(1, fallAge / 0.35);
        L.vy += G * gScale * dt;
        /* Soft terminal feel — never runaway speed */
        L.vy = Math.min(L.vy, 920);
        L.y += L.vy * dt;

        if (L.y >= REST) {
          L.y = REST;
          L.vy = -L.vy * RESTITUTION;
          L.bounces += 1;
          if (L.bounces > 1) L.vy *= FRICTION;
          if (Math.abs(L.vy) < SETTLE_V || L.bounces >= 3) {
            L.y = REST;
            L.vy = 0;
            L.settled = true;
            L.el.classList.add("is-settled");
          }
        }

        paint(L);
      }

      if (moving) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  })();

  /* ── Flip cards (blog/work only — services use full sheet) ── */
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".flip-card");
    if (!card || card.classList.contains("service-flip") || e.target.closest("a")) return;
    card.classList.toggle("is-flipped");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".flip-card");
    if (!card || card.classList.contains("service-flip")) return;
    e.preventDefault();
    card.classList.toggle("is-flipped");
  });

  /* ── Services: all cards visible in a grid + full-size sheet ── */
  (() => {
    const film = document.getElementById("services-film");
    const track = document.getElementById("services-track");
    if (!film || !track) return;

    film.classList.add("is-grid", "is-paused");

    const cards = [...track.querySelectorAll(".service-flip")];
    if (!cards.length) return;

    /* Ensure every service image is loaded — all cards are visible */
    track.querySelectorAll(".flip-card__img").forEach((img) => {
      const src = img.getAttribute("src") || img.dataset.src || "";
      if (src) {
        img.dataset.src = src;
        if (!img.getAttribute("src")) img.src = src;
      }
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
      img.setAttribute("draggable", "false");
    });

    const sheet = document.getElementById("svc-sheet");
    const sheetPanel = document.getElementById("svc-sheet-panel");
    const sheetClose = document.getElementById("svc-sheet-close");
    let openCard = null;

    const closeSheet = () => {
      if (!sheet) return;
      sheet.hidden = true;
      document.body.classList.remove("svc-sheet-open");
      openCard?.classList.remove("is-sheet-open");
      openCard = null;
    };

    const openSheet = (card) => {
      if (!sheet || !sheetPanel || !card) return;
      if (openCard === card) {
        closeSheet();
        return;
      }
      const back = card.querySelector(".service-flip__back, .flip-card__back");
      const title = card.querySelector(".flip-card__title")?.textContent?.trim() || "";
      if (!back) return;
      openCard?.classList.remove("is-sheet-open");
      openCard = card;
      card.classList.add("is-sheet-open");
      sheetPanel.innerHTML = `
        <h3 class="svc-sheet__title" id="svc-sheet-title">${title}</h3>
        <div class="svc-sheet__content">${back.innerHTML}</div>
      `;
      sheet.hidden = false;
      document.body.classList.add("svc-sheet-open");
    };

    sheetClose?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSheet();
    });
    sheet?.addEventListener("click", (e) => {
      if (e.target === sheet) closeSheet();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSheet();
    });

    cards.forEach((card) => {
      card.classList.add("is-active");
      card.classList.remove("is-flipped", "is-near", "is-popped");
      card.style.transform = "";
      card.style.opacity = "1";
      card.style.visibility = "visible";
      card.style.zIndex = "";
      card.tabIndex = 0;
      card.setAttribute("aria-hidden", "false");
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        e.preventDefault();
        openSheet(card);
      });
    });
  })();

  /* ── Partners: 3D standing pages, infinite ring ── */
  (() => {
    const stage = document.getElementById("partner-stage");
    const ring = document.getElementById("partner-ring");
    if (!stage || !ring) return;

    const pages = [...ring.querySelectorAll(".partner-page")];
    const n = pages.length;
    if (!n) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepDeg = 360 / n;
    let rot = 0;
    let vel = 0;
    let targetRot = null;
    let dragging = false;
    let dragMoved = false;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    /* Manual only — no continuous auto-spin */
    let auto = false;
    let holdTimer = 0;
    let frontIndex = 0;

    const norm180 = (deg) => {
      let a = ((deg % 360) + 360) % 360;
      if (a > 180) a -= 360;
      return a;
    };

    const radiusFor = () => {
      const w = window.innerWidth;
      /* Tighter ring so several partner pages stay visible at rest */
      if (w < 640) return 200;
      if (w < 980) return 250;
      return 310;
    };

    const paint = () => {
      const radius = radiusFor();
      stage.style.setProperty("--partner-radius", `${radius}px`);
      ring.style.setProperty("--ring-rot", `${rot}deg`);

      const bend = Math.max(-12, Math.min(12, vel * 2));
      let best = 0;
      let bestFacing = -2;

      pages.forEach((page, i) => {
        const slot = i * stepDeg;
        const world = slot + rot;
        const a = norm180(world);
        const facing = Math.cos((a * Math.PI) / 180);
        page.style.setProperty("--slot", String(slot));
        page.style.setProperty("--facing", facing.toFixed(3));
        page.style.setProperty("--bend", `${(bend * Math.max(0.2, Math.abs(facing))).toFixed(2)}deg`);
        page.classList.toggle("is-front", false);
        page.classList.toggle("is-near", Math.abs(a) < stepDeg * 0.9 && facing > 0.15);
        page.tabIndex = -1;
        if (facing > bestFacing) {
          bestFacing = facing;
          best = i;
        }
      });

      frontIndex = best;
      const front = pages[frontIndex];
      front.classList.add("is-front");
      front.classList.remove("is-near");
      front.tabIndex = 0;
    };

    const needsAnim = () => {
      if (dragging || targetRot != null || Math.abs(vel) > 0.002 || auto) return true;
      const target = -frontIndex * stepDeg;
      return Math.abs(norm180(target - rot)) > 0.2;
    };

    const tick = (ts) => {
      if (!lastT) lastT = ts;
      const dt = Math.min(32, ts - lastT) / 16.67;
      lastT = ts;

      if (!dragging) {
        if (targetRot != null) {
          const diff = norm180(targetRot - rot);
          if (Math.abs(diff) < 0.35) {
            rot = targetRot;
            targetRot = null;
            vel = 0;
          } else {
            rot += diff * Math.min(1, 0.16 * dt);
            vel = diff * 0.05;
          }
        } else if (Math.abs(vel) > 0.002) {
          rot += vel * dt;
          vel *= Math.pow(0.92, dt);
        } else if (auto) {
          vel = 0;
          rot -= 0.1 * dt;
        } else {
          const target = -frontIndex * stepDeg;
          const diff = norm180(target - rot);
          if (Math.abs(diff) > 0.2) rot += diff * 0.1 * dt;
          else vel = 0;
        }
      }

      paint();
      if (needsAnim()) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        lastT = 0;
      }
    };

    const kick = () => {
      if (!raf) {
        lastT = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const pauseAuto = () => {
      auto = false;
      clearTimeout(holdTimer);
    };

    const stepBy = (dir) => {
      const next = (frontIndex - dir + n) % n;
      targetRot = -next * stepDeg;
      vel = 0;
      pauseAuto();
      kick();
    };

    /* Kill native image-drag ghost that steals the carousel gesture */
    stage.addEventListener("dragstart", (e) => e.preventDefault());
    pages.forEach((page) => {
      page.setAttribute("draggable", "false");
      page.querySelectorAll("img").forEach((img) => {
        img.setAttribute("draggable", "false");
        img.draggable = false;
      });
    });

    const onDown = (e) => {
      if (e.target.closest(".partner-stage__nav")) return;
      /* Always own the gesture so the browser never starts an image drag */
      if (e.pointerType !== "touch") e.preventDefault();
      dragging = true;
      dragMoved = false;
      targetRot = null;
      stage.classList.add("is-dragging");
      lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      vel = 0;
      pauseAuto();
      kick();
      try {
        stage.setPointerCapture?.(e.pointerId);
      } catch (_) {}
    };

    const onMove = (e) => {
      if (!dragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? lastX;
      const dx = x - lastX;
      lastX = x;
      if (Math.abs(dx) > 3) dragMoved = true;
      const delta = dx * 0.32;
      rot += delta;
      vel = delta * 0.4;
      paint();
    };

    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      try {
        stage.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
      if (dragMoved) {
        const block = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          stage.removeEventListener("click", block, true);
        };
        stage.addEventListener("click", block, true);
        /* snap to nearest after drag */
        targetRot = -frontIndex * stepDeg;
      }
      pauseAuto();
      kick();
    };

    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    stage.querySelectorAll(".partner-stage__nav").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = Number(btn.getAttribute("data-dir") || 1);
        stepBy(dir);
      });
      btn.addEventListener("pointerdown", (e) => e.stopPropagation());
    });

    pages.forEach((page) => {
      page.addEventListener("click", (e) => {
        if (dragMoved) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (!page.classList.contains("is-front")) {
          e.preventDefault();
          e.stopPropagation();
          const i = pages.indexOf(page);
          targetRot = -i * stepDeg;
          vel = 0;
          pauseAuto();
          kick();
          return;
        }
        /* Front page: open the partner site reliably */
        e.preventDefault();
        e.stopPropagation();
        pauseAuto();
        const href = page.getAttribute("href");
        if (href) window.open(href, "_blank", "noopener,noreferrer");
      });
    });

    window.addEventListener("resize", paint);
    paint();
    requestAnimationFrame(paint);

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting);
        if (vis) paint();
        if (!vis && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          lastT = 0;
        }
      },
      { threshold: 0.08 }
    );
    io.observe(stage);
  })();

  /* ── Featured slider (01–06) ── */
  const slides = [...document.querySelectorAll(".featured__slide")];
  const dots = [...document.querySelectorAll(".featured__dot")];
  let slideIndex = 0;

  const showSlide = (index) => {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === slideIndex));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === slideIndex));
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));
  if (slides.length) setInterval(() => showSlide(slideIndex + 1), 5500);

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
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      io.observe(el);
    });
  }
})();
