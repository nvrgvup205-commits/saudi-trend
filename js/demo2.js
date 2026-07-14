/* سعودي تريند · Demo 2 — Luxury Portal Engine */
(() => {
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloader-fill');
  const gate = document.getElementById('gate');
  const flash = document.getElementById('portal-flash');
  const portals = [...document.querySelectorAll('.portal')];
  const cursor = document.getElementById('cursor');
  const cursorDots = document.getElementById('cursor-dots');
  const modal = document.getElementById('contact-modal');
  const langBtn = document.getElementById('lang-switch');
  const canvas = document.getElementById('bg-canvas');
  const skyflight = document.getElementById('skyflight');
  const ctx = canvas.getContext('2d');

  let activeRealm = null;
  let openTl = null;
  let lang = localStorage.getItem('st-lang') || 'ar';
  let mx = 0, my = 0, lastDot = 0;

  // ===== Bilingual =====
  function applyLang(next) {
    lang = next;
    localStorage.setItem('st-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.lang = lang;

    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val != null) el.textContent = val;
    });

    document.querySelectorAll('[data-ar-placeholder]').forEach(el => {
      el.placeholder = el.getAttribute(lang === 'ar' ? 'data-ar-placeholder' : 'data-en-placeholder') || '';
    });

    document.querySelectorAll('select option[data-ar]').forEach(opt => {
      opt.textContent = opt.getAttribute('data-' + lang);
    });
  }

  applyLang(lang);

  langBtn.addEventListener('click', () => {
    applyLang(lang === 'ar' ? 'en' : 'ar');
    gsap.fromTo(langBtn, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'power3.out' });
  });

  // ===== Preloader =====
  let p = 0;
  const loadTimer = setInterval(() => {
    p = Math.min(100, p + Math.random() * 10 + 3);
    fill.style.width = p + '%';
    if (p >= 100) {
      clearInterval(loadTimer);
      setTimeout(() => {
        preloader.classList.add('done');
        introGate();
      }, 500);
    }
  }, 100);

  // ===== Cursor =====
  const isDesktop = window.matchMedia('(min-width: 769px)').matches;
  if (isDesktop && cursor) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';

      const now = performance.now();
      if (now - lastDot > 50 && cursorDots) {
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

    document.querySelectorAll('a, button, .portal, .flip-card, .btn-glow, .gallery__item, input, select, textarea, .lang-switch').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // Magnetic
  document.querySelectorAll('.magnetic').forEach(el => {
    const s = parseFloat(el.dataset.s) || 0.2;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * s,
        y: (e.clientY - r.top - r.height / 2) * s,
        duration: 0.6, ease: 'power3.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)' });
    });
  });

  // Particles
  let particles = [];
  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  function spawn() {
    particles = [];
    const n = Math.min(40, Math.floor(innerWidth / 30));
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        a: Math.random() * 0.3 + 0.08,
        gold: Math.random() > 0.65
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((pt, i) => {
      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.x < 0) pt.x = canvas.width;
      if (pt.x > canvas.width) pt.x = 0;
      if (pt.y < 0) pt.y = canvas.height;
      if (pt.y > canvas.height) pt.y = 0;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fillStyle = pt.gold ? `rgba(212,175,55,${pt.a})` : `rgba(13,122,84,${pt.a})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(pt.x - q.x, pt.y - q.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(212,175,55,${0.06 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  resize(); spawn(); draw();
  addEventListener('resize', () => { resize(); spawn(); });

  // Intro
  function introGate() {
    gsap.set('.gate .reveal-text', { clearProps: 'all' });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.brand-mark--nav', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo('.gate__actions > *', { y: -12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 }, '-=0.6')
      .fromTo('.gate__eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.5')
      .fromTo('.gate__title .line > span', { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 1.1 }, '-=0.6')
      .fromTo('.gate__sub', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.7')
      .fromTo('.portal', { y: 50, opacity: 0, scale: 0.92 }, {
        y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 1.1
      }, '-=0.6')
      .fromTo('.gate__hint', { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.4');
  }

  // ===== Enter realm (always reaches here) =====
  function enterRealm(id, portalEl) {
    const realm = document.getElementById('realm-' + id);
    if (!realm) {
      activeRealm = null;
      document.body.classList.remove('locked', 'in-realm');
      return;
    }

    activeRealm = id;
    document.body.classList.add('locked', 'in-realm');

    gate.classList.add('hidden');
    gsap.set(gate, { opacity: 0, pointerEvents: 'none' });

    realm.classList.add('active');
    realm.setAttribute('aria-hidden', 'false');
    gsap.set(realm, { opacity: 1, scale: 1, visibility: 'visible', pointerEvents: 'auto' });

    const scroller = realm.querySelector('.realm__scroll');
    if (scroller) scroller.scrollTop = 0;
    realm.querySelectorAll('.flip-card.is-flipped').forEach(c => c.classList.remove('is-flipped'));

    try { animateRealmContent(realm); } catch (err) { console.warn(err); }

    if (portalEl) portalEl.classList.remove('opening');
    portals.forEach(p => gsap.set(p, { opacity: 1, scale: 1, clearProps: 'transform' }));

    if (skyflight) {
      skyflight.classList.remove('active');
      skyflight.setAttribute('aria-hidden', 'true');
      gsap.set(skyflight, { opacity: 0, visibility: 'hidden' });
    }
    if (flash) gsap.set(flash, { opacity: 0 });
  }

  function openRealm(id, portalEl) {
    const realm = document.getElementById('realm-' + id);
    if (!realm) return;
    if (openTl && openTl.isActive()) return;

    portalEl.classList.add('opening');
    document.body.classList.add('locked', 'in-realm');

    portals.forEach(p => {
      if (p !== portalEl) gsap.to(p, { opacity: 0.3, scale: 0.96, duration: 0.5 });
    });

    // Fallback: open without skyflight
    if (!skyflight) {
      enterRealm(id, portalEl);
      return;
    }

    const brand = skyflight.querySelector('.skyflight__brand');
    const clouds = [...skyflight.querySelectorAll('.cloud')];
    const tag = skyflight.querySelector('.skyflight__tag');
    if (tag) tag.textContent = tag.getAttribute('data-' + lang) || tag.textContent;

    const frame = portalEl.querySelector('.portal__frame');
    gsap.killTweensOf([skyflight, brand, ...clouds, frame]);
    gsap.set(clouds, { x: 0, y: 0 });
    gsap.set(brand, { opacity: 0, y: 80, scale: 0.55 });
    gsap.set(skyflight, { opacity: 0, visibility: 'hidden' });

    // Safety timeout — always open even if animation stalls
    const safety = setTimeout(() => {
      if (!document.getElementById('realm-' + id).classList.contains('active')) {
        if (openTl) openTl.kill();
        enterRealm(id, portalEl);
      }
    }, 8000);

    openTl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safety);
        enterRealm(id, portalEl);
      }
    });

    openTl
      .to(frame, { scale: 1.06, duration: 0.45, ease: 'power2.inOut' })
      .add(() => {
        skyflight.classList.add('active');
        skyflight.setAttribute('aria-hidden', 'false');
        gsap.set(skyflight, { visibility: 'visible', display: 'block' });
      })
      .to(skyflight, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to(gate, { opacity: 0, duration: 0.4 }, '<0.1')
      .to(clouds, {
        y: -500,
        duration: 2,
        stagger: 0.06,
        ease: 'power1.inOut'
      }, '-=0.15')
      .to('.skyflight__sun', { y: -24, scale: 1.1, duration: 1.8, ease: 'sine.inOut' }, '-=1.9')
      .to(brand, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }, '-=1.3')
      .to({}, { duration: 0.55 }) // hold brand in sky
      .to(brand, { y: -40, opacity: 0, scale: 1.2, duration: 0.7, ease: 'power2.in' })
      .to(skyflight, { opacity: 0, duration: 0.45 }, '-=0.2');
  }

  function closeRealm() {
    if (!activeRealm) return;
    if (openTl && openTl.isActive()) openTl.kill();

    const id = activeRealm;
    const realm = document.getElementById('realm-' + id);
    if (!realm) {
      activeRealm = null;
      return;
    }

    gsap.timeline({
      onComplete: () => {
        realm.classList.remove('active');
        realm.setAttribute('aria-hidden', 'true');
        gate.classList.remove('hidden');
        document.body.classList.remove('locked', 'in-realm');
        gsap.set(gate, { opacity: 1, clearProps: 'all' });
        gsap.set(realm, { clearProps: 'opacity,scale,visibility,pointerEvents' });
        activeRealm = null;
      }
    })
    .to(flash || realm, { opacity: flash ? 1 : 0, duration: 0.3 })
    .to(realm, { opacity: 0, duration: 0.4 }, '-=0.05')
    .add(() => {
      realm.classList.remove('active');
      gate.classList.remove('hidden');
      gsap.set(gate, { opacity: 0, pointerEvents: 'auto' });
    })
    .to(flash || {}, { opacity: 0, duration: 0.4 })
    .to(gate, { opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.25')
    .fromTo('.portal', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7 }, '-=0.4');
  }

  // Bind portal clicks
  portals.forEach(portal => {
    portal.addEventListener('click', (e) => {
      e.preventDefault();
      if (activeRealm) return;
      if (openTl && openTl.isActive()) return;
      const id = portal.getAttribute('data-section');
      if (!id) return;
      openRealm(id, portal);
    });
  });

  document.querySelectorAll('.realm__back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeRealm();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('open')) closeModal();
      else if (activeRealm) closeRealm();
    }
  });

  // Flip cards
  function bindFlips(scope) {
    scope.querySelectorAll('.flip-card').forEach(card => {
      if (card.dataset.bound) return;
      card.dataset.bound = '1';
      const flip = () => {
        const was = card.classList.contains('is-flipped');
        card.closest('.flip-grid')?.querySelectorAll('.flip-card.is-flipped').forEach(c => {
          if (c !== card) c.classList.remove('is-flipped');
        });
        card.classList.toggle('is-flipped', !was);
        gsap.fromTo(card, { scale: 0.97 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.55)' });
      };
      card.addEventListener('click', (e) => { e.stopPropagation(); flip(); });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });
  }
  bindFlips(document);

  function animateRealmContent(realm) {
    applyLang(lang);
    const scrollRoot = realm.querySelector('.realm__scroll');
    const reveals = [...realm.querySelectorAll('.reveal-text')];
    gsap.set(reveals, { opacity: 0, y: 36 });

    gsap.to(realm.querySelectorAll('.realm__logo, .realm__label, .realm__title, .realm__desc'), {
      opacity: 1, y: 0, stagger: 0.15, duration: 1.1, ease: 'power3.out', delay: 0.15
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.to(entry.target, {
          opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          delay: Number(entry.target.dataset.delay || 0)
        });
        io.unobserve(entry.target);
      });
    }, { root: scrollRoot, threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach((el, i) => {
      el.dataset.delay = (i % 4) * 0.06;
      io.observe(el);
    });

    bindFlips(realm);
  }

  // Modal
  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    applyLang(lang);
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.open-contact').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  });
  modal.querySelector('.modal__backdrop').addEventListener('click', closeModal);
  modal.querySelector('.modal__close').addEventListener('click', closeModal);

  document.getElementById('demo2-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const done = lang === 'ar' ? 'تم الإرسال ✓' : 'Sent ✓';
    const sending = lang === 'ar' ? 'جاري الإرسال...' : 'Sending...';
    const orig = btn.getAttribute('data-' + lang) || btn.textContent;
    btn.textContent = sending;
    setTimeout(() => {
      btn.textContent = done;
      setTimeout(() => {
        e.target.reset();
        btn.textContent = orig;
        closeModal();
      }, 1500);
    }, 900);
  });
})();
