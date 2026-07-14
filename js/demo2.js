/* سعودي تريند · Demo 2 — Portal Engine */
(() => {
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloader-fill');
  const gate = document.getElementById('gate');
  const flash = document.getElementById('portal-flash');
  const portals = document.querySelectorAll('.portal');
  const realms = document.querySelectorAll('.realm');
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  const modal = document.getElementById('contact-modal');
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let activeRealm = null;
  let mx = 0, my = 0, rx = 0, ry = 0;

  // ===== Preloader =====
  let p = 0;
  const loadTimer = setInterval(() => {
    p = Math.min(100, p + Math.random() * 18 + 6);
    fill.style.width = p + '%';
    if (p >= 100) {
      clearInterval(loadTimer);
      setTimeout(() => {
        preloader.classList.add('done');
        introGate();
      }, 350);
    }
  }, 80);

  // ===== Cursor =====
  const isDesktop = window.matchMedia('(min-width: 769px)').matches;
  if (isDesktop) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });
    (function follow() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(follow);
    })();

    const hoverSel = 'a, button, .portal, .feat, .folder, .auto-card, .btn-glow, input, select, textarea';
    document.querySelectorAll(hoverSel).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  // ===== Magnetic =====
  document.querySelectorAll('.magnetic').forEach(el => {
    const s = parseFloat(el.dataset.s) || 0.3;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * s,
        y: (e.clientY - r.top - r.height / 2) * s,
        duration: 0.35, ease: 'power2.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    });
  });

  // ===== Canvas particles (Saudi green) =====
  let particles = [];
  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  function spawn() {
    particles = [];
    const n = Math.min(60, Math.floor(innerWidth / 22));
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        a: Math.random() * 0.4 + 0.1
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
      ctx.fillStyle = `rgba(13,122,79,${p.a})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(13,122,79,${0.1 * (1 - d / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  resize(); spawn(); draw();
  addEventListener('resize', () => { resize(); spawn(); });

  // ===== Intro =====
  function introGate() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.gate__logo', { y: -30, opacity: 0, duration: 0.8 })
      .from('.gate__links a', { y: -20, opacity: 0, stagger: 0.08, duration: 0.6 }, '-=0.5')
      .from('.gate__eyebrow', { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
      .from('.gate__title .line > span', { y: 100, opacity: 0, stagger: 0.12, duration: 1 }, '-=0.4')
      .from('.gate__sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
      .from('.portal', {
        y: 80, opacity: 0, scale: 0.85, rotateX: 15,
        stagger: 0.15, duration: 1, transformPerspective: 800
      }, '-=0.4')
      .from('.gate__hint', { opacity: 0, duration: 0.6 }, '-=0.3');

    // Continuous subtle sway on portals
    portals.forEach((portal, i) => {
      gsap.to(portal.querySelector('.portal__frame'), {
        y: i % 2 === 0 ? -8 : 8,
        duration: 2.5 + i * 0.3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: i * 0.2
      });
    });
  }

  // ===== Open Portal =====
  portals.forEach(portal => {
    portal.addEventListener('click', () => {
      if (activeRealm) return;
      const id = portal.dataset.section;
      openRealm(id, portal);
    });
  });

  function openRealm(id, portalEl) {
    const realm = document.getElementById('realm-' + id);
    if (!realm) return;

    activeRealm = id;
    portalEl.classList.add('opening');
    document.body.classList.add('locked', 'in-realm');

    // Other portals fade away
    portals.forEach(p => {
      if (p !== portalEl) gsap.to(p, { opacity: 0, scale: 0.9, duration: 0.4 });
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gate.classList.add('hidden');
        realm.classList.add('active');
        realm.setAttribute('aria-hidden', 'false');
        gsap.set(realm, { opacity: 1, scale: 1 });
        realm.querySelector('.realm__scroll').scrollTop = 0;
        animateRealmContent(realm);
        gsap.set(flash, { opacity: 0 });
        portalEl.classList.remove('opening');
        gsap.set(portals, { opacity: 1, scale: 1, clearProps: 'transform' });
      }
    });

    tl.to(portalEl.querySelector('.portal__frame'), {
      scale: 1.2,
      duration: 0.55,
      ease: 'power2.in'
    })
    .to(flash, { opacity: 1, duration: 0.4, ease: 'power2.in' }, '-=0.2')
    .to(gate, { opacity: 0.2, duration: 0.3 }, '-=0.35');
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
    .to(flash, { opacity: 1, duration: 0.25 })
    .to(realm, { opacity: 0, scale: 0.96, duration: 0.3 }, '-=0.05')
    .add(() => {
      realm.classList.remove('active');
      gate.classList.remove('hidden');
      gsap.set(gate, { opacity: 0 });
    })
    .to(flash, { opacity: 0, duration: 0.45 })
    .to(gate, { opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.3')
    .from('.portal', { y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, '-=0.35');
  }

  document.querySelectorAll('.realm__back').forEach(btn => {
    btn.addEventListener('click', closeRealm);
  });

  // Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('open')) closeModal();
      else if (activeRealm) closeRealm();
    }
  });

  // ===== Realm content animations =====
  function animateRealmContent(realm) {
    const scrollRoot = realm.querySelector('.realm__scroll');

    gsap.from(realm.querySelectorAll('.realm__label, .realm__title, .realm__en, .realm__desc'), {
      y: 40, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', delay: 0.15
    });

    gsap.from(realm.querySelectorAll('.feat, .folder, .auto-card, .pill-stack span'), {
      y: 50, opacity: 0, scale: 0.92, stagger: 0.06, duration: 0.7, ease: 'power3.out', delay: 0.35
    });

    gsap.from(realm.querySelectorAll('.split'), {
      y: 60, opacity: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out', delay: 0.45
    });

    gsap.from(realm.querySelectorAll('.flow__step'), {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out', delay: 0.5
    });

    // Card tilt
    realm.querySelectorAll('.auto-card, .feat, .folder').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateY: x * 6, rotateX: -y * 6,
          duration: 0.3, ease: 'power2.out', transformPerspective: 600
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // Parallax illustrations while scrolling realm
    const illus = realm.querySelectorAll('.illus');
    scrollRoot.addEventListener('scroll', () => {
      const st = scrollRoot.scrollTop;
      illus.forEach((el, i) => {
        el.style.transform = `translateY(${st * (0.04 + i * 0.01)}px)`;
      });
    }, { passive: true });
  }

  // ===== Modal =====
  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
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
    const orig = btn.textContent;
    btn.textContent = 'جاري الإرسال...';
    setTimeout(() => {
      btn.textContent = 'تم الإرسال ✓';
      gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      setTimeout(() => {
        e.target.reset();
        btn.textContent = orig;
        closeModal();
      }, 1600);
    }, 1000);
  });

  // Portal hover sound-like visual (scale glow)
  portals.forEach(portal => {
    const glow = portal.querySelector('.portal__glow');
    portal.addEventListener('mouseenter', () => {
      gsap.to(glow, { opacity: 1, scale: 1.2, duration: 0.5 });
    });
    portal.addEventListener('mouseleave', () => {
      gsap.to(glow, { opacity: 0.5, scale: 1, duration: 0.5 });
    });
  });
})();
