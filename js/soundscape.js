/* سعودي تريند — Luxury Soft Soundscape v4
 * Refined, adult, prestigious cues. Soft sine/glass + velvet sweeps.
 * No square-wave toy clicks.
 */
(() => {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  if (ROOT.SaudiSound && ROOT.SaudiSound.__v >= 4) return;

  const MASTER = 0.48;
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
      // Soft shelf — tame harsh highs for a premium tone
      const shelf = ctx.createBiquadFilter();
      shelf.type = 'lowshelf';
      shelf.frequency.value = 180;
      shelf.gain.value = 2.5;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 4200;
      lp.Q.value = 0.7;
      master.connect(shelf);
      shelf.connect(lp);
      lp.connect(ctx.destination);
      master._chain = true;
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
      master.gain.linearRampToValueAtTime(enabled ? MASTER : 0, t + 0.12);
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

  function env(dur, peak, attack = 0.02) {
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack + 0.05, dur));
    g.connect(master);
    return { g, t };
  }

  function noiseBuf(dur) {
    const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      // Brown-ish noise — softer, less hissy than white
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5 * (1 - i / n);
    }
    return buf;
  }

  /** Soft glass touch — refined hover/press */
  function glass(freq = 720, peak = 0.2, dur = 0.28, key = 'glass') {
    if (!gate(key, 40)) return;
    const { g, t } = env(dur, peak, 0.008);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.92, t + dur);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, t);
    lp.frequency.exponentialRampToValueAtTime(900, t + dur);
    o.connect(lp);
    o2.connect(g2); g2.connect(lp);
    lp.connect(g);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.02); o2.stop(t + dur + 0.02);
  }

  /** Velvet air transition */
  function velvet(dur = 0.7, peak = 0.26, key = 'velvet') {
    if (!gate(key, 60)) return;
    const { g, t } = env(dur, peak, 0.06);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(dur);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.65;
    bp.frequency.setValueAtTime(240, t);
    bp.frequency.exponentialRampToValueAtTime(1100, t + dur * 0.5);
    bp.frequency.exponentialRampToValueAtTime(320, t + dur);
    // Warm under-pad
    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 110;
    const pg = ctx.createGain();
    pg.gain.value = 0.22;
    src.connect(bp); bp.connect(g);
    pad.connect(pg); pg.connect(g);
    src.start(t);
    pad.start(t); pad.stop(t + dur + 0.03);
  }

  /** Soft confirm — two gentle harmonic tones */
  function confirm(key = 'confirm') {
    if (!gate(key, 55)) return;
    const { g, t } = env(0.55, 0.22, 0.02);
    const a = ctx.createOscillator();
    a.type = 'sine';
    a.frequency.setValueAtTime(523.25, t); // C5 soft
    const b = ctx.createOscillator();
    b.type = 'sine';
    b.frequency.setValueAtTime(659.25, t + 0.09); // E5
    const gb = ctx.createGain();
    gb.gain.setValueAtTime(0.0001, t);
    gb.gain.exponentialRampToValueAtTime(0.18, t + 0.11);
    gb.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    gb.connect(master);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2800;
    a.connect(lp); lp.connect(g);
    b.connect(gb);
    a.start(t); a.stop(t + 0.4);
    b.start(t + 0.09); b.stop(t + 0.52);
  }

  /** Deep soft entrance — discreet luxury */
  function depth(key = 'depth') {
    if (!gate(key, 80)) return;
    const { g, t } = env(0.85, 0.28, 0.04);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(98, t);
    o.frequency.exponentialRampToValueAtTime(65, t + 0.7);
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = 196;
    const g2 = ctx.createGain();
    g2.gain.value = 0.08;
    o.connect(g);
    o2.connect(g2); g2.connect(g);
    o.start(t); o2.start(t);
    o.stop(t + 0.88); o2.stop(t + 0.88);
    setTimeout(() => glass(620, 0.16, 0.35, key + 'g'), 120);
  }

  /* ===== Public API (same call sites) ===== */

  function tick() {
    glass(880, 0.12, 0.16, 'tick');
  }

  function boot() {
    if (!ensure() || !enabled) return;
    velvet(0.9, 0.24, 'bootV');
    setTimeout(() => confirm('bootC'), 220);
  }

  function wordDrop() {
    glass(540, 0.16, 0.25, 'word');
  }

  function wordImpact() {
    glass(480, 0.12, 0.2, 'impact');
  }

  function imageShift(mode) {
    if (!ensure() || !enabled) return;
    const m = String(mode || '');
    if (m === 'bloom' || m === 'iris' || m === 'ripple') {
      velvet(0.75, 0.26, 'imgA');
      setTimeout(() => glass(700, 0.14, 0.3, 'imgAg'), 140);
    } else if (m === 'depth' || m === 'dissolve') {
      velvet(0.7, 0.22, 'imgB');
    } else {
      velvet(0.55, 0.2, 'imgC');
      setTimeout(() => glass(640, 0.12, 0.22, 'imgCg'), 90);
    }
  }

  function liquidStart() {
    if (!ensure() || !enabled) return;
    depth('liq');
    setTimeout(() => velvet(1.0, 0.28, 'liqV'), 80);
  }

  function diveEnd() {
    if (!ensure() || !enabled) return;
    velvet(0.55, 0.2, 'diveE');
    setTimeout(() => confirm('diveC'), 140);
  }

  function flip() {
    if (!ensure() || !enabled) return;
    glass(760, 0.2, 0.28, 'flip');
    setTimeout(() => glass(980, 0.12, 0.32, 'flip2'), 90);
  }

  function enter() {
    if (!ensure() || !enabled) return;
    depth('enter');
    setTimeout(() => velvet(0.85, 0.26, 'enterV'), 100);
  }

  function skyflight() {
    if (!ensure() || !enabled) return;
    velvet(1.2, 0.3, 'sky');
    setTimeout(() => glass(660, 0.14, 0.4, 'skyG'), 280);
    setTimeout(() => confirm('skyC'), 500);
  }

  function portalsAppear() {
    if (!ensure() || !enabled) return;
    glass(520, 0.14, 0.28, 'p1');
    setTimeout(() => glass(620, 0.14, 0.28, 'p2'), 140);
    setTimeout(() => glass(740, 0.14, 0.32, 'p3'), 280);
    setTimeout(() => confirm('pOk'), 420);
  }

  function success() {
    confirm('ok');
  }

  function back() {
    if (!ensure() || !enabled) return;
    velvet(0.4, 0.16, 'backV');
    setTimeout(() => glass(440, 0.12, 0.24, 'backG'), 60);
  }

  function lang() {
    glass(700, 0.14, 0.22, 'lang');
    setTimeout(() => glass(880, 0.1, 0.22, 'lang2'), 100);
  }

  // Compatibility aliases used by older call sites
  function whoosh(d, p, k) { velvet(d || 0.7, p || 0.24, k || 'whoosh'); }
  function pluck(f) { glass(f || 620, 0.16, 0.28, 'pluck'); }
  function chime(f) { glass(f || 880, 0.12, 0.35, 'chime'); }
  function click() { glass(800, 0.14, 0.18, 'click'); }
  function sweep(d, p, k) { velvet(d || 0.65, p || 0.22, k || 'sweep'); }

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
    __v: 4,
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
