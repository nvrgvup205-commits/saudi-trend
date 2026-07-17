(() => {
  const skills = [
    "تصميم الهوية التجارية",
    "برمجة المواقع والمتاجر الإلكترونية",
    "تهيئة محركات البحث (SEO)",
    "تصميم الفيديو والموشن جرافيك",
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
      }, 250);
    }, 2800);
  }

  // Featured slider
  const slides = [...document.querySelectorAll(".featured__slide")];
  const dots = [...document.querySelectorAll(".featured__dot")];
  let slideIndex = 0;

  const showSlide = (index) => {
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === slideIndex));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === slideIndex));
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showSlide(i));
  });

  if (slides.length) {
    setInterval(() => showSlide(slideIndex + 1), 5500);
  }

  // Portfolio filters
  const filterBtns = [...document.querySelectorAll(".filter-btn")];
  const cards = [...document.querySelectorAll(".work-card")];

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.hidden = !match;
      });
    });
  });

  // Menu overlay
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

  // Back to top
  const backTop = document.getElementById("back-top");
  window.addEventListener("scroll", () => {
    backTop?.classList.toggle("is-visible", window.scrollY > 500);
  });
  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Reveal on scroll
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
