/* سعودي تريند · Demo 2 — Luxury Portal Engine (slow + bilingual + flips) */
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

    // Select options
    document.querySelectorAll('select option[data-ar]').forEach(opt => {
      opt.textContent = opt.getAttribute('data-' + lang);
    });
  }

  applyLang(lang);

  langBtn.addEventListener('click', () => {
    applyLang(lang === 'ar' ? 'en' : 'ar');
    gsap.fromTo(langBtn, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: 'power3.out' });
  });

  // ===== Preloader (slower) =====
  let p = 0;
  const loadTimer = setInterval(() => {
    p = Math.min(100, p + Math.random() * 8 + 2);
    fill.style.width = p + '%';
    if (p >= 100) {
      clearInterval(loadTimer);
      setTimeout(() => {
        preloader.classList.add('done');
        introGate();
      }, 700);
    }
  }, 120);

  // ===== Signature cursor (golden arrow + sparkle dots) =====
  const isDesktop = window.matchMedia('(min-width: 769px)').matches;
  if (isDesktop && cursor) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';

      const now = performance.now();
      if (now - lastDot > 45 && cursorDots) {
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

    const hoverSel = 'a, button, .portal, .flip-card, .btn-glow, .gallery__item, input, select, textarea, .lang-switch';
    document.querySelectorAll(hoverSel).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // Magnetic (gentler)
  document.querySelectorAll('.magnetic').forEach(el => {
    const s = parseFloat(el.dataset.s) || 0.2;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * s,
        y: (e.clientY - r.top - r.height / 2) * s,
        duration: 0.7, ease: 'power3.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' });
    });
  });

  // ===== Soft gold/green particles =====
  let particles = [];
  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  function spawn() {
    particles = [];
    const n = Math.min(45, Math.floor(innerWidth / 28));
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.35 + 0.08,
        gold: Math.random() > 0.65
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold
        ? `rgba(212,175,55,${p.a})`
        : `rgba(13,122,84,${p.a})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(212,175,55,${0.07 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  resize(); spawn(); draw();
  addEventListener('resize', () => { resize(); spawn(); });

  // ===== Slow intro =====
  function introGate() {
    // Clear CSS reveal state so fromTo can land on visible
    gsap.set('.gate .reveal-text', { clearProps: 'all' });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.brand-mark--nav', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
      .fromTo('.gate__actions > *', { y: -16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1 }, '-=0.8')
      .fromTo('.gate__eyebrow', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, '-=0.6')
      .fromTo('.gate__title .line > span', { y: 70, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.18, duration: 1.3 }, '-=0.7')
      .fromTo('.gate__sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.9')
      .fromTo('.portal', {
        y: 60, opacity: 0, scale: 0.9
      }, {
        y: 0, opacity: 1, scale: 1,
        stagger: 0.18, duration: 1.35, transformPerspective: 900
      }, '-=0.75')
      .fromTo('.gate__hint', { opacity: 0 }, { opacity: 1, duration: 0.9 }, '-=0.55');

    portals.forEach((portal, i) => {
      gsap.to(portal.querySelector('.portal__frame'), {
        y: i % 2 === 0 ? -6 : 6,
        duration: 4 + i * 0.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: i * 0.4
      });
    });
  }

  // ===== Portal open / close (slower) =====
  portals.forEach(portal => {
    portal.addEventListener('click', () => {
      if (activeRealm) return;
      openRealm(portal.dataset.section, portal);
    });
  });

  function openRealm(id, portalEl) {
    const realm = document.getElementById('realm-' + id);
    if (!realm) return;
    activeRealm = id;
    portalEl.classList.add('opening');
    document.body.classList.add('locked', 'in-realm');

    portals.forEach(p => {
      if (p !== portalEl) gsap.to(p, { opacity: 0.2, scale: 0.94, duration: 0.8, ease: 'power2.out' });
    });

    // Prepare skyflight bilingual tag
    const tag = skyflight.querySelector('.skyflight__tag');
    if (tag) tag.textContent = tag.getAttribute('data-' + lang) || tag.textContent;

    const brand = skyflight.querySelector('.skyflight__brand');
    const clouds = skyflight.querySelectorAll('.cloud');

    gsap.set(skyflight, { opacity: 0 });
    gsap.set(brand, { opacity: 0, y: 80, scale: 0.55 });
    gsap.set(clouds, { x: 0, clearProps: false });

    const tl = gsap.timeline({
      onComplete: () => {
        gate.classList.add('hidden');
        realm.classList.add('active');
        realm.setAttribute('aria-hidden', 'false');
        gsap.set(realm, { opacity: 1, scale: 1 });
        realm.querySelector('.realm__scroll').scrollTop = 0;
        realm.querySelectorAll('.flip-card.is-flipped').forEach(c => c.classList.remove('is-flipped'));
        animateRealmContent(realm);
        portalEl.classList.remove('opening');
        gsap.set(portals, { opacity: 1, scale: 1, clearProps: 'transform' });
        skyflight.classList.remove('active');
        skyflight.setAttribute('aria-hidden', 'true');
        gsap.set(skyflight, { opacity: 0 });
        gsap.set(flash, { opacity: 0 });
      }
    });

    tl.to(portalEl.querySelector('.portal__frame'), { scale: 1.12, duration: 0.7, ease: 'power2.inOut' })
      .add(() => {
        skyflight.classList.add('active');
        skyflight.setAttribute('aria-hidden', 'false');
      })
      .to(skyflight, { opacity: 1, duration: 0.85, ease: 'power2.inOut' }, '-=0.15')
      .to(gate, { opacity: 0, duration: 0.6 }, '-=0.7')
      // Fly through clouds
      .to(clouds, {
        y: (i) => -window.innerHeight * (0.45 + i * 0.08),
        x: (i) => (i % 2 === 0 ? 120 : -140),
        duration: 2.8,
        ease: 'power1.inOut',
        stagger: 0.05
      }, '-=0.4')
      .to('.skyflight__sun', { y: -40, scale: 1.15, duration: 2.4, ease: 'sine.inOut' }, '-=2.6')
      // Brand flies in above the clouds
      .to(brand, {
        opacity: 1, y: 0, scale: 1,
        duration: 1.6,
        ease: 'power3.out'
      }, '-=2.1')
      .to(brand, { scale: 1.08, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '-=0.4')
      // Descend into realm
      .to(brand, { y: -60, opacity: 0, scale: 1.35, duration: 1.1, ease: 'power2.in' })
      .to(skyflight, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.35');
  }

  function closeRealm() {
    if (!activeRealm) return;
    const realm = document.getElementById('realm-' + activeRealm);

    gsap.timeline({
      onComplete: () => {
        realm.classList.remove('active');
        realm.setAttribute('aria-hidden', 'true');
        gate.classList.remove('hidden');
        document.body.classList.remove('locked', 'in-realm');
        gsap.set(gate, { opacity: 1, scale: 1, clearProps: 'all' });
        gsap.set(realm, { clearProps: 'opacity,scale' });
        activeRealm = null;
      }
    })
    .to(flash, { opacity: 1, duration: 0.4 })
    .to(realm, { opacity: 0, scale: 0.97, duration: 0.5 }, '-=0.1')
    .add(() => {
      realm.classList.remove('active');
      gate.classList.remove('hidden');
      gsap.set(gate, { opacity: 0 });
    })
    .to(flash, { opacity: 0, duration: 0.7 })
    .to(gate, { opacity: 1, duration: 0.85, ease: 'power3.out' }, '-=0.4')
    .fromTo('.portal', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'power3.out' }, '-=0.5');
  }

  document.querySelectorAll('.realm__back').forEach(btn => {
    btn.addEventListener('click', closeRealm);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('open')) closeModal();
      else if (activeRealm) closeRealm();
    }
  });

  // ===== Flip cards (magical click) =====
  function bindFlips(scope) {
    scope.querySelectorAll('.flip-card').forEach(card => {
      if (card.dataset.bound) return;
      card.dataset.bound = '1';

      const flip = () => {
        const was = card.classList.contains('is-flipped');
        // close others in same grid
        card.closest('.flip-grid')?.querySelectorAll('.flip-card.is-flipped').forEach(c => {
          if (c !== card) c.classList.remove('is-flipped');
        });
        card.classList.toggle('is-flipped', !was);

        // sparkle punch
        gsap.fromTo(card, { scale: 0.96 }, {
          scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.55)'
        });
      };

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        flip();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flip();
        }
      });
    });
  }
  bindFlips(document);

  // ===== Realm text & image entrances (IntersectionObserver + GSAP) =====
  function animateRealmContent(realm) {
    applyLang(lang); // refresh texts inside realm

    const scrollRoot = realm.querySelector('.realm__scroll');
    const reveals = [...realm.querySelectorAll('.reveal-text')];

    // reset
    gsap.set(reveals, { opacity: 0, y: 40 });

    // hero cascade
    gsap.to(realm.querySelectorAll('.realm__logo, .realm__label, .realm__title, .realm__desc'), {
      opacity: 1, y: 0, stagger: 0.18, duration: 1.3, ease: 'power3.out', delay: 0.25
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        gsap.to(el, {
          opacity: 1, y: 0,
          duration: 1.25,
          ease: 'power3.out',
          delay: Number(el.dataset.delay || 0)
        });
        io.unobserve(el);
      });
    }, { root: scrollRoot, threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el, i) => {
      // skip those already animated in hero if needed
      el.dataset.delay = (i % 4) * 0.08;
      io.observe(el);
    });

    // gallery image drift
    realm.querySelectorAll('.gallery__item img, .split__visual img').forEach((img, i) => {
      gsap.fromTo(img,
        { scale: 1.12, opacity: 0.6 },
        {
          scale: 1, opacity: 1, duration: 2, ease: 'power2.out', delay: 0.3 + i * 0.1,
          scrollTrigger: undefined
        }
      );
    });

    bindFlips(realm);

    // mild parallax
    const onScroll = () => {
      const st = scrollRoot.scrollTop;
      realm.querySelectorAll('.gallery__item, .split__visual').forEach((el, i) => {
        el.style.transform = `translateY(${st * (0.02 + i * 0.005)}px)`;
      });
    };
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===== Modal =====
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
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
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
      gsap.fromTo(btn, { scale: 0.96 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      setTimeout(() => {
        e.target.reset();
        btn.textContent = orig;
        closeModal();
      }, 1800);
    }, 1200);
  });

  // Portal glow slow hover
  portals.forEach(portal => {
    const glow = portal.querySelector('.portal__glow');
    portal.addEventListener('mouseenter', () => {
      gsap.to(glow, { opacity: 1, scale: 1.15, duration: 1.1, ease: 'power2.out' });
    });
    portal.addEventListener('mouseleave', () => {
      gsap.to(glow, { opacity: 0.4, scale: 1, duration: 1.2, ease: 'power2.out' });
    });
  });
})();
