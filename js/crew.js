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

  /* ── Custom cursor ── */
  const cursor = document.getElementById("cursor");
  const cursorRing = cursor?.querySelector(".cursor__ring");
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
    });
    window.addEventListener("mousedown", () => cursor.classList.add("is-click"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-click"));
    document.querySelectorAll("a, button, .filter-btn, .featured__dot").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  } else {
    document.body.classList.remove("has-custom-cursor");
    cursor?.remove();
  }

  /* ── Eye follows mouse ── */
  const eye = document.getElementById("hero-eye");
  const ball = document.getElementById("eye-ball");
  const MAX_LOOK = 0.32;

  function tick() {
    if (prefersFine && cursor) {
      cursor.style.transform = `translate(${mx}px, ${my}px)`;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (cursorRing) {
        cursorRing.style.transform = `translate(${rx - mx}px, ${ry - my}px)`;
      }
    }

    if (eye && ball) {
      const rect = eye.getBoundingClientRect();
      const inView = rect.bottom > 0 && rect.top < window.innerHeight;
      if (inView) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = (mx - cx) / (rect.width / 2);
        let dy = (my - cy) / (rect.height / 2);
        const len = Math.hypot(dx, dy) || 1;
        if (len > 1) {
          dx /= len;
          dy /= len;
        }
        const tx = dx * MAX_LOOK * rect.width;
        const ty = dy * MAX_LOOK * rect.height;
        ball.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

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
  const revealEls = document.querySelectorAll(".service-card, .work-card, .blog-card, .cta-band__inner");
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
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      io.observe(el);
    });
  }
})();
