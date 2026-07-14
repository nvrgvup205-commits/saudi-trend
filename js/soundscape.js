/* سعودي تريند — Prestige Arabic Soundscape
 * Web Audio synthesis: soft oud-like plucks, maqam chimes, ceremonial whooshes.
 * No external audio files. Respectful, quiet, and luxurious.
 */
(() => {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  if (ROOT.SaudiSound) return;

  // Soft Hijaz / Nahawand palette (Hz) — warm Arabic prestige feel
  const SCALE = [196.00, 220.00, 233.08, 293.66, 329.63, 349.23, 392.00, 440.00];

  let ctx = null;
  let master = null;
  let enabled = localStorage.getItem('st-sound') !== '0';
  let unlocked = false;
  let lastPlay = 0;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled ? 0.22 : 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    unlocked = true;
    return ctx;
  }

  function setEnabled(on) {
    enabled = !!on;
    localStorage.setItem('st-sound', enabled ? '1' : '0');
    if (master) {
      const t = (ctx && ctx.currentTime) || 0;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(enabled ? 0.22 : 0, t + 0.08);
    }
    document.querySelectorAll('.sound-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      btn.classList.toggle('is-muted', !enabled);
      btn.textContent = enabled ? '♪ صوت' : '♪ صامت';
    });
  }

  function canPlay(minGap = 30) {
    if (!enabled) return false;
    const now = performance.now();
    if (now - lastPlay < minGap) return false;
    lastPlay = now;
    return !!ensure();
  }

  function envGain(duration, peak = 0.2, attack = 0.012) {
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    g.connect(master);
    return g;
  }

  /** Soft plucked string — oud-adjacent harmonic decay */
  function pluck(freq = 293.66, dur = 0.85, peak = 0.16) {
    if (!canPlay(40)) return;
    const t = ctx.currentTime;
    const out = envGain(dur, peak, 0.008);

    // Body (fundamental)
    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.setValueAtTime(freq, t);
    o1.frequency.exponentialRampToValueAtTime(freq * 0.985, t + dur);

    // Soft upper partials
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.28;

    const o3 = ctx.createOscillator();
    o3.type = 'sine';
    o3.frequency.value = freq * 3.02;
    const g3 = ctx.createGain();
    g3.gain.value = 0.1;

    // Gentle lowpass — velvet, not sharp
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(420, t + dur * 0.8);
    filter.Q.value = 0.7;

    o1.connect(filter);
    o2.connect(g2); g2.connect(filter);
    o3.connect(g3); g3.connect(filter);
    filter.connect(out);

    o1.start(t); o2.start(t); o3.start(t);
    o1.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
    o3.stop(t + dur + 0.05);
  }

  /** Quiet sparkle chime — maqam interval */
  function chime(freq = 440, dur = 1.1, peak = 0.1) {
    if (!canPlay(35)) return;
    const t = ctx.currentTime;
    const out = envGain(dur, peak, 0.004);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 6;
    o.connect(filter);
    filter.connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** Soft ceremonial whoosh — air + distant tone */
  function whoosh(dur = 1.15, peak = 0.12) {
    if (!canPlay(80)) return;
    const t = ctx.currentTime;
    const out = envGain(dur, peak, 0.05);

    // Noise buffer
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(280, t);
    bp.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.45);
    bp.frequency.exponentialRampToValueAtTime(360, t + dur);
    bp.Q.value = 0.9;

    // Soft pad underneath
    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 164.81;
    const pg = ctx.createGain();
    pg.gain.value = 0.35;

    src.connect(bp); bp.connect(out);
    pad.connect(pg); pg.connect(out);
    src.start(t);
    pad.start(t);
    pad.stop(t + dur + 0.05);
  }

  /** Tiny hover tick — gold filament */
  function tick() {
    if (!canPlay(55)) return;
    chime(SCALE[5] * 2, 0.22, 0.035);
  }

  /** Card flip — soft pluck + fifth */
  function flip() {
    if (!ensure() || !enabled) return;
    pluck(SCALE[3], 0.7, 0.14);
    setTimeout(() => chime(SCALE[6], 0.9, 0.07), 70);
  }

  /** Enter lobe / portal — ceremonial */
  function enter() {
    if (!ensure() || !enabled) return;
    whoosh(1.25, 0.11);
    setTimeout(() => pluck(SCALE[2], 1.0, 0.12), 120);
    setTimeout(() => chime(SCALE[5], 1.2, 0.08), 280);
  }

  /** Soft success / settle */
  function success() {
    if (!ensure() || !enabled) return;
    pluck(SCALE[4], 0.55, 0.1);
    setTimeout(() => chime(SCALE[7], 0.85, 0.06), 90);
  }

  /** Back / close */
  function back() {
    if (!ensure() || !enabled) return;
    pluck(SCALE[1], 0.5, 0.09);
  }

  /** Unlock on first gesture (browser autoplay policy) */
  function unlock() {
    ensure();
  }

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
    unlock, setEnabled, isEnabled: () => enabled,
    tick, flip, enter, whoosh, success, back, pluck, chime, wireUI
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wireUI());
  } else {
    wireUI();
  }
})();
