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
        if (window.SaudiSound) SaudiSound.boot();
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

  /* ============================================================
   * MindField — multi-layer genius backdrop
   * flow-field nodes + code glyphs + orbit rings + data rivers
   * Motifs: marketing signals · automation loops · software rails
   * ============================================================ */
  const mindCanvas = document.getElementById('mind-field') || canvas;
  const mctx = mindCanvas.getContext('2d');

  const GLYPHS = [
    '{ }', '=>', 'CRM', 'SEO', 'API', '0x', '||', '&&', 'AI',
    'نمو', 'بيع', 'أتمتة', 'data', 'KPI', 'funnel', '<>', '::',
  ];

  const MindField = (() => {
    let W = 0, H = 0, dpr = 1, raf = 0, t0 = 0;
    let nodes = [];
    let glyphs = [];
    let rivers = [];
    let rings = [];
    let packets = [];

    // Cheap value-noise (hash) for organic flow
    function hash(x, y) {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    }
    function noise(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi), b = hash(xi + 1, yi);
      const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
    }
    function flowAngle(x, y, t) {
      const n = noise(x * 0.0018 + t * 0.03, y * 0.0018 - t * 0.02);
      return n * Math.PI * 2;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      W = window.innerWidth; H = window.innerHeight;
      mindCanvas.width = Math.floor(W * dpr);
      mindCanvas.height = Math.floor(H * dpr);
      mindCanvas.style.width = W + 'px';
      mindCanvas.style.height = H + 'px';
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const count = Math.min(95, Math.floor(W * H / 14000));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.5,
          a: Math.random() * 0.45 + 0.15,
          kind: Math.random() > 0.55 ? 'market' : (Math.random() > 0.5 ? 'auto' : 'code')
        });
      }
      glyphs = [];
      for (let i = 0; i < 18; i++) {
        glyphs.push({
          text: GLYPHS[i % GLYPHS.length],
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.12 - Math.random() * 0.22,
          rot: (Math.random() - 0.5) * 0.4,
          a: Math.random() * 0.22 + 0.08,
          size: 11 + Math.random() * 8
        });
      }
      rivers = [];
      for (let i = 0; i < 5; i++) {
        rivers.push({
          y: H * (0.15 + i * 0.16),
          phase: Math.random() * Math.PI * 2,
          amp: 18 + Math.random() * 28,
          speed: 0.35 + Math.random() * 0.45,
          hue: i % 3
        });
      }
      rings = [
        { cx: W * 0.18, cy: H * 0.72, r: 70, spin: 0.25 },
        { cx: W * 0.82, cy: H * 0.28, r: 90, spin: -0.2 },
        { cx: W * 0.5, cy: H * 0.88, r: 55, spin: 0.32 }
      ];
      packets = [];
      for (let i = 0; i < 24; i++) {
        packets.push({
          t: Math.random(),
          path: i % rivers.length,
          speed: 0.08 + Math.random() * 0.12,
          size: 2 + Math.random() * 2
        });
      }
    }

    function kindColor(kind, a) {
      if (kind === 'market') return `rgba(212,175,55,${a})`;
      if (kind === 'auto') return `rgba(0,230,118,${a})`;
      return `rgba(125,211,252,${a})`;
    }

    function drawRivers(t) {
      rivers.forEach((rv, idx) => {
        mctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const yy = rv.y + Math.sin(x * 0.01 + t * rv.speed + rv.phase) * rv.amp
            + Math.sin(x * 0.023 - t * 0.4 + rv.phase) * rv.amp * 0.35;
          if (x === 0) mctx.moveTo(x, yy); else mctx.lineTo(x, yy);
        }
        const cols = [
          'rgba(212,175,55,0.14)',
          'rgba(0,200,83,0.16)',
          'rgba(125,211,252,0.14)'
        ];
        mctx.strokeStyle = cols[rv.hue];
        mctx.lineWidth = 1.4;
        mctx.stroke();

        // data packets riding the river
        packets.filter(p => p.path === idx).forEach(p => {
          p.t = (p.t + p.speed * 0.016) % 1;
          const x = p.t * W;
          const yy = rv.y + Math.sin(x * 0.01 + t * rv.speed + rv.phase) * rv.amp;
          mctx.beginPath();
          mctx.arc(x, yy, p.size, 0, Math.PI * 2);
          mctx.fillStyle = cols[rv.hue].replace('0.1', '0.55').replace('0.14', '0.55').replace('0.16', '0.55');
          mctx.fill();
        });
      });
    }

    function drawRings(t) {
      rings.forEach((rg, i) => {
        const a = t * rg.spin;
        mctx.save();
        mctx.translate(rg.cx, rg.cy);
        mctx.rotate(a);
        mctx.strokeStyle = i === 1 ? 'rgba(212,175,55,0.22)' : 'rgba(0,200,83,0.2)';
        mctx.lineWidth = 1.2;
        mctx.beginPath();
        mctx.arc(0, 0, rg.r, 0, Math.PI * 2);
        mctx.stroke();
        // automation teeth / marketing notches
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2;
          const x1 = Math.cos(ang) * (rg.r - 6);
          const y1 = Math.sin(ang) * (rg.r - 6);
          const x2 = Math.cos(ang) * (rg.r + 8);
          const y2 = Math.sin(ang) * (rg.r + 8);
          mctx.beginPath();
          mctx.moveTo(x1, y1); mctx.lineTo(x2, y2);
          mctx.strokeStyle = 'rgba(125,211,252,0.18)';
          mctx.stroke();
        }
        mctx.restore();
      });
    }

    function drawGlyphs(dt) {
      mctx.font = '600 13px Cairo, Tajawal, monospace';
      glyphs.forEach(g => {
        g.x += g.vx; g.y += g.vy;
        if (g.y < -30) { g.y = H + 20; g.x = Math.random() * W; }
        if (g.x < -40) g.x = W + 20;
        if (g.x > W + 40) g.x = -20;
        mctx.save();
        mctx.translate(g.x, g.y);
        mctx.rotate(g.rot);
        mctx.globalAlpha = g.a;
        mctx.fillStyle = '#7dd3fc';
        mctx.fillText(g.text, 0, 0);
        mctx.restore();
      });
      mctx.globalAlpha = 1;
    }

    function frame(now) {
      const t = (now - t0) / 1000;
      mctx.clearRect(0, 0, W, H);

      // deep radial wash
      const grd = mctx.createRadialGradient(W * 0.5, H * 0.4, 40, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      grd.addColorStop(0, 'rgba(0,60,35,0.22)');
      grd.addColorStop(0.45, 'rgba(3,10,8,0.05)');
      grd.addColorStop(1, 'rgba(2,8,6,0)');
      mctx.fillStyle = grd;
      mctx.fillRect(0, 0, W, H);

      drawRivers(t);
      drawRings(t);

      // flow-field drifting nodes + synaptic links
      nodes.forEach((n, i) => {
        const ang = flowAngle(n.x, n.y, t);
        n.x += Math.cos(ang) * 0.55;
        n.y += Math.sin(ang) * 0.55;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;

        mctx.beginPath();
        mctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        mctx.fillStyle = kindColor(n.kind, n.a);
        mctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const q = nodes[j];
          const dx = n.x - q.x, dy = n.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            mctx.beginPath();
            mctx.moveTo(n.x, n.y);
            mctx.lineTo(q.x, q.y);
            const mid = 0.5 * (1 - d / 130);
            mctx.strokeStyle = kindColor(n.kind, mid * 0.55);
            mctx.lineWidth = 0.8;
            mctx.stroke();
          }
        }
      });

      drawGlyphs(t);

      // soft vignette
      const vig = mctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(2,8,6,0.55)');
      mctx.fillStyle = vig;
      mctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    function start() {
      t0 = performance.now();
      resize();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    addEventListener('resize', resize);
    return { start };
  })();

  // Keep legacy particle canvas quiet (MindField owns the spectacle)
  if (canvas) {
    canvas.width = 1; canvas.height = 1;
  }
  MindField.start();

  function splitHookChars(el) {
    if (!el) return [];
    const text = el.getAttribute('aria-label') || el.textContent || '';
    el.innerHTML = '';
    const chars = [...text];
    chars.forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'ch' + (ch === ' ' ? ' is-space' : '');
      span.style.setProperty('--i', i);
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
    });
    return [...el.querySelectorAll('.ch')];
  }

  function intro() {
    const hookEl = document.getElementById('mind-hook');
    const chars = splitHookChars(hookEl);

    gsap.from('.mind__logo, .mind__links a, .mind__links button', {
      y: -16, opacity: 0, stagger: 0.07, duration: 0.75
    });
    gsap.from('.mind__title', { y: 22, opacity: 0, duration: 0.9, delay: 0.08 });

    // Physical fall + fluid colors already animating via CSS
    if (chars.length) {
      const drop = Math.min(90, window.innerHeight * 0.1);
      gsap.set(chars, { y: -drop, opacity: 0, rotation: 0 });
      gsap.to(chars, {
        y: 0, opacity: 1, force3D: true,
        stagger: 0.028,
        duration: 0.7,
        ease: (t) => t * t, // gravity-in
        delay: 0.2,
        onStart: () => { if (window.SaudiSound) SaudiSound.wordDrop(); },
        onComplete: () => { if (window.SaudiSound) SaudiSound.success(); }
      });
      // bounce settle staggered lightly
      chars.forEach((ch, i) => {
        gsap.fromTo(ch,
          { scaleY: 1 },
          {
            keyframes: [
              { scaleY: 0.78, scaleX: 1.12, duration: 0.08 },
              { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'bounce.out' }
            ],
            delay: 0.2 + i * 0.028 + 0.55
          }
        );
      });
    }

    gsap.from('.lobe', {
      scale: 0.75, opacity: 0, transformOrigin: '320px 200px',
      stagger: 0.12, duration: 1, delay: 0.45, ease: 'power3.out'
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
      const scale = 38 + Math.sin(t * 0.65) * 14 + Math.cos(t * 1.05) * 8;
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
    // Physical free-fall — text stays razor-sharp (never apply blur filter)
    const dropPx = Math.min(180, Math.max(100, window.innerHeight * 0.18));
    words.forEach((word, i) => {
      const start = i * 0.42;
      const rot = (Math.random() * 12 - 6);
      const drift = (Math.random() * 20 - 10);
      gsap.set(word, {
        y: -dropPx - Math.random() * 36,
        x: drift,
        rotation: rot,
        opacity: 0,
        scaleY: 1,
        scaleX: 1,
        filter: 'none',
        force3D: true,
        transformOrigin: '50% 100%'
      });
      tl.to(word, {
        y: 0, x: 0, opacity: 1,
        rotation: rot * 0.08,
        duration: 0.72,
        ease: gravityIn,
        force3D: true,
        onStart: () => { if (window.SaudiSound) SaudiSound.wordDrop(); }
      }, start);
      tl.to(word, {
        scaleY: 0.74, scaleX: 1.16, rotation: 0,
        duration: 0.09, ease: 'power2.out',
        onStart: () => { if (window.SaudiSound) SaudiSound.wordImpact(); }
      }, start + 0.72);
      tl.to(word, {
        scaleY: 1, scaleX: 1,
        duration: 0.7, ease: 'bounce.out'
      }, start + 0.8);
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
        if (window.SaudiSound) SaudiSound.liquidStart();
      })
      .to(dive, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      .to(mind, { opacity: 0, duration: 0.28 }, '<')
      // Strong watery lens behind words — higher blur zone
      .to(diveLens, { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.2)
      .to(eyebrow, { opacity: 1, duration: 0.4 }, 0.28);

    // Slow physical word fall — title then sub (timings match new stagger 0.42)
    tl.add(dropWordsSlow(titleWords), 0.4);
    const subStart = 0.4 + titleWords.length * 0.42 + 0.4;
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
        if (window.SaudiSound) SaudiSound.imageShift(mode);
      }, cursorT);
      tl.to({ v: 0 }, {
        v: 1, duration: dur, ease: 'none',
        onUpdate: function () { LiquidField.setMix(this.targets()[0].v); }
      }, cursorT);
      // Start next before previous mix completes → interleaved
      cursorT += hold;
    }

    const settle = Math.max(cursorT + 1.1, subStart + subWords.length * 0.42 + 1.35);
    tl.to({}, { duration: 0.4 }, settle)
      .add(() => { if (window.SaudiSound) SaudiSound.diveEnd(); }, settle)
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
