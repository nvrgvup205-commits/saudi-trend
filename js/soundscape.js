/* سعودي تريند — Prestige Arabic Soundscape
 * Clear, loud, elegant Web Audio cues mapped to every transition.
 * Maqam-inspired (Hijaz / Nahawand). No external audio files.
 */
(() => {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  if (ROOT.SaudiSound && ROOT.SaudiSound.__v >= 2) return;

  const SCALE = [196.00, 220.00, 233.08, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25];
  const MASTER = 0.62; // واضح وعالي مع الحفاظ على الرقي

  let ctx = null;
  let master = null;
  let enabled = localStorage.getItem('st-sound') !== '0';
  const lastByKey = Object.create(null);
  let wordIndex = 0;

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
      master.gain.linearRampToValueAtTime(enabled ? MASTER : 0, t + 0.1);
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

  function env(duration, peak = 0.35, attack = 0.012) {
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack + 0.04, duration));
    g.connect(master);
    return { g, t };
  }

  function noiseBuffer(dur) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const fade = 1 - i / len;
      data[i] = (Math.random() * 2 - 1) * fade;
    }
    return buf;
  }

  function pluck(freq, dur = 0.9, peak = 0.38, key = 'pluck') {
    if (!gate(key, 28)) return;
    const { g, t } = env(dur, peak, 0.007);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(480, t + dur * 0.75);
    filter.Q.value = 0.85;

    const o1 = ctx.createOscillator();
    o1.type = 'triangle';
    o1.frequency.setValueAtTime(freq, t);
    o1.frequency.exponentialRampToValueAtTime(freq * 0.98, t + dur);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.005;
    const g2 = ctx.createGain(); g2.gain.value = 0.32;

    const o3 = ctx.createOscillator();
    o3.type = 'sine';
    o3.frequency.value = freq * 3.01;
    const g3 = ctx.createGain(); g3.gain.value = 0.12;

    o1.connect(filter);
    o2.connect(g2); g2.connect(filter);
    o3.connect(g3); g3.connect(filter);
    filter.connect(g);
    [o1, o2, o3].forEach(o => { o.start(t); o.stop(t + dur + 0.05); });
  }

  function chime(freq, dur = 1.15, peak = 0.28, key = 'chime') {
    if (!gate(key, 24)) return;
    const { g, t } = env(dur, peak, 0.003);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = 8;
    // Shimmer partial
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.003;
    const g2 = ctx.createGain(); g2.gain.value = 0.22;
    o.connect(bp); bp.connect(g);
    o2.connect(g2); g2.connect(g);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  function whoosh(dur = 1.35, peak = 0.42, key = 'whoosh') {
    if (!gate(key, 70)) return;
    const { g, t } = env(dur, peak, 0.04);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.85;
    bp.frequency.setValueAtTime(220, t);
    bp.frequency.exponentialRampToValueAtTime(1800, t + dur * 0.4);
    bp.frequency.exponentialRampToValueAtTime(300, t + dur);

    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 146.83;
    const pg = ctx.createGain(); pg.gain.value = 0.45;

    const pad2 = ctx.createOscillator();
    pad2.type = 'triangle';
    pad2.frequency.value = 220;
    const pg2 = ctx.createGain(); pg2.gain.value = 0.12;

    src.connect(bp); bp.connect(g);
    pad.connect(pg); pg.connect(g);
    pad2.connect(pg2); pg2.connect(g);
    src.start(t);
    pad.start(t); pad2.start(t);
    pad.stop(t + dur + 0.05); pad2.stop(t + dur + 0.05);
  }

  function boom(freq = 73.42, dur = 0.85, peak = 0.48, key = 'boom') {
    if (!gate(key, 90)) return;
    const { g, t } = env(dur, peak, 0.01);
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.8, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    const o2 = ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(freq * 2.2, t);
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2); g2.connect(g);
    o.start(t); o2.start(t);
    o.stop(t + dur); o2.stop(t + dur);
  }

  function swirl(dur = 0.7, peak = 0.32, key = 'swirl') {
    if (!gate(key, 55)) return;
    const { g, t } = env(dur, peak, 0.02);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 2.4;
    bp.frequency.setValueAtTime(600, t);
    bp.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.5);
    bp.frequency.exponentialRampToValueAtTime(480, t + dur);
    src.connect(bp); bp.connect(g);
    src.start(t);
  }

  function shimmerFan(base = 392, peak = 0.26) {
    if (!ensure() || !enabled) return;
    [0, 0.07, 0.14, 0.22].forEach((delay, i) => {
      setTimeout(() => chime(base * (1 + i * 0.12), 0.85, peak * (1 - i * 0.12), 'fan' + i), delay * 1000);
    });
  }

  /* ===== Named transition cues ===== */

  function tick() {
    if (!gate('tick', 70)) return;
    chime(SCALE[8] * 1.5, 0.18, 0.14, 'tickTone');
  }

  function boot() {
    if (!ensure() || !enabled) return;
    whoosh(1.1, 0.36, 'bootW');
    setTimeout(() => pluck(SCALE[4], 0.9, 0.4, 'bootP'), 140);
    setTimeout(() => chime(SCALE[7], 1.1, 0.28, 'bootC'), 260);
  }

  function wordDrop() {
    if (!ensure() || !enabled) return;
    const i = wordIndex++ % SCALE.length;
    const f = SCALE[3 + (i % 5)];
    pluck(f, 0.55, 0.34, 'word' + i);
    setTimeout(() => chime(f * 2, 0.45, 0.16, 'wordC' + i), 40);
  }

  function wordImpact() {
    if (!ensure() || !enabled) return;
    boom(98, 0.35, 0.22, 'wImpact');
  }

  /** Dive / image montage modes */
  function imageShift(mode) {
    if (!ensure() || !enabled) return;
    const m = String(mode || 'dissolve');
    if (m === 'iris' || m === 'ripple') {
      whoosh(0.95, 0.4, 'iris');
      setTimeout(() => chime(SCALE[6], 0.9, 0.3, 'irisC'), 80);
      return;
    }
    if (m === 'shear' || m === 'split') {
      swirl(0.75, 0.38, 'shear');
      setTimeout(() => pluck(SCALE[5], 0.65, 0.36, 'shearP'), 60);
      return;
    }
    if (m === 'bloom') {
      boom(82, 0.7, 0.4, 'bloom');
      setTimeout(() => shimmerFan(440, 0.3), 90);
      return;
    }
    if (m === 'depth') {
      whoosh(1.15, 0.38, 'depth');
      setTimeout(() => pluck(SCALE[2], 1.0, 0.34, 'depthP'), 100);
      return;
    }
    if (m === 'kaleid') {
      swirl(0.85, 0.36, 'kal');
      setTimeout(() => {
        chime(SCALE[5], 0.7, 0.28, 'kal1');
        chime(SCALE[7], 0.9, 0.24, 'kal2');
      }, 70);
      return;
    }
    // dissolve default — soft liquid morph
    whoosh(0.85, 0.34, 'diss');
    setTimeout(() => pluck(SCALE[4], 0.7, 0.32, 'dissP'), 90);
  }

  function liquidStart() {
    if (!ensure() || !enabled) return;
    whoosh(1.4, 0.48, 'liq');
    boom(65, 1.0, 0.4, 'liqB');
    setTimeout(() => pluck(SCALE[3], 1.1, 0.42, 'liqP'), 160);
    setTimeout(() => chime(SCALE[8], 1.3, 0.32, 'liqC'), 320);
  }

  function diveEnd() {
    if (!ensure() || !enabled) return;
    whoosh(0.9, 0.36, 'diveEnd');
    setTimeout(() => {
      pluck(SCALE[5], 0.8, 0.38, 'diveEndP');
      chime(SCALE[8], 1.0, 0.3, 'diveEndC');
    }, 120);
  }

  function flip() {
    if (!ensure() || !enabled) return;
    swirl(0.45, 0.3, 'flipS');
    pluck(SCALE[5], 0.75, 0.42, 'flipP');
    setTimeout(() => chime(SCALE[8], 0.95, 0.3, 'flipC'), 70);
  }

  function enter() {
    if (!ensure() || !enabled) return;
    boom(70, 0.9, 0.45, 'enterB');
    whoosh(1.5, 0.5, 'enterW');
    setTimeout(() => pluck(SCALE[3], 1.15, 0.44, 'enterP'), 130);
    setTimeout(() => {
      chime(SCALE[6], 1.2, 0.34, 'enterC1');
      chime(SCALE[8], 1.35, 0.28, 'enterC2');
    }, 280);
  }

  function skyflight() {
    if (!ensure() || !enabled) return;
    whoosh(2.0, 0.52, 'sky');
    setTimeout(() => pluck(SCALE[2], 1.3, 0.4, 'skyP'), 200);
    setTimeout(() => shimmerFan(392, 0.28), 420);
    setTimeout(() => chime(SCALE[9], 1.4, 0.32, 'skyC'), 700);
  }

  function portalsAppear() {
    if (!ensure() || !enabled) return;
    boom(82, 0.7, 0.36, 'portB');
    setTimeout(() => pluck(SCALE[4], 0.85, 0.4, 'portP1'), 80);
    setTimeout(() => pluck(SCALE[6], 0.9, 0.38, 'portP2'), 220);
    setTimeout(() => pluck(SCALE[7], 1.0, 0.36, 'portP3'), 360);
    setTimeout(() => shimmerFan(523, 0.26), 480);
  }

  function success() {
    if (!ensure() || !enabled) return;
    pluck(SCALE[5], 0.7, 0.4, 'okP');
    setTimeout(() => {
      chime(SCALE[7], 1.0, 0.32, 'okC1');
      chime(SCALE[9], 1.15, 0.28, 'okC2');
    }, 90);
  }

  function back() {
    if (!ensure() || !enabled) return;
    whoosh(0.7, 0.3, 'backW');
    pluck(SCALE[2], 0.65, 0.34, 'backP');
  }

  function lang() {
    if (!ensure() || !enabled) return;
    chime(SCALE[6], 0.55, 0.28, 'lang1');
    setTimeout(() => chime(SCALE[8], 0.7, 0.26, 'lang2'), 80);
  }

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
    __v: 2,
    unlock, setEnabled, isEnabled: () => enabled,
    tick, boot, wordDrop, wordImpact, imageShift, liquidStart, diveEnd,
    flip, enter, skyflight, portalsAppear, success, back, lang,
    whoosh, pluck, chime, wireUI
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wireUI());
  } else {
    wireUI();
  }
})();
