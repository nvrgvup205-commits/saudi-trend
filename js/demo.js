/* Demo 1 — Brain Dive Engine */
(() => {
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloader-fill');
  const mind = document.getElementById('mind');
  const dive = document.getElementById('dive');
  const lobes = [...document.querySelectorAll('.lobe')];
  const cursor = document.getElementById('cursor');
  const cursorDots = document.getElementById('cursor-dots');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  const hookTitle = document.getElementById('dive-hook-title');
  const hookSub = document.getElementById('dive-hook-sub');

  let active = null;
  let busy = false;
  let mx = 0, my = 0, lastDot = 0;

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

  // Cursor — same engine as Demo 2
  if (window.matchMedia('(min-width: 769px)').matches && cursor) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
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
    document.querySelectorAll('a, button, .lobe, .chamber__back, .chamber__grid article').forEach(el => {
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
    gsap.from('.mind__title, .mind__sub', { y: 24, opacity: 0, stagger: 0.12, duration: 0.95, delay: 0.1 });
    gsap.from('.lobe', {
      scale: 0.75, opacity: 0, transformOrigin: '320px 200px',
      stagger: 0.12, duration: 1, delay: 0.25, ease: 'power3.out'
    });
  }

  function splitWords(el, text) {
    el.innerHTML = '';
    const words = text.split(/\s+/).filter(Boolean);
    words.forEach((w) => {
      const span = document.createElement('span');
      span.className = 'dive__word';
      span.textContent = w;
      el.appendChild(span);
    });
    return [...el.querySelectorAll('.dive__word')];
  }

  function openChamber(id, lobeEl) {
    if (busy || active) return;
    busy = true;
    lobeEl.classList.add('is-opening');
    mind.classList.add('is-diving');
    document.body.classList.add('locked');

    const imgs = [...dive.querySelectorAll('.dive__img')];
    const eyebrow = dive.querySelector('.dive__eyebrow');
    const panel = dive.querySelector('.dive__panel');
    const titleText = lobeEl.dataset.hookTitle || 'نغوص في عقل أصحاب الأعمال';
    const subText = lobeEl.dataset.hookSub || 'وأعماق السوق… نستخرج الأفكار ونصل لأعلى النتائج';

    const titleWords = splitWords(hookTitle, titleText);
    const subWords = splitWords(hookSub, subText);

    // Shuffle later frames so each dive feels denser / fresh
    const sequence = imgs.slice();
    for (let i = sequence.length - 1; i > 1; i--) {
      const j = 1 + Math.floor(Math.random() * i);
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }

    const safety = setTimeout(() => enterChamber(id, lobeEl), 9000);

    gsap.set(dive, { opacity: 0, visibility: 'hidden' });
    gsap.set(sequence, {
      opacity: 0,
      scale: 1.28,
      xPercent: 0,
      yPercent: 0,
      filter: 'blur(26px) brightness(0.4) saturate(1.25)'
    });
    gsap.set([eyebrow, panel], { opacity: 0, y: 18 });
    gsap.set([...titleWords, ...subWords], {
      opacity: 0, y: 12, filter: 'blur(8px)'
    });

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safety);
        enterChamber(id, lobeEl);
      }
    });

    tl.to({}, { duration: 0.08 })
      .add(() => {
        dive.classList.add('active');
        dive.setAttribute('aria-hidden', 'false');
        gsap.set(dive, { visibility: 'visible' });
      })
      .to(dive, { opacity: 1, duration: 0.25 })
      .to(mind, { opacity: 0, duration: 0.22 }, '<');

    // Frame 1 as blurred full-bleed background IMMEDIATELY
    tl.fromTo(sequence[0],
      {
        opacity: 0,
        scale: 1.3,
        filter: 'blur(28px) brightness(0.35) saturate(1.3)'
      },
      {
        opacity: 1,
        scale: 1.12,
        filter: 'blur(20px) brightness(0.48) saturate(1.15)',
        duration: 0.4,
        ease: 'power2.out'
      },
      0.1
    );
    tl.to(sequence[0], {
      scale: 1.18,
      xPercent: 2,
      duration: 4.5,
      ease: 'none'
    }, 0.1);

    // Clear frosted text panel + word-by-word typing from first frame
    tl.to(panel, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.18)
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.3 }, 0.22)
      .to(titleWords, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.09, duration: 0.28, ease: 'power2.out'
      }, 0.3)
      .to(subWords, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.065, duration: 0.26, ease: 'power2.out'
      }, 0.55);

    // Rapid magical cycling of remaining BG images UNDER the text
    const step = 0.16;
    sequence.forEach((img, i) => {
      if (i === 0) return;
      const start = 0.45 + (i - 1) * step;
      const drift = (i % 2 === 0) ? 2.5 : -2.5;
      tl.fromTo(img,
        {
          opacity: 0,
          scale: 1.32,
          xPercent: -drift,
          filter: 'blur(28px) brightness(0.35) saturate(1.35)'
        },
        {
          opacity: 1,
          scale: 1.1,
          xPercent: drift,
          filter: 'blur(18px) brightness(0.5) saturate(1.2)',
          duration: 0.22,
          ease: 'power2.out'
        },
        start
      );
      tl.to(sequence[i - 1], {
        opacity: 0,
        scale: 1.16,
        duration: 0.18,
        ease: 'power1.in'
      }, start + 0.08);
    });

    const endAt = 0.45 + (sequence.length - 1) * step + 0.45;
    tl.to({}, { duration: 0.75 }, endAt)
      .to(dive, { opacity: 0, duration: 0.35, ease: 'power2.in' });
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
      y: 28, opacity: 0, stagger: 0.05, duration: 0.7, ease: 'power3.out', delay: 0.06
    });

    if (lobeEl) lobeEl.classList.remove('is-opening');
    busy = false;
  }

  function closeChamber() {
    if (!active || busy) return;
    const chamber = document.getElementById('chamber-' + active);
    if (!chamber) return;

    gsap.to(chamber, {
      opacity: 0, duration: 0.4,
      onComplete: () => {
        chamber.classList.remove('active');
        chamber.setAttribute('aria-hidden', 'true');
        mind.classList.remove('hidden');
        document.body.classList.remove('locked');
        gsap.set(mind, { opacity: 1, clearProps: 'transform' });
        gsap.fromTo('.lobe', { opacity: 0.4, scale: 0.96 }, {
          opacity: 1, scale: 1, stagger: 0.07, duration: 0.65, ease: 'power3.out'
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
