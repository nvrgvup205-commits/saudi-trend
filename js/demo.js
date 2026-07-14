/* Demo 1 — Brain Dive Engine */
(() => {
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloader-fill');
  const mind = document.getElementById('mind');
  const dive = document.getElementById('dive');
  const lobes = [...document.querySelectorAll('.lobe')];
  const cursor = document.getElementById('cursor');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  let active = null;
  let busy = false;

  // Preloader
  let p = 0;
  const timer = setInterval(() => {
    p = Math.min(100, p + Math.random() * 12 + 4);
    fill.style.width = p + '%';
    if (p >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        preloader.classList.add('done');
        intro();
      }, 400);
    }
  }, 90);

  // Cursor
  if (window.matchMedia('(min-width: 769px)').matches && cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .lobe, .chamber__back').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // Particles
  let particles = [];
  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  function spawn() {
    particles = [];
    const n = Math.min(55, Math.floor(innerWidth / 24));
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.4 + 0.1
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
      ctx.fillStyle = `rgba(0,200,83,${pt.a})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(pt.x - q.x, pt.y - q.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,200,83,${0.08 * (1 - d / 110)})`;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  resize(); spawn(); draw();
  addEventListener('resize', () => { resize(); spawn(); });

  function intro() {
    gsap.from('.mind__logo, .mind__links a', { y: -16, opacity: 0, stagger: 0.08, duration: 0.8 });
    gsap.from('.mind__eyebrow, .mind__title, .mind__sub', { y: 28, opacity: 0, stagger: 0.12, duration: 1, delay: 0.15 });
    gsap.from('.lobe', { scale: 0.7, opacity: 0, transformOrigin: '320px 210px', stagger: 0.15, duration: 1.1, delay: 0.35, ease: 'power3.out' });
    gsap.from('.brain__caption', { opacity: 0, duration: 0.8, delay: 1.1 });
  }

  function openChamber(id, lobeEl) {
    if (busy || active) return;
    busy = true;
    lobeEl.classList.add('is-opening');
    mind.classList.add('is-diving');
    document.body.classList.add('locked');

    const chamber = document.getElementById('chamber-' + id);
    const imgs = [...dive.querySelectorAll('.dive__img')];
    const caption = dive.querySelector('.dive__caption');
    const tunnel = dive.querySelector('.dive__tunnel');

    const safety = setTimeout(() => enterChamber(id, lobeEl), 7000);

    gsap.set(dive, { opacity: 0, visibility: 'hidden' });
    gsap.set(imgs, { opacity: 0, scale: 1.4 });
    gsap.set(caption, { opacity: 0, y: 40 });
    gsap.set(tunnel, { scale: 1.5, opacity: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safety);
        enterChamber(id, lobeEl);
      }
    });

    tl.to({}, { duration: 0.35 })
      .add(() => {
        dive.classList.add('active');
        dive.setAttribute('aria-hidden', 'false');
        gsap.set(dive, { visibility: 'visible' });
      })
      .to(dive, { opacity: 1, duration: 0.5 })
      .to(mind, { opacity: 0, duration: 0.45 }, '<')
      .to(tunnel, { scale: 0.35, duration: 1.6, ease: 'power2.in' }, '-=0.1')
      .to(imgs[0], { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, '-=1.1')
      .to(imgs[0], { opacity: 0, scale: 1.15, duration: 0.6 }, '+=0.15')
      .to(imgs[1], { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, '-=0.35')
      .to(imgs[1], { opacity: 0, scale: 1.12, duration: 0.55 }, '+=0.1')
      .to(imgs[2], { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, '-=0.3')
      .to(caption, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
      .to({}, { duration: 0.9 })
      .to([caption, imgs[2], dive], { opacity: 0, duration: 0.55 });
  }

  function enterChamber(id, lobeEl) {
    const chamber = document.getElementById('chamber-' + id);
    if (!chamber) {
      busy = false;
      return;
    }

    active = id;
    mind.classList.add('hidden');
    mind.classList.remove('is-diving');
    gsap.set(mind, { opacity: 0 });

    dive.classList.remove('active');
    dive.setAttribute('aria-hidden', 'true');
    gsap.set(dive, { opacity: 0, visibility: 'hidden' });

    chamber.classList.add('active');
    chamber.setAttribute('aria-hidden', 'false');
    gsap.set(chamber, { opacity: 1, visibility: 'visible' });

    const scroller = chamber.querySelector('.chamber__scroll');
    if (scroller) scroller.scrollTop = 0;

    gsap.from(chamber.querySelectorAll('.chamber__hero-text > *, .chamber__grid article'), {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', delay: 0.15
    });

    if (lobeEl) lobeEl.classList.remove('is-opening');
    busy = false;
  }

  function closeChamber() {
    if (!active || busy) return;
    const chamber = document.getElementById('chamber-' + active);
    if (!chamber) return;

    gsap.to(chamber, {
      opacity: 0, duration: 0.45,
      onComplete: () => {
        chamber.classList.remove('active');
        chamber.setAttribute('aria-hidden', 'true');
        mind.classList.remove('hidden');
        document.body.classList.remove('locked');
        gsap.set(mind, { opacity: 1, clearProps: 'transform' });
        gsap.fromTo('.lobe', { opacity: 0.4, scale: 0.95 }, {
          opacity: 1, scale: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out'
        });
        active = null;
      }
    });
  }

  lobes.forEach(lobe => {
    const go = () => openChamber(lobe.dataset.section, lobe);
    lobe.addEventListener('click', go);
    lobe.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  document.querySelectorAll('.chamber__back').forEach(btn => {
    btn.addEventListener('click', closeChamber);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active) closeChamber();
  });
})();
