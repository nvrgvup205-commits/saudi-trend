/* سعودي تريند — الكلاسيكية المبهرة · محرك الحركة */
(() => {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const cursor = document.getElementById('cursor');
  const cursorDots = document.getElementById('cursor-dots');
  const aurora = document.getElementById('classic-aurora');
  const contactForm = document.getElementById('contact-form');
  const heroImg = document.querySelector('.hero__media img');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 769px)').matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Nav ──
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      navToggle.classList.toggle('active');
      header?.classList.toggle('is-menu-open');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('show');
      navToggle?.classList.remove('active');
      header?.classList.remove('is-menu-open');
    });
  });

  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // Active section link
  const sections = document.querySelectorAll('section[id]');
  const updateActiveLink = () => {
    const y = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const h = section.offsetHeight;
      const id = section.getAttribute('id');
      if (y >= top && y < top + h) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Demo 2 cursor + sparkle trail ──
  let mx = 0;
  let my = 0;
  let lastDot = 0;

  if (isDesktop && cursor) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';

      const now = performance.now();
      if (now - lastDot > 48 && cursorDots) {
        lastDot = now;
        const d = document.createElement('i');
        d.style.left = mx + 'px';
        d.style.top = my + 'px';
        cursorDots.appendChild(d);
        setTimeout(() => d.remove(), 700);
      }
    });

    document.addEventListener('mousedown', () => cursor.classList.add('is-click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('is-click'));

    const hoverTargets =
      'a, button, .btn, .magnetic, .domain, .service-card, .about__card, .process__step, .why-us__metric, input, select, textarea';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');
        if (window.SaudiSound) SaudiSound.tick();
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // ── Magnetic buttons ──
  document.querySelectorAll('.magnetic').forEach((el) => {
    const s = parseFloat(el.dataset.s) || 0.22;
    el.addEventListener('mousemove', (e) => {
      if (!window.gsap) return;
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * s,
        y: (e.clientY - r.top - r.height / 2) * s,
        duration: 0.55,
        ease: 'power3.out',
      });
    });
    el.addEventListener('mouseleave', () => {
      if (!window.gsap) return;
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)' });
    });
  });

  // ── Classical aurora background ──
  if (aurora && isDesktop && !reduceMotion) {
    const ctx = aurora.getContext('2d');
    let w = 0;
    let h = 0;
    let t = 0;
    const ribbons = [];

    const resize = () => {
      w = aurora.width = window.innerWidth;
      h = aurora.height = window.innerHeight;
    };

    const seed = () => {
      ribbons.length = 0;
      for (let i = 0; i < 5; i++) {
        ribbons.push({
          y: h * (0.15 + i * 0.16),
          amp: 28 + i * 10,
          freq: 0.0012 + i * 0.00025,
          speed: 0.35 + i * 0.08,
          gold: i % 2 === 0,
          alpha: 0.05 + i * 0.012,
        });
      }
    };

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      // soft classical wash
      const g = ctx.createRadialGradient(w * 0.2, h * 0.15, 0, w * 0.2, h * 0.15, w * 0.55);
      g.addColorStop(0, 'rgba(15, 81, 50, 0.07)');
      g.addColorStop(1, 'rgba(15, 81, 50, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.85, h * 0.7, 0, w * 0.85, h * 0.7, w * 0.45);
      g2.addColorStop(0, 'rgba(184, 146, 58, 0.08)');
      g2.addColorStop(1, 'rgba(184, 146, 58, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      ribbons.forEach((r) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const y =
            r.y +
            Math.sin(x * r.freq + t * r.speed) * r.amp +
            Math.sin(x * r.freq * 2.1 - t * 0.5) * (r.amp * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = r.gold
          ? `rgba(184, 146, 58, ${r.alpha})`
          : `rgba(15, 81, 50, ${r.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });

      // floating golden dust
      for (let i = 0; i < 24; i++) {
        const px = (Math.sin(t * 0.4 + i * 1.7) * 0.5 + 0.5) * w;
        const py = ((t * 12 + i * 73) % (h + 40)) - 20;
        ctx.beginPath();
        ctx.arc(px, py, 1.1 + (i % 3) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 176, 106, ${0.12 + (i % 4) * 0.04})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    resize();
    seed();
    draw();
    window.addEventListener('resize', () => {
      resize();
      seed();
    });
  }

  // ── Elegant hero lexicon — curated constellation + entrance ──
  const lexiconRoot = document.getElementById('hero-lexicon');
  const LEXICON = [
    { text: 'استراتيجية', tone: 'gold', x: 7,  y: 22, size: 1.45, from: 'left' },
    { text: 'تميّز',       tone: 'mist', x: 46, y: 13, size: 1.2,  from: 'top' },
    { text: 'هوية',        tone: 'gold', x: 78, y: 17, size: 1.35, from: 'top' },
    { text: 'حضور',        tone: 'jade', x: 18, y: 38, size: 1.0,  from: 'left' },
    { text: 'إبداع',       tone: 'mist', x: 88, y: 34, size: 1.1,  from: 'right' },
    { text: 'نمو',         tone: 'gold', x: 10, y: 58, size: 1.3,  from: 'left' },
    { text: 'موشن',        tone: 'mist', x: 82, y: 54, size: 0.95, from: 'right' },
    { text: 'أتمتة',       tone: 'jade', x: 14, y: 76, size: 1.2,  from: 'bottom' },
    { text: 'فيديو',       tone: 'mist', x: 90, y: 72, size: 1.05, from: 'right' },
    { text: 'تكامل',       tone: 'jade', x: 36, y: 82, size: 0.95, from: 'bottom' },
    { text: 'رؤية',        tone: 'gold', x: 28, y: 18, size: 1.05, from: 'top' },
    { text: 'كفاءة',       tone: 'jade', x: 62, y: 78, size: 0.9,  from: 'bottom' },
  ];

  function mountLexicon() {
    if (!lexiconRoot) return [];
    lexiconRoot.innerHTML = '';
    const narrow = window.innerWidth < 768;
    const list = narrow ? LEXICON.filter((_, i) => i % 2 === 0) : LEXICON;
    return list.map((item) => {
      const el = document.createElement('span');
      el.className = `hero__word hero__word--${item.tone}`;
      el.textContent = item.text;
      el.style.left = item.x + '%';
      el.style.top = item.y + '%';
      el.style.fontSize = `clamp(${0.85 * item.size}rem, ${2.1 * item.size}vw, ${1.55 * item.size}rem)`;
      el.dataset.from = item.from;
      lexiconRoot.appendChild(el);
      return el;
    });
  }

  const lexiconWords = mountLexicon();

  // ── GSAP entrance + scroll reveals ──
  if (window.gsap && !reduceMotion) {
    if (window.SaudiSound) {
      setTimeout(() => SaudiSound.boot(), 400);
    }

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero__eyebrow', { y: 24, opacity: 0, duration: 0.8 }, 0.05)
      .from('.hero__brand', { y: 50, opacity: 0, duration: 1.15 }, 0.15)
      .from('.hero__rule', { scaleX: 0, opacity: 0, duration: 0.7, transformOrigin: '100% 50%' }, 0.45)
      .from('.hero__title', { y: 36, opacity: 0, duration: 0.95 }, 0.5)
      .from('.hero__description', { y: 28, opacity: 0, duration: 0.85 }, 0.65)
      .from('.hero__buttons', { y: 24, opacity: 0, duration: 0.8 }, 0.8)
      .from('.hero__scroll', { opacity: 0, duration: 0.7 }, 1.1);

    // Signature lexicon entrance — drift in from composure axes, then soft float
    lexiconWords.forEach((el, i) => {
      const from = el.dataset.from;
      const dist = 48 + (i % 3) * 10;
      const startX = from === 'left' ? -dist : from === 'right' ? dist : (i % 2 ? 12 : -12);
      const startY = from === 'top' ? -dist : from === 'bottom' ? dist : 28;
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.86, xPercent: -50, yPercent: -50, x: startX, y: startY },
        {
          opacity: 1,
          scale: 1,
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          duration: 1.55,
          delay: 0.55 + i * 0.09,
          ease: 'expo.out',
          onComplete: () => {
            gsap.to(el, {
              y: (i % 2 ? -1 : 1) * (6 + (i % 4)),
              x: (i % 3 ? 1 : -1) * (4 + (i % 3)),
              duration: 4.5 + (i % 5) * 0.45,
              yoyo: true,
              repeat: -1,
              ease: 'sine.inOut',
            });
          },
        }
      );
    });

    if (heroImg) {
      gsap.to(heroImg, {
        scale: 1.14,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    gsap.utils.toArray('.domain').forEach((panel) => {
      const img = panel.querySelector('.domain__media img');
      const copy = panel.querySelector('.domain__copy');
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12, y: 40 },
          {
            scale: 1.05,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
      if (copy) {
        gsap.from(copy.children, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        });
      }
    });

    gsap.utils.toArray('.about__card, .service-card, .process__step, .why-us__feature, .why-us__metric').forEach((el, i) => {
      gsap.from(el, {
        y: 36,
        opacity: 0,
        duration: 0.8,
        delay: (i % 3) * 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });
  } else {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    lexiconWords.forEach((el) => {
      el.style.opacity = '0.55';
    });
  }

  // ── Contact form ──
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (!submitBtn) return;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'جاري الإرسال...';
      submitBtn.disabled = true;
      if (window.SaudiSound) SaudiSound.confirm();

      setTimeout(() => {
        submitBtn.textContent = 'تم الإرسال بنجاح ✓';
        submitBtn.style.background = 'linear-gradient(135deg, #1a6b45, #0a3a24)';
        setTimeout(() => {
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
        }, 2800);
      }, 1200);
    });
  }
})();
