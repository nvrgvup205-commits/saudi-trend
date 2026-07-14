/* سعودي تريند — Modern UI Soundscape v3
 * Crisp clicks + contemporary transition sweeps (Web Audio, no files).
 */
(() => {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  // Force upgrade over older maqam soundscape
  if (ROOT.SaudiSound && ROOT.SaudiSound.__v >= 3) return;

  const MASTER = 0.58;
  let ctx = null;
  let master = null;
  let enabled = localStorage.getItem('st-sound') !== '0';
  const lastByKey = Object.create(null);

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled ? MASTER : 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function setEnabled(on) {
    enabled = !!on;
    localStorage.setItem('st-sound', enabled ? '1' : '0');
    if (master) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(enabled ? MASTER : 0, t + 0.08);
    }
    document.querySelectorAll('.sound-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      btn.classList.toggle('is-muted', !enabled);
      btn.textContent = enabled ? '♪ صوت' : '♪ صامت';
    });
  }

  function gate(key, minGap) {
    if (!enabled) return false;
    const now = performance.now();
    if (key && now - (lastByKey[key] || 0) < minGap) return false;
    if (key) lastByKey[key] = now;
    return !!ensure();
  }

  function env(dur, peak, attack = 0.004) {
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack + 0.02, dur));
    g.connect(master);
    return { g, t };
  }

  function noiseBuf(dur) {
    const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    return buf;
  }

  /** Sharp modern UI click */
  function click(peak = 0.42, key = 'click') {
    if (!gate(key, 28)) return;
    const { g, t } = env(0.07, peak, 0.0015);
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(1850, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.055);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 600;
    // micro noise transient
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(0.035);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2800;
    bp.Q.value = 1.2;
    const ng = ctx.createGain();
    ng.gain.value = 0.55;
    o.connect(hp); hp.connect(g);
    src.connect(bp); bp.connect(ng); ng.connect(g);
    o.start(t); o.stop(t + 0.08);
    src.start(t);
  }

  /** Soft secondary click (hover) */
  function tick() {
    if (!gate('tick', 55)) return;
    click(0.22, 'tickC');
  }

  /** Contemporary air sweep / transition */
  function sweep(dur = 0.45, peak = 0.38, key = 'sweep') {
    if (!gate(key, 45)) return;
    const { g, t } = env(dur, peak, 0.02);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(dur);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(380, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + dur * 0.45);
    bp.frequency.exponentialRampToValueAtTime(520, t + dur);
    // rising digital tone
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(880, t + dur * 0.7);
    const og = ctx.createGain();
    og.gain.value = 0.18;
    src.connect(bp); bp.connect(g);
    o.connect(og); og.connect(g);
    src.start(t);
    o.start(t); o.stop(t + dur + 0.02);
  }

  /** Short reverse sweep (back / close) */
  function sweepBack(key = 'sweepBack') {
    if (!gate(key, 50)) return;
    const dur = 0.32;
    const { g, t } = env(dur, 0.32, 0.015);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(dur);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1;
    bp.frequency.setValueAtTime(2400, t);
    bp.frequency.exponentialRampToValueAtTime(360, t + dur);
    src.connect(bp); bp.connect(g);
    src.start(t);
    click(0.2, key + 'c');
  }

  /** Success blip — modern confirm */
  function blip(peak = 0.34, key = 'blip') {
    if (!gate(key, 40)) return;
    const { g, t } = env(0.22, peak, 0.002);
    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(880, t);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(1320, t + 0.06);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(peak * 0.85, t + 0.07);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    g2.connect(master);
    o1.connect(g);
    o2.connect(g2);
    o1.start(t); o1.stop(t + 0.12);
    o2.start(t + 0.06); o2.stop(t + 0.22);
  }

  /** Deep modern thud for major enters */
  function thud(key = 'thud') {
    if (!gate(key, 70)) return;
    const { g, t } = env(0.35, 0.4, 0.004);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.28);
    o.connect(g);
    o.start(t); o.stop(t + 0.36);
    click(0.28, key + 'c');
  }

  /* ===== API mapped to existing call sites ===== */

  function boot() {
    if (!ensure() || !enabled) return;
    sweep(0.55, 0.4, 'boot');
    setTimeout(() => blip(0.36, 'bootB'), 180);
  }

  function wordDrop() {
    click(0.3, 'word');
  }

  function wordImpact() {
    click(0.24, 'impact');
  }

  function imageShift(mode) {
    if (!ensure() || !enabled) return;
    const m = String(mode || '');
    if (m === 'bloom' || m === 'iris' || m === 'ripple') {
      sweep(0.5, 0.42, 'img1');
      setTimeout(() => blip(0.28, 'img1b'), 120);
    } else if (m === 'shear' || m === 'split' || m === 'kaleid') {
      click(0.34, 'img2');
      setTimeout(() => sweep(0.35, 0.3, 'img2s'), 40);
    } else {
      sweep(0.4, 0.36, 'img3');
    }
  }

  function liquidStart() {
    if (!ensure() || !enabled) return;
    thud('liq');
    setTimeout(() => sweep(0.7, 0.44, 'liqS'), 60);
  }

  function diveEnd() {
    if (!ensure() || !enabled) return;
    sweep(0.4, 0.34, 'diveE');
    setTimeout(() => blip(0.32, 'diveEb'), 100);
  }

  function flip() {
    if (!ensure() || !enabled) return;
    click(0.4, 'flip');
    setTimeout(() => click(0.22, 'flip2'), 55);
  }

  function enter() {
    if (!ensure() || !enabled) return;
    thud('enter');
    setTimeout(() => sweep(0.65, 0.45, 'enterS'), 50);
  }

  function skyflight() {
    if (!ensure() || !enabled) return;
    sweep(0.9, 0.48, 'sky');
    setTimeout(() => blip(0.3, 'skyB'), 220);
  }

  function portalsAppear() {
    if (!ensure() || !enabled) return;
    click(0.32, 'p1');
    setTimeout(() => click(0.3, 'p2'), 90);
    setTimeout(() => click(0.28, 'p3'), 180);
    setTimeout(() => blip(0.34, 'pOk'), 260);
  }

  function success() {
    if (!ensure() || !enabled) return;
    blip(0.38, 'ok');
  }

  function back() {
    sweepBack('back');
  }

  function lang() {
    click(0.3, 'lang');
    setTimeout(() => blip(0.24, 'langB'), 70);
  }

  function whoosh(d, p, k) { sweep(d || 0.45, p || 0.36, k || 'whoosh'); }
  function pluck() { click(0.32, 'pluck'); }
  function chime() { blip(0.28, 'chime'); }

  function unlock() { ensure(); }

  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => {
    document.addEventListener(ev, unlock, { once: true, passive: true });
  });

  function bindToggle(btn) {
    if (!btn || btn.dataset.soundBound) return;
    btn.dataset.soundBound = '1';
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.classList.toggle('is-muted', !enabled);
    btn.textContent = enabled ? '♪ صوت' : '♪ صامت';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ensure();
      setEnabled(!enabled);
      if (enabled) success();
    });
  }

  function wireUI(root = document) {
    root.querySelectorAll('.sound-toggle').forEach(bindToggle);
  }

  ROOT.SaudiSound = {
    __v: 3,
    unlock, setEnabled, isEnabled: () => enabled,
    tick, boot, wordDrop, wordImpact, imageShift, liquidStart, diveEnd,
    flip, enter, skyflight, portalsAppear, success, back, lang,
    whoosh, pluck, chime, click, sweep, wireUI
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wireUI());
  } else {
    wireUI();
  }
})();
