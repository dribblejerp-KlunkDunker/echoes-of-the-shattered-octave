// ============================================================
//  AUDIO — procedural. The whole Octave sounds a quarter-tone wrong.
// ============================================================
'use strict';
const Audio_ = (() => {
  let ctx = null, master = null, droneGain = null, wind = null, windGain = null, muted = false, lampOsc = null, lampGain = null;
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
    // drone: 174 Hz and a quarter-tone-flat partner, beating slowly
    droneGain = ctx.createGain(); droneGain.gain.value = 0; droneGain.connect(master);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
    o1.type = 'sine'; o1.frequency.value = 174; o2.type = 'sine'; o2.frequency.value = 171.5; o3.type = 'triangle'; o3.frequency.value = 87;
    const g3 = ctx.createGain(); g3.gain.value = 0.25;
    o1.connect(droneGain); o2.connect(droneGain); o3.connect(g3).connect(droneGain);
    o1.start(); o2.start(); o3.start();
    // wind: filtered noise
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    wind = ctx.createBufferSource(); wind.buffer = buf; wind.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 0.6;
    windGain = ctx.createGain(); windGain.gain.value = 0;
    wind.connect(bp).connect(windGain).connect(master); wind.start();
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 250; lfo.connect(lg).connect(bp.frequency); lfo.start();
    // hush-lamp reed whistle (tiny)
    lampOsc = ctx.createOscillator(); lampOsc.type = 'sine'; lampOsc.frequency.value = 1760; lampGain = ctx.createGain(); lampGain.gain.value = 0; lampOsc.connect(lampGain).connect(master); lampOsc.start();
    const l2 = ctx.createOscillator(); l2.frequency.value = 5.3; const l2g = ctx.createGain(); l2g.gain.value = 0.004; l2.connect(l2g).connect(lampGain.gain); l2.start();
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function setScene(kind) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const dg = ({ town: 0.05, inside: 0.03, wild: 0.07, dungeon: 0.11, root: 0.16 }[kind] || 0.05) * 0.45;
    const wg = { town: 0.05, inside: 0.01, wild: 0.09, dungeon: 0.02, root: 0.03 }[kind] || 0.03;
    const lg = { town: 0.012, inside: 0.02, wild: 0.0, dungeon: 0.0, root: 0.0 }[kind] || 0;
    droneGain.gain.linearRampToValueAtTime(dg, t + 1.5); windGain.gain.linearRampToValueAtTime(wg, t + 1.5); lampGain.gain.linearRampToValueAtTime(lg, t + 1.5);
  }
  function noiseBurst(dur, vol, freq, q, type) {
    if (!ctx || muted) return;
    const n = ctx.createBufferSource(); const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    n.connect(f).connect(g).connect(master); n.start();
  }
  function tone(freq, dur, vol, type, slideTo) {
    if (!ctx || muted) return;
    const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(master); o.start(); o.stop(ctx.currentTime + dur + 0.05);
  }
  const sfx = {
    step: () => noiseBurst(0.08, 0.12, 300 + Math.random() * 200, 0.8, 'lowpass'),
    swing: () => noiseBurst(0.18, 0.2, 900, 0.5, 'bandpass'),
    hit: () => { noiseBurst(0.12, 0.35, 250, 0.8, 'lowpass'); tone(90, 0.15, 0.2, 'triangle', 50); },
    glasshit: () => { tone(528, 0.5, 0.18, 'sine'); tone(1056, 0.4, 0.06, 'sine'); noiseBurst(0.1, 0.2, 2000, 1); },
    shot: () => { noiseBurst(0.35, 0.6, 700, 0.4, 'lowpass'); tone(1200, 0.25, 0.1, 'sine', 300); },
    hound: () => { noiseBurst(0.5, 0.25, 1800, 0.9, 'bandpass'); noiseBurst(0.3, 0.15, 350, 2, 'bandpass'); },
    bell: () => { tone(440, 1.4, 0.18, 'sine'); tone(880 * 1.01, 1.0, 0.07, 'sine'); tone(1320, 0.5, 0.03, 'sine'); },
    bellDie: () => { tone(440, 2.6, 0.2, 'sine', 300); tone(660, 1.4, 0.05, 'sine'); },
    golem: () => { noiseBurst(0.6, 0.3, 500, 0.5, 'lowpass'); tone(60, 0.5, 0.3, 'square', 40); },
    hurt: () => { noiseBurst(0.2, 0.35, 180, 1, 'lowpass'); tone(130, 0.3, 0.2, 'sawtooth', 70); },
    door: () => { tone(120, 0.5, 0.12, 'sawtooth', 70); noiseBurst(0.4, 0.1, 500, 0.5, 'lowpass'); },
    pickup: () => { tone(660, 0.1, 0.12); setTimeout(() => tone(990, 0.15, 0.12), 90); },
    ui: () => tone(520, 0.05, 0.06, 'square'),
    song: (hz, dur) => { tone(hz, dur || 1.2, 0.2, 'sine'); tone(hz * 2, dur || 1.2, 0.05, 'sine'); tone(hz * 3.01, (dur || 1.2) * 0.7, 0.02, 'sine'); },
    fifth: () => { tone(174, 0.6, 0.22, 'sine'); setTimeout(() => tone(174, 0.9, 0.22, 'sine', 116), 500); },
    murmur: () => tone(130 + Math.random() * 10, 0.5, 0.05, 'triangle'),
    press: () => { tone(741, 0.9, 0.3, 'square'); tone(741 * 2, 0.5, 0.08, 'sine'); },
    quiet: () => { if (ctx && !muted) { const t = ctx.currentTime; master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.05, t + 0.3); master.gain.linearRampToValueAtTime(0.55, t + 1.6); } },
    crack: () => { noiseBurst(1.2, 0.5, 200, 0.3, 'lowpass'); tone(174, 2.5, 0.3, 'sine', 60); tone(45, 2, 0.3, 'sawtooth'); },
    voice: () => { tone(220, 0.35, 0.08, 'triangle', 180); setTimeout(() => tone(196, 0.5, 0.08, 'triangle', 160), 300); },
  };
  function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.55; return muted; }

  // ------------------------------------------------------------ the score
  // Eight original orchestral cues (General MIDI orchestra, like Daggerfall's own score), streamed as needed.
  // Exploration cues play through, fall silent for a while, and return; combat and the Greening loop seamlessly.
  const TRACKS = {
    title: { gap: [4, 6] }, town: { gap: [18, 40] }, wild: { gap: [20, 45] }, dungeon: { gap: [14, 30] },
    tavern: { gap: [6, 12] }, ending: { gap: [5, 8] },
    combat: { loop: 128 * 60 / 128 }, greening: { loop: 128 * 60 / 140 },
  };
  const music = (() => {
    const els = {}; let want = null, wantVol = 1, wantRate = 1, enabled = true, unlocked = false;
    const VOL = 0.62, XF = 0.14;
    function mk(id) {
      const a = new Audio(); a.preload = 'auto'; a.src = `music/${id}.mp3?v=1`; a.volume = 0;
      a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; return a;
    }
    function get(id) {
      if (!els[id]) els[id] = { a: mk(id), b: TRACKS[id].loop ? mk(id) : null, cur: 0, vol: 0, playing: false, gap: 0, xf: 0, pending: false };
      return els[id];
    }
    function start(e, el, from) {
      if (from != null) { try { el.currentTime = from; } catch (err) { /* not loaded yet */ } }
      e.pending = true;
      const pr = el.play(); if (pr && pr.then) pr.then(() => { e.pending = false; unlocked = true; }).catch(() => { e.pending = false; e.playing = false; e.gap = 0.8; });
      e.playing = true;
    }
    function request(id, vol, rate) { want = id; wantVol = vol == null ? 1 : vol; wantRate = rate || 1; if (id) get(id); }
    function preload(ids) { ids.forEach(get); }
    function tick(dt) {
      for (const id in els) {
        const e = els[id], T = TRACKS[id];
        const target = (id === want && enabled && !muted) ? wantVol : 0;
        e.vol = target > e.vol ? Math.min(target, e.vol + dt / 2.2) : Math.max(target, e.vol - dt / 1.4);
        const act = e.cur ? e.b : e.a, other = e.cur ? e.a : e.b;
        if (target > 0 && !e.playing && !e.pending) {
          if (e.gap > 0) e.gap -= dt;
          else start(e, act, act.ended ? 0 : null);
        }
        if (e.playing && e.vol <= 0.001 && target === 0) { e.a.pause(); if (e.b) e.b.pause(); e.playing = false; if (T.loop) { e.cur = 0; try { e.a.currentTime = 0; } catch (err) { } } }
        if (e.playing && T.loop && !act.paused && act.currentTime >= T.loop - XF) {
          // seamless loop: the start of the file already holds the reverb tail of its own end
          start(e, other, 0); e.cur ^= 1; e.xf = XF;
        }
        if (e.playing && !T.loop && act.ended) { e.playing = false; e.gap = T.gap[0] + Math.random() * (T.gap[1] - T.gap[0]); }
        if (e.xf > 0) e.xf = Math.max(0, e.xf - dt);
        const nowAct = e.cur ? e.b : e.a, nowOld = e.cur ? e.a : e.b;
        const v = Math.max(0, Math.min(1, e.vol * VOL));
        nowAct.volume = T.loop ? v * (1 - e.xf / XF) : v;
        if (nowOld) { nowOld.volume = v * (e.xf / XF); if (e.xf <= 0 && !nowOld.paused) nowOld.pause(); }
        if (nowAct.playbackRate !== (id === want ? wantRate : nowAct.playbackRate)) nowAct.playbackRate = wantRate;
      }
    }
    const debug = () => Object.fromEntries(Object.entries(els).map(([id, e]) => [id, { playing: e.playing, vol: +e.vol.toFixed(2), t: +((e.cur ? e.b : e.a).currentTime).toFixed(1), cur: e.cur, paused: (e.cur ? e.b : e.a).paused, gap: +e.gap.toFixed(1), rate: (e.cur ? e.b : e.a).playbackRate }]));
    const seek = (id, t) => { const e = els[id]; if (e) (e.cur ? e.b : e.a).currentTime = t; };
    return { request, preload, tick, debug, seek, get enabled() { return enabled; }, set enabled(v) { enabled = !!v; }, get current() { return want; }, get unlocked() { return unlocked; } };
  })();

  return { init, resume, setScene, sfx, toggleMute, music, get ready() { return !!ctx; }, get muted() { return muted; } };
})();
