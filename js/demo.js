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
    document.querySelectorAll('a, button, .lobe, .chamber__back, .svc-card, .sound-toggle').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');
        if (window.SaudiSound) SaudiSound.tick();
      });
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

  /* ============================================================
   * LiquidField — subconscious image seam with watery refraction
   * Pipeline: cover-draw → dual-buffer crossfade modes →
   * animated multi-octave displacement → radial depth blur under text
   * ============================================================ */
  const liquidCanvas = document.getElementById('dive-liquid');
  const liquidCtx = liquidCanvas.getContext('2d', { alpha: false, desynchronized: true });
  const waterTurb = document.getElementById('waterTurb');
  const waterMap = document.getElementById('waterMap');
  const diveLens = document.getElementById('dive-lens');

  const LiquidField = (() => {
    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d', { willReadFrequently: false });
    const blur = document.createElement('canvas');
    const blurCtx = blur.getContext('2d');

    let W = 0, H = 0, dpr = 1;
    let running = false;
    let raf = 0;
    let t0 = 0;
    let images = [];
    let a = 0, b = 1;
    let mix = 0;
    let mode = 'dissolve';
    let modeSeed = 0;
    let zoomA = 1.08, zoomB = 1.14;
    let panA = 0, panB = 0;

    const MODES = [
      'dissolve',      // soft subconscious fade
      'iris',          // radial iris open
      'shear',         // diagonal shear wipe
      'bloom',         // brightness bloom through white-green
      'ripple',        // circular ripple reveal
      'split',         // vertical split dissolve
      'depth',         // rack-focus swap (blur trade)
      'kaleid'         // slight rotate + scale blossom
    ];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      liquidCanvas.width = Math.floor(W * dpr);
      liquidCanvas.height = Math.floor(H * dpr);
      liquidCanvas.style.width = W + 'px';
      liquidCanvas.style.height = H + 'px';
      liquidCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = Math.floor(W * dpr);
      off.height = Math.floor(H * dpr);
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      blur.width = Math.max(2, Math.floor(W * 0.28));
      blur.height = Math.max(2, Math.floor(H * 0.28));
    }

    function coverDraw(ctx, img, zoom, pan, alpha) {
      if (!img || !img.naturalWidth) return;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(W / iw, H / ih) * zoom;
      const dw = iw * s, dh = ih * s;
      const dx = (W - dw) / 2 + pan * W * 0.04;
      const dy = (H - dh) / 2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function composite(now) {
      const t = (now - t0) / 1000;
      const imgA = images[a], imgB = images[b];
      const m = easeInOut(Math.min(1, Math.max(0, mix)));

      offCtx.fillStyle = '#020806';
      offCtx.fillRect(0, 0, W, H);

      // Base plate always has BOTH images interleaved (subconscious residue)
      const linger = 0.18; // previous never fully dies — ghost trail
      const alphaA = Math.max(linger * (1 - m), 1 - m);
      const alphaB = Math.max(linger * m, m);

      offCtx.save();
      if (mode === 'kaleid') {
        offCtx.translate(W / 2, H / 2);
        offCtx.rotate((1 - m) * 0.04 * (modeSeed % 2 ? 1 : -1));
        offCtx.scale(1 + (1 - m) * 0.06, 1 + (1 - m) * 0.06);
        offCtx.translate(-W / 2, -H / 2);
      }

      if (mode === 'depth') {
        offCtx.filter = `blur(${(6 + m * 14).toFixed(2)}px) brightness(${0.55 - m * 0.1}) saturate(1.25)`;
        coverDraw(offCtx, imgA, zoomA + t * 0.004, panA, alphaA);
        offCtx.filter = `blur(${(20 - m * 14).toFixed(2)}px) brightness(${0.45 + m * 0.12}) saturate(1.35)`;
        coverDraw(offCtx, imgB, zoomB + t * 0.005, panB, alphaB);
        offCtx.filter = 'none';
      } else if (mode === 'bloom') {
        coverDraw(offCtx, imgA, zoomA, panA, alphaA);
        offCtx.globalCompositeOperation = 'screen';
        offCtx.fillStyle = `rgba(0,200,83,${0.18 * Math.sin(m * Math.PI)})`;
        offCtx.fillRect(0, 0, W, H);
        offCtx.globalCompositeOperation = 'source-over';
        coverDraw(offCtx, imgB, zoomB, panB, alphaB);
      } else if (mode === 'shear') {
        coverDraw(offCtx, imgA, zoomA, panA, 1);
        offCtx.save();
        offCtx.beginPath();
        const sx = -W * 0.2 + m * W * 1.4;
        offCtx.moveTo(sx, 0); offCtx.lineTo(sx + W * 0.55, 0);
        offCtx.lineTo(sx + W * 0.35, H); offCtx.lineTo(sx - W * 0.2, H);
        offCtx.closePath(); offCtx.clip();
        coverDraw(offCtx, imgB, zoomB, panB, 1);
        offCtx.restore();
        // Soft residue of A on top at low opacity
        coverDraw(offCtx, imgA, zoomA, panA, linger * (1 - m));
      } else if (mode === 'iris' || mode === 'ripple') {
        coverDraw(offCtx, imgA, zoomA, panA, 1);
        offCtx.save();
        const r = Math.hypot(W, H) * 0.55 * m;
        offCtx.beginPath();
        offCtx.arc(W * 0.5, H * 0.48, Math.max(1, r), 0, Math.PI * 2);
        offCtx.clip();
        coverDraw(offCtx, imgB, zoomB, panB, 1);
        offCtx.restore();
        if (mode === 'ripple') {
          offCtx.strokeStyle = `rgba(180,255,220,${0.25 * (1 - m)})`;
          offCtx.lineWidth = 18;
          offCtx.beginPath();
          offCtx.arc(W * 0.5, H * 0.48, Math.max(1, r), 0, Math.PI * 2);
          offCtx.stroke();
        }
      } else if (mode === 'split') {
        coverDraw(offCtx, imgA, zoomA, panA, 1);
        offCtx.save();
        offCtx.beginPath();
        offCtx.rect(0, 0, W * m, H);
        offCtx.clip();
        coverDraw(offCtx, imgB, zoomB, panB, 1);
        offCtx.restore();
        coverDraw(offCtx, imgA, zoomA, panA, linger * 0.5 * (1 - m));
      } else {
        // dissolve — dual exposure
        coverDraw(offCtx, imgA, zoomA + t * 0.003, panA, alphaA);
        coverDraw(offCtx, imgB, zoomB + t * 0.004, panB, alphaB);
      }
      offCtx.restore();

      // Dim + soft overall watery feel
      offCtx.fillStyle = 'rgba(2,10,8,0.28)';
      offCtx.fillRect(0, 0, W, H);

      // Present to main canvas
      liquidCtx.clearRect(0, 0, W, H);
      liquidCtx.drawImage(off, 0, 0, W, H);

      // Extra soft downsample blur pass under center (text zone) — higher blur behind words
      blurCtx.clearRect(0, 0, blur.width, blur.height);
      blurCtx.drawImage(liquidCanvas, 0, 0, blur.width, blur.height);
      liquidCtx.save();
      liquidCtx.globalAlpha = 0.55;
      liquidCtx.filter = 'blur(18px) brightness(0.85)';
      const lw = W * 0.78, lh = H * 0.42;
      liquidCtx.beginPath();
      // rounded rect approx via ellipse
      liquidCtx.ellipse(W / 2, H / 2, lw / 2, lh / 2, 0, 0, Math.PI * 2);
      liquidCtx.clip();
      liquidCtx.drawImage(blur, 0, 0, W, H);
      liquidCtx.filter = 'none';
      liquidCtx.restore();
    }

    function tickWaterSVG(now) {
      if (!waterTurb || !waterMap) return;
      const t = (now - t0) / 1000;
      // Animate fractal noise frequency — living water
      const fx = 0.009 + Math.sin(t * 0.35) * 0.004;
      const fy = 0.014 + Math.cos(t * 0.28) * 0.005;
      waterTurb.setAttribute('baseFrequency', fx.toFixed(4) + ' ' + fy.toFixed(4));
      const scale = 22 + Math.sin(t * 0.7) * 10 + Math.cos(t * 1.1) * 6;
      waterMap.setAttribute('scale', scale.toFixed(2));
    }

    function frame(now) {
      if (!running) return;
      composite(now);
      tickWaterSVG(now);
      raf = requestAnimationFrame(frame);
    }

    function start(imgs) {
      images = imgs.filter(i => i && (i.complete ? i.naturalWidth : true));
      resize();
      a = 0; b = Math.min(1, images.length - 1);
      mix = 0;
      mode = MODES[0];
      t0 = performance.now();
      running = true;
      dive.classList.add('is-liquid');
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
      dive.classList.remove('is-liquid');
    }

    function crossTo(nextIndex, nextMode) {
      a = b;
      b = nextIndex % images.length;
      mix = 0;
      mode = nextMode || MODES[Math.floor(Math.random() * MODES.length)];
      modeSeed = (modeSeed + 1 + Math.floor(Math.random() * 7)) % 97;
      zoomA = zoomB;
      panA = panB;
      zoomB = 1.06 + Math.random() * 0.14;
      panB = (Math.random() * 2 - 1);
      return mode;
    }

    function setMix(v) { mix = v; }

    addEventListener('resize', () => { if (running) resize(); });

    return { start, stop, crossTo, setMix, MODES };
  })();

  const gravityIn = (t) => t * t;

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

  function dropWordsSlow(words) {
    const tl = gsap.timeline();
    const dropPx = Math.min(160, Math.max(90, window.innerHeight * 0.16));
    words.forEach((word, i) => {
      const start = i * 0.38; // slow — readable
      const rot = (Math.random() * 10 - 5);
      gsap.set(word, {
        y: -dropPx - Math.random() * 30,
        x: (Math.random() * 16 - 8),
        rotation: rot,
        opacity: 0,
        scaleY: 1, scaleX: 1,
        filter: 'blur(4px)',
        transformOrigin: '50% 100%'
      });
      tl.to(word, {
        y: 0, x: 0, opacity: 1, rotation: 'blur(0px)',
        rotation: rot * 0.1,
        duration: 0.7,
        ease: gravityIn
      }, start);
      tl.to(word, {
        scaleY: 0.78, scaleX: 1.12, rotation: 0,
        duration: 0.1, ease: 'power2.out'
      }, start + 0.7);
      tl.to(word, {
        scaleY: 1, scaleX: 1,
        duration: 0.65, ease: 'bounce.out'
      }, start + 0.78);
    });
    return tl;
  }

  function openChamber(id, lobeEl) {
    if (busy || active) return;
    busy = true;
    lobeEl.classList.add('is-opening');
    mind.classList.add('is-diving');
    document.body.classList.add('locked');
    if (window.SaudiSound) SaudiSound.enter();

    const imgs = [...dive.querySelectorAll('.dive__img')];
    const eyebrow = dive.querySelector('.dive__eyebrow');
    const panel = dive.querySelector('.dive__panel');
    const titleText = lobeEl.dataset.hookTitle || 'نغوص في عقل أصحاب الأعمال';
    const subText = lobeEl.dataset.hookSub || 'وأعماق السوق… نستخرج الأفكار ونصل لأعلى النتائج';

    const titleWords = splitWords(hookTitle, titleText);
    const subWords = splitWords(hookSub, subText);

    // Fisher–Yates shuffle for a fresh subconscious path each dive
    const order = imgs.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const safety = setTimeout(() => {
      LiquidField.stop();
      enterChamber(id, lobeEl);
    }, 16000);

    gsap.set(dive, { opacity: 0, visibility: 'hidden' });
    gsap.set([eyebrow, diveLens], { opacity: 0 });
    gsap.set(panel, { opacity: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safety);
        LiquidField.stop();
        enterChamber(id, lobeEl);
      }
    });

    tl.to({}, { duration: 0.05 })
      .add(() => {
        dive.classList.add('active');
        dive.setAttribute('aria-hidden', 'false');
        gsap.set(dive, { visibility: 'visible' });
        LiquidField.start(order.map(i => imgs[i]));
      })
      .to(dive, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      .to(mind, { opacity: 0, duration: 0.28 }, '<')
      // Strong watery lens behind words — higher blur zone
      .to(diveLens, { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.2)
      .to(eyebrow, { opacity: 1, duration: 0.4 }, 0.28);

    // Slow physical word fall — title then sub
    tl.add(dropWordsSlow(titleWords), 0.45);
    const subStart = 0.45 + titleWords.length * 0.38 + 0.35;
    tl.add(dropWordsSlow(subWords), subStart);

    // Interleaved image transitions under the liquid field
    // Each transition uses a DIFFERENT mode; previous image lingers (ghost)
    const modes = [...LiquidField.MODES];
    for (let i = modes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [modes[i], modes[j]] = [modes[j], modes[i]];
    }

    const frameCount = Math.min(order.length, 12);
    let cursorT = 0.7;
    for (let i = 1; i < frameCount; i++) {
      const mode = modes[(i - 1) % modes.length];
      const hold = 0.55 + (i % 3) * 0.12;
      const dur = 0.85 + (i % 4) * 0.12; // overlapping feel
      tl.add(() => {
        LiquidField.crossTo(i, mode);
      }, cursorT);
      tl.to({ v: 0 }, {
        v: 1, duration: dur, ease: 'none',
        onUpdate: function () { LiquidField.setMix(this.targets()[0].v); }
      }, cursorT);
      // Start next before previous mix completes → interleaved
      cursorT += hold;
    }

    const settle = Math.max(cursorT + 1.1, subStart + subWords.length * 0.38 + 1.2);
    tl.to({}, { duration: 0.4 }, settle)
      .to([diveLens, dive], { opacity: 0, duration: 0.45, ease: 'power2.in' }, settle + 0.15);
  }

  function enterChamber(id, lobeEl) {
    LiquidField.stop();
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

    gsap.from(chamber.querySelectorAll('.chamber__hero-text > *, .svc-card'), {
      y: 28, opacity: 0, stagger: 0.05, duration: 0.7, ease: 'power3.out', delay: 0.06
    });

    if (lobeEl) lobeEl.classList.remove('is-opening');
    if (window.SaudiSound) SaudiSound.success();
    busy = false;
  }

  function closeChamber() {
    if (!active || busy) return;
    const chamber = document.getElementById('chamber-' + active);
    if (!chamber) return;
    if (window.SaudiSound) SaudiSound.back();
    chamber.querySelectorAll('.svc-card.is-flipped').forEach(c => c.classList.remove('is-flipped'));

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

  // Flip service cards
  function bindServiceCards(scope) {
    scope.querySelectorAll('.svc-card').forEach(card => {
      if (card.dataset.bound) return;
      card.dataset.bound = '1';
      const flip = () => {
        const grid = card.closest('.chamber__grid');
        const was = card.classList.contains('is-flipped');
        grid?.querySelectorAll('.svc-card.is-flipped').forEach(c => {
          if (c !== card) c.classList.remove('is-flipped');
        });
        card.classList.toggle('is-flipped', !was);
        if (window.SaudiSound) SaudiSound.flip();
        if (window.gsap) {
          gsap.fromTo(card, { scale: 0.97 }, { scale: 1, duration: 0.65, ease: 'elastic.out(1, 0.55)' });
        }
      };
      card.addEventListener('click', (e) => { e.preventDefault(); flip(); });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });
  }
  bindServiceCards(document);
  if (window.SaudiSound) SaudiSound.wireUI();

  document.querySelectorAll('.chamber__back').forEach(btn => {
    btn.addEventListener('click', closeChamber);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active) closeChamber();
  });
})();
