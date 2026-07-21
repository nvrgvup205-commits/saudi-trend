(() => {
  const prefersFine = window.matchMedia("(pointer: fine)").matches;
  const isMobileMQ = window.matchMedia("(max-width: 720px)");

  /* ── Why-us rotator (bilingual) ── */
  const skillEl = document.getElementById("hero-skill");
  const whyWrap = document.getElementById("why-wrap");
  const whyUs = document.getElementById("why-us");
  let skillIndex = 0;
  const skillsFor = () =>
    window.ST_I18N
      ? window.ST_I18N.skills(window.ST_I18N.getLang())
      : [
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
  if (skillEl) {
    const paintSkill = () => {
      const skills = skillsFor();
      skillEl.textContent = skills[skillIndex % skills.length];
    };
    paintSkill();
    setInterval(() => {
      skillEl.classList.add("is-fading");
      setTimeout(() => {
        skillIndex = (skillIndex + 1) % skillsFor().length;
        paintSkill();
        skillEl.classList.remove("is-fading");
      }, 220);
    }, 2800);
    window.addEventListener("st:langchange", () => {
      skillIndex = 0;
      paintSkill();
    });
  }

  /* ── Light cursor (no particle trail — performance) ── */
  const cursor = document.getElementById("cursor");
  const cursorRing = cursor?.querySelector(".cursor__ring");
  const trailCanvas = document.getElementById("cursor-trail");
  trailCanvas?.remove();
  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.45;
  let rx = mx;
  let ry = my;

  if (prefersFine && cursor) {
    document.body.classList.add("has-custom-cursor");
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.add("is-on");
    }, { passive: true });
    window.addEventListener("mousedown", () => cursor.classList.add("is-click"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-click"));
    document.querySelectorAll("a, button, .flip-card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  } else {
    document.body.classList.remove("has-custom-cursor");
    cursor?.remove();
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

  /* Mobile only: approach blur → pin centered under header */
  let whyBlurSmooth = 0;
  let whyFadeSmooth = 1;
  const WHY_APPROACH = 96;

  function updateWhyPin() {
    if (!whyWrap || !whyUs || !header) return;

    /* Laptop: stay fixed bottom-right — no header docking */
    if (!isMobileMQ.matches) {
      whyUs.classList.remove("is-pinned");
      whyWrap.style.height = "";
      document.body.classList.remove("why-pinned");
      whyBlurSmooth = 0;
      whyFadeSmooth = 1;
      whyUs.style.setProperty("--why-blur", "0px");
      whyUs.style.setProperty("--why-fade", "1");
      return;
    }

    const pinY = header.getBoundingClientRect().bottom + 6;
    const pinned = whyUs.classList.contains("is-pinned");
    let targetBlur = 0;
    let targetFade = 1;

    if (!pinned) {
      const top = whyUs.getBoundingClientRect().top;
      const dist = top - pinY;
      if (dist < WHY_APPROACH) {
        const t = clamp(1 - dist / WHY_APPROACH, 0, 1);
        const soft = t * t * (3 - 2 * t);
        targetBlur = soft * 7;
        targetFade = lerp(1, 0.22, soft);
      }
      if (top <= pinY) {
        whyWrap.style.height = `${whyUs.offsetHeight}px`;
        whyUs.classList.add("is-pinned");
        document.body.classList.add("why-pinned");
        whyBlurSmooth = Math.max(whyBlurSmooth, 5);
        whyFadeSmooth = Math.min(whyFadeSmooth, 0.3);
      }
    } else {
      targetBlur = 0;
      targetFade = 1;
      if (whyWrap.getBoundingClientRect().top > pinY) {
        whyUs.classList.remove("is-pinned");
        whyWrap.style.height = "";
        document.body.classList.remove("why-pinned");
      }
    }

    whyBlurSmooth += (targetBlur - whyBlurSmooth) * 0.11;
    whyFadeSmooth += (targetFade - whyFadeSmooth) * 0.1;
    if (Math.abs(targetBlur - whyBlurSmooth) < 0.02) whyBlurSmooth = targetBlur;
    if (Math.abs(targetFade - whyFadeSmooth) < 0.005) whyFadeSmooth = targetFade;

    whyUs.style.setProperty("--why-blur", `${whyBlurSmooth.toFixed(2)}px`);
    whyUs.style.setProperty("--why-fade", whyFadeSmooth.toFixed(3));
  }

  /* Adaptive pill contrast + mobile glass tint from colors behind */
  let whyInvertSmooth = 0;
  let whyGlass = { r: 14, g: 42, b: 34 };
  const whyLabel = whyUs?.querySelector(".hero__skill-label");

  function parseRgba(str) {
    if (!str || str === "transparent") return null;
    const m = str.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/i);
    if (!m) return null;
    return {
      r: +m[1],
      g: +m[2],
      b: +m[3],
      a: m[4] === undefined ? 1 : +m[4],
    };
  }

  function lumaOf(rgb) {
    return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  }

  function sampleBackdrop(el) {
    const fallback = { r: 12, g: 40, b: 32, luma: 0.12 };
    if (!el) return fallback;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return fallback;
    const pts = [
      [r.left + r.width * 0.5, r.top + r.height * 0.5],
      [r.left + r.width * 0.18, r.top + r.height * 0.5],
      [r.left + r.width * 0.82, r.top + r.height * 0.5],
      [r.left + r.width * 0.5, r.top + 3],
      [r.left + r.width * 0.5, r.bottom - 3],
    ];
    let sr = 0;
    let sg = 0;
    let sb = 0;
    let sl = 0;
    let n = 0;
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
      const stack = document.elementsFromPoint(x, y);
      for (const node of stack) {
        if (!node || node === whyUs || whyUs.contains(node)) continue;
        if (node === eye || eye?.contains(node)) continue;
        if (node.classList?.contains("eye-ripple")) continue;
        const cs = getComputedStyle(node);
        const bg = parseRgba(cs.backgroundColor);
        if (bg && bg.a > 0.12) {
          sr += bg.r;
          sg += bg.g;
          sb += bg.b;
          sl += lumaOf(bg);
          n += 1;
          break;
        }
        const fg = parseRgba(cs.color);
        if (fg && fg.a > 0.5 && lumaOf(fg) > 0.82 && (cs.fontWeight >= 600 || node.matches("button, .btn, .featured__badge"))) {
          sr += fg.r;
          sg += fg.g;
          sb += fg.b;
          sl += 0.88;
          n += 1;
          break;
        }
      }
    }
    if (!n) return fallback;
    return { r: sr / n, g: sg / n, b: sb / n, luma: sl / n };
  }

  let whyContrastTick = 0;
  function updateWhyContrast() {
    if (!whyUs || !whyLabel) return;
    whyContrastTick = (whyContrastTick + 1) % 4; // every 4th frame
    if (whyContrastTick !== 0) return;
    const sample = sampleBackdrop(whyLabel);
    let target = 0;
    if (sample.luma > 0.55) target = 1;
    else if (sample.luma > 0.38) target = (sample.luma - 0.38) / (0.55 - 0.38);
    whyInvertSmooth += (target - whyInvertSmooth) * 0.045;
    if (Math.abs(target - whyInvertSmooth) < 0.002) whyInvertSmooth = target;
    whyUs.style.setProperty("--why-invert", whyInvertSmooth.toFixed(4));

    /* Glass tint follows colors passing behind (mobile + laptop) */
    whyGlass.r += (sample.r - whyGlass.r) * 0.055;
    whyGlass.g += (sample.g - whyGlass.g) * 0.055;
    whyGlass.b += (sample.b - whyGlass.b) * 0.055;
    whyUs.style.setProperty(
      "--why-glass",
      `${Math.round(whyGlass.r)}, ${Math.round(whyGlass.g)}, ${Math.round(whyGlass.b)}`
    );
  }
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

  /* Gentle idle look on mobile when no touch */
  let idlePhase = 0;

  function tick(now = performance.now()) {
    if (prefersFine && cursor) {
      cursor.style.transform = `translate(${mx}px, ${my}px)`;
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      if (cursorRing) cursorRing.style.transform = `translate(${rx - mx}px, ${ry - my}px)`;
    } else if (!prefersFine && eye && !eye.classList.contains("is-docked")) {
      idlePhase = now * 0.001;
      const rect = eye.getBoundingClientRect();
      mx = rect.left + rect.width / 2 + Math.sin(idlePhase) * rect.width * 0.55;
      my = rect.top + rect.height / 2 + Math.cos(idlePhase * 0.8) * rect.height * 0.35;
    }

    updateEyeDock();
    updateWhyPin();
    updateWhyContrast();

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

  /* ── Flip cards (delegation so film-strip clones work) ── */
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".flip-card");
    if (!card || e.target.closest("a")) return;
    card.classList.toggle("is-flipped");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".flip-card");
    if (!card) return;
    e.preventDefault();
    card.classList.toggle("is-flipped");
  });

  /* ── Services: 3D cinema projector coverflow (infinite) ── */
  (() => {
    const film = document.getElementById("services-film");
    const track = document.getElementById("services-track");
    if (!film || !track) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cards = [...track.querySelectorAll(".service-flip")];
    const n = cards.length;
    if (!n) return;

    let index = 0;
    let offset = 0;
    let vel = 0;
    let dragging = false;
    let dragMoved = false;
    let hovering = false;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    let auto = !reduceMotion;
    let holdTimer = 0;
    let autoAcc = 0;
    const AUTO_MS = 3200;

    const wrapIndex = (i) => ((i % n) + n) % n;

    const shortest = (from, to) => {
      let d = to - from;
      while (d > n / 2) d -= n;
      while (d < -n / 2) d += n;
      return d;
    };

    const metrics = () => {
      const w = window.innerWidth;
      if (w < 640) return { spacing: 118, depth: 160, rot: 38, lift: 10, scaleStep: 0.1 };
      if (w < 980) return { spacing: 150, depth: 200, rot: 42, lift: 12, scaleStep: 0.09 };
      return { spacing: 178, depth: 240, rot: 46, lift: 14, scaleStep: 0.085 };
    };

    const anyFlipped = () => cards.some((c) => c.classList.contains("is-flipped"));

    const syncPausedClass = () => {
      const paused = hovering || dragging || anyFlipped() || !auto;
      film.classList.toggle("is-paused", paused);
    };

    const paint = () => {
      const m = metrics();
      const center = index + offset;

      cards.forEach((card, i) => {
        const raw = shortest(center, i);
        const abs = Math.abs(raw);
        const x = raw * m.spacing;
        const z = 80 - abs * m.depth;
        const ry = raw * -m.rot;
        const rx = abs * 4;
        const y = abs * m.lift;
        const scale = Math.max(0.55, 1 - abs * m.scaleStep);
        const visible = abs < 3.2;

        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scale})`;
        card.style.zIndex = String(Math.round(40 - abs * 8));
        card.style.opacity = visible ? String(Math.max(0.2, 1 - abs * 0.28)) : "0";
        card.style.visibility = visible ? "visible" : "hidden";
        card.classList.toggle("is-active", abs < 0.45);
        card.classList.toggle("is-near", abs >= 0.45 && abs < 1.35);
        card.classList.toggle("is-popped", abs < 0.45);
        card.tabIndex = abs < 0.45 ? 0 : -1;
        card.setAttribute("aria-hidden", abs < 0.45 ? "false" : "true");
        if (abs >= 0.45) card.classList.remove("is-flipped");
      });
    };

    const resumeAutoSoon = (ms = 2800) => {
      if (reduceMotion) return;
      auto = false;
      syncPausedClass();
      clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        if (!dragging && !hovering && !anyFlipped()) {
          auto = true;
          autoAcc = 0;
          syncPausedClass();
        }
      }, ms);
    };

    const snap = () => {
      index = wrapIndex(Math.round(index + offset));
      offset = 0;
      vel = 0;
      paint();
    };

    const stepBy = (dir) => {
      cards.forEach((c) => c.classList.remove("is-flipped"));
      index = wrapIndex(index + dir);
      offset = 0;
      vel = 0;
      autoAcc = 0;
      paint();
      resumeAutoSoon(3200);
    };

    const tick = (ts) => {
      if (!lastT) lastT = ts;
      const dtMs = Math.min(32, ts - lastT);
      const dt = dtMs / 16.67;
      lastT = ts;

      const flipped = anyFlipped();

      if (!dragging) {
        if (Math.abs(vel) > 0.001) {
          offset += vel * dt;
          vel *= Math.pow(0.9, dt);
          if (Math.abs(offset) >= 1) {
            index = wrapIndex(index + Math.round(offset));
            offset -= Math.round(offset);
          }
          if (Math.abs(vel) < 0.002) snap();
        } else if (Math.abs(offset) > 0.001) {
          offset *= Math.pow(0.82, dt);
          if (Math.abs(offset) < 0.02) snap();
        } else if (auto && !hovering && !flipped) {
          /* Discrete auto-advance — works on mobile without interaction */
          autoAcc += dtMs;
          if (autoAcc >= AUTO_MS) {
            autoAcc = 0;
            index = wrapIndex(index + 1);
            offset = 0;
            cards.forEach((c) => c.classList.remove("is-flipped"));
          }
        }
      }

      syncPausedClass();
      paint();
      raf = requestAnimationFrame(tick);
    };

    const onDown = (e) => {
      if (e.target.closest(".film-stage__nav")) return;
      if (e.target.closest("a")) return;
      if (e.target.closest(".service-flip.is-active") && e.pointerType === "mouse") {
        resumeAutoSoon(5000);
        return;
      }
      dragging = true;
      dragMoved = false;
      lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      vel = 0;
      auto = false;
      film.classList.add("is-dragging");
      syncPausedClass();
      try {
        film.setPointerCapture?.(e.pointerId);
      } catch (_) {}
    };

    const onMove = (e) => {
      if (!dragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      if (x == null) return;
      const dx = x - lastX;
      lastX = x;
      if (Math.abs(dx) > 3) dragMoved = true;
      offset -= dx / (metrics().spacing * 1.05);
      while (offset > 0.5) {
        offset -= 1;
        index = wrapIndex(index - 1);
      }
      while (offset < -0.5) {
        offset += 1;
        index = wrapIndex(index + 1);
      }
      vel = -dx / 400;
      paint();
    };

    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      film.classList.remove("is-dragging");
      try {
        film.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
      if (dragMoved) {
        const block = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          film.removeEventListener("click", block, true);
        };
        film.addEventListener("click", block, true);
      }
      snap();
      /* Mobile + desktop: always return to auto after a short pause */
      resumeAutoSoon(2600);
    };

    /* Desktop: pause while mouse rests on the stage */
    if (finePointer) {
      film.addEventListener("pointerenter", () => {
        hovering = true;
        syncPausedClass();
      });
      film.addEventListener("pointerleave", () => {
        hovering = false;
        if (!dragging && !anyFlipped() && !reduceMotion) {
          auto = true;
          autoAcc = 0;
        }
        syncPausedClass();
      });
    }

    film.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    film.querySelectorAll(".film-stage__nav").forEach((btn) => {
      btn.addEventListener("pointerdown", (e) => e.stopPropagation());
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        stepBy(Number(btn.getAttribute("data-dir") || 1));
      });
    });

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (dragMoved) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (!card.classList.contains("is-active")) {
          e.preventDefault();
          e.stopPropagation();
          const i = cards.indexOf(card);
          index = i;
          offset = 0;
          autoAcc = 0;
          paint();
          resumeAutoSoon(3600);
          return;
        }
        /* flipped card pauses auto until unflipped */
        requestAnimationFrame(() => {
          if (anyFlipped()) {
            auto = false;
            syncPausedClass();
          } else {
            resumeAutoSoon(2000);
          }
        });
      });
    });

    window.addEventListener("resize", paint);
    paint();
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && !raf) {
          lastT = 0;
          autoAcc = 0;
          if (!reduceMotion && !hovering && !anyFlipped()) auto = true;
          raf = requestAnimationFrame(tick);
        }
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          lastT = 0;
        }
      },
      { threshold: 0.1 }
    );
    io.observe(film);
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
    let auto = !reduceMotion;
    let holdTimer = 0;
    let frontIndex = 0;

    const norm180 = (deg) => {
      let a = ((deg % 360) + 360) % 360;
      if (a > 180) a -= 360;
      return a;
    };

    const radiusFor = () => {
      const w = window.innerWidth;
      if (w < 640) return 250;
      if (w < 980) return 300;
      return 380;
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
      raf = requestAnimationFrame(tick);
    };

    const pauseAuto = (ms = 3200) => {
      auto = false;
      clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        if (!dragging && !reduceMotion) auto = true;
      }, ms);
    };

    const stepBy = (dir) => {
      const next = (frontIndex - dir + n) % n;
      targetRot = -next * stepDeg;
      vel = 0;
      pauseAuto(4500);
    };

    const onDown = (e) => {
      if (e.target.closest(".partner-stage__nav")) return;
      /* Allow simple clicks on front page to open without starting a drag fight */
      if (e.target.closest(".partner-page.is-front") && e.pointerType !== "touch") {
        pauseAuto(5000);
        return;
      }
      dragging = true;
      dragMoved = false;
      targetRot = null;
      stage.classList.add("is-dragging");
      lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      vel = 0;
      pauseAuto(4500);
      if (e.pointerType !== "touch") stage.setPointerCapture?.(e.pointerId);
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
      pauseAuto(4000);
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
          return;
        }
        if (!page.classList.contains("is-front")) {
          e.preventDefault();
          const i = pages.indexOf(page);
          targetRot = -i * stepDeg;
          vel = 0;
          pauseAuto(4500);
          return;
        }
        /* front page: let the browser open the link (new tab) */
        pauseAuto(5000);
      });
    });

    window.addEventListener("resize", paint);
    paint();
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting);
        if (!vis && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          lastT = 0;
        } else if (vis && !raf) {
          lastT = 0;
          raf = requestAnimationFrame(tick);
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
