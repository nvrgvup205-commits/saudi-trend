(() => {
  const prefersFine = window.matchMedia("(pointer: fine)").matches;

  /* ── Skills rotator ── */
  const skills = [
    "تصميم الهوية التجارية",
    "برمجة المواقع والمتاجر الإلكترونية",
    "تهيئة محركات البحث (SEO)",
    "تصميم الفيديو والموشن جرافيك",
    "إدارة الحملات الإعلانية",
  ];
  const skillEl = document.getElementById("hero-skill");
  let skillIndex = 0;
  if (skillEl) {
    setInterval(() => {
      skillEl.classList.add("is-fading");
      setTimeout(() => {
        skillIndex = (skillIndex + 1) % skills.length;
        skillEl.textContent = skills[skillIndex];
        skillEl.classList.remove("is-fading");
      }, 220);
    }, 2600);
  }

  /* ── Magic cursor + particle trail ── */
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

  /* ── Eye: scroll-dock into header + follow mouse ── */
  const eye = document.getElementById("site-eye");
  const ball = document.getElementById("eye-ball");
  const eyeSlot = document.getElementById("eye-slot");
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const hasHeroEye = document.body.classList.contains("has-hero-eye") && !!hero;
  const MAX_LOOK = 0.32;

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function heroStartRect() {
    const heroRect = hero.getBoundingClientRect();
    const ww = window.innerWidth;
    const isMobile = ww <= 720;
    const width = isMobile ? Math.min(ww * 0.72, 280) : Math.min(ww * 0.22, 400);
    const height = width / 2.15;
    const left = isMobile ? (ww - width) / 2 : Math.max(ww * 0.06, 20);
    const top = isMobile
      ? heroRect.top + heroRect.height * 0.58
      : heroRect.top + heroRect.height - height - heroRect.height * 0.12;
    return { left, top, width, height };
  }

  function slotRect() {
    const r = eyeSlot.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function applyEyeBox(box, docked) {
    if (!eye) return;
    eye.style.left = `${box.left}px`;
    eye.style.top = `${box.top}px`;
    eye.style.width = `${box.width}px`;
    eye.style.height = `${box.height}px`;
    eye.classList.toggle("is-docked", docked);
    header?.classList.toggle("is-eye-docked", docked);
  }

  function updateEyeDock() {
    if (!eye || !eyeSlot) return;

    if (!hasHeroEye) {
      applyEyeBox(slotRect(), true);
      return;
    }

    const heroRect = hero.getBoundingClientRect();
    const scrollable = Math.max(hero.offsetHeight * 0.75, window.innerHeight * 0.45);
    const scrolled = clamp(-heroRect.top, 0, scrollable);
    const t = easeInOut(scrolled / scrollable);
    const from = heroStartRect();
    const to = slotRect();
    applyEyeBox(
      {
        left: lerp(from.left, to.left, t),
        top: lerp(from.top, to.top, t),
        width: lerp(from.width, to.width, t),
        height: lerp(from.height, to.height, t),
      },
      t > 0.92
    );
  }

  function tick() {
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
        const look = eye.classList.contains("is-docked") ? 0.22 : MAX_LOOK;
        const tx = dx * look * rect.width;
        const ty = dy * look * rect.height;
        ball.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      }
    }

    requestAnimationFrame(tick);
  }

  updateEyeDock();
  window.addEventListener("resize", updateEyeDock);
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
  });
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
            entry.target.style.transform = entry.target.classList.contains("blog-card")
              ? ""
              : "none";
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
