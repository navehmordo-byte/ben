/*
 * כל הצלילים והמוזיקה של האתר נוצרים כאן בקוד (Web Audio API).
 * אין קבצי אודיו, ולכן אין צורך באינטרנט ואין בעיית זכויות יוצרים.
 */
const Sound = (function () {
  const PREF_KEY = "sports-audio";
  const prefs = { music: true, sfx: true };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY)) || {}); } catch (e) {}
  function save() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }

  let ctx = null, musicBus, sfxBus, noiseBuf;

  // דפדפנים מאפשרים צליל רק אחרי לחיצה; עד אז הכל ממתין בתור ומתנגן בלחיצה הראשונה
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const master = ctx.createGain();
      master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0.3; musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  document.addEventListener("pointerdown", ac, true);
  document.addEventListener("keydown", ac, true);

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- אבני בניין ----------
  function env(g, t, peak, attack, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function tone(t, freq, dur, o = {}) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    if (o.vibrato) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = o.vibrato[0]; lg.gain.value = o.vibrato[1];
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur);
    }
    let node = osc;
    if (o.lowpass) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = o.lowpass;
      node = node.connect(f);
    }
    if (o.pan !== undefined && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner(); p.pan.value = o.pan;
      node = node.connect(p);
    }
    node.connect(g).connect(o.bus || sfxBus);
    if (o.hold) {
      // צליל רציף (באזר/שריקה): עולה מהר, מחזיק, ויורד בסוף
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.gain || 0.3, t + 0.02);
      g.gain.setValueAtTime(o.gain || 0.3, t + dur - 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    } else env(g, t, o.gain || 0.3, o.attack || 0.005, dur);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(t, dur, o = {}) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.filter || "bandpass";
    f.frequency.setValueAtTime(o.freq || 1000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    src.connect(f).connect(g).connect(o.bus || sfxBus);
    if (o.swell) {
      // עלייה איטית ודעיכה (קהל, מחיאות כפיים)
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.gain || 0.3, t + dur * o.swell);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    } else env(g, t, o.gain || 0.3, o.attack || 0.002, dur);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  // ---------- צלילי הספורט ----------
  const whistle = (t, dur) => tone(t, 2900, dur, { gain: 0.18, hold: true, vibrato: [28, 180] });
  const buzzer = (t, dur) => {
    tone(t, 196, dur, { type: "sawtooth", gain: 0.12, hold: true, lowpass: 1400 });
    tone(t, 199, dur, { type: "square", gain: 0.08, hold: true, lowpass: 1400 });
  };
  const bounce = (t, g = 0.5) => {
    tone(t, 160, 0.14, { to: 55, gain: g });
    noise(t, 0.05, { filter: "lowpass", freq: 500, gain: g * 0.5 });
  };
  const racketHit = (t, pan, pitch = 1) => {
    tone(t, 950 * pitch, 0.06, { to: 420 * pitch, gain: 0.35, pan });
    noise(t, 0.03, { freq: 2200, q: 2, gain: 0.25 });
  };
  const pingTick = (t, freq) => tone(t, freq, 0.04, { to: freq * 0.8, gain: 0.3, type: "triangle" });
  const applause = (t, dur) => {
    noise(t, dur, { freq: 2500, q: 0.6, gain: 0.12, swell: 0.3 });
    for (let k = 0; k < dur * 30; k++) noise(t + Math.random() * dur * 0.8, 0.02, { freq: 1500 + Math.random() * 2500, q: 3, gain: 0.08 });
  };
  const fanfare = (t, notes, step = 0.12) => {
    notes.forEach((m, k) => {
      const last = k === notes.length - 1;
      tone(t + k * step, midi(m), last ? 1.1 : 0.2, { type: "triangle", gain: 0.22 });
      if (last) tone(t + k * step, midi(m + 7), 1.1, { type: "sine", gain: 0.1 });
    });
  };

  // צליל פתיחה לכל ספורט. מחזיר את האורך שלו בשניות
  const INTROS = {
    football(t) {
      noise(t, 3, { freq: 700, q: 0.6, gain: 0.35, swell: 0.45 }); // שאגת הקהל
      noise(t + 0.3, 2.4, { freq: 1800, q: 0.8, gain: 0.1, swell: 0.5 });
      whistle(t + 1.3, 0.22);
      whistle(t + 1.65, 0.7);
      return 2.8;
    },
    basketball(t) {
      bounce(t); bounce(t + 0.38, 0.45); bounce(t + 0.74, 0.4);
      buzzer(t + 1.15, 0.9);
      return 2.3;
    },
    swimming(t) {
      noise(t, 0.8, { filter: "bandpass", freq: 3500, to: 600, q: 0.7, gain: 0.45 }); // שפלאש
      noise(t, 0.35, { filter: "lowpass", freq: 400, gain: 0.4 });
      for (let k = 0; k < 9; k++) {
        const bt = t + 0.6 + Math.random() * 1.3, f = 300 + Math.random() * 400;
        tone(bt, f, 0.08, { to: f * 2.4, gain: 0.15 });
      }
      return 2.3;
    },
    tennis(t) {
      racketHit(t, -0.6); racketHit(t + 0.6, 0.6, 0.9); racketHit(t + 1.2, -0.6); racketHit(t + 1.8, 0.6, 0.9);
      applause(t + 2.2, 1.2);
      return 3.2;
    },
    pingpong(t) {
      const times = [0, 0.32, 0.58, 0.8, 0.98, 1.14, 1.28, 1.41, 1.53];
      times.forEach((dt, k) => pingTick(t + dt, k % 2 ? 1300 : 1900));
      return 1.9;
    }
  };

  // צליל "נגמר" בסוף הסרטון
  const ENDS = {
    football(t) { whistle(t, 0.3); whistle(t + 0.45, 0.3); whistle(t + 0.9, 1.1); },
    basketball(t) { buzzer(t, 1.5); },
    swimming(t) { [0, 0.5].forEach((d) => { tone(t + d, 1320, 1.4, { gain: 0.2 }); tone(t + d, 3300, 0.8, { gain: 0.06 }); }); },
    tennis(t) { fanfare(t, [72, 76, 79, 84]); applause(t + 0.4, 1.8); },
    pingpong(t) { fanfare(t, [67, 71, 74, 79]); }
  };

  // ---------- מוזיקת רקע ----------
  // אקורדים כמרווחים (חצאי טונים) מהטוניקה. כל ספורט מקבל טמפו, סולם וסגנון משלו
  const SONGS = {
    football:   { bpm: 118, root: 57, chords: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], snare: true },
    basketball: { bpm: 94,  root: 50, chords: [[0, 3, 7], [5, 8, 12], [-4, 0, 3], [-5, -2, 2]], snare: true, swing: true },
    swimming:   { bpm: 104, root: 55, chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], snare: false },
    tennis:     { bpm: 112, root: 60, chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], snare: true },
    pingpong:   { bpm: 124, root: 52, chords: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-2, 2, 5]], snare: true }
  };

  let music = null;

  function playStep(m, s, t) {
    const { cfg, bus } = m;
    const pos = s % 16, bar = Math.floor(s / 16) % cfg.chords.length;
    const chord = cfg.chords[bar];
    const o = { bus };
    // תוף בס
    if (pos === 0 || pos === 8 || (cfg.swing && pos === 10)) {
      tone(t, 130, 0.25, { ...o, to: 45, gain: 0.7 });
    }
    // סנר / קלאפ
    if (cfg.snare && (pos === 4 || pos === 12)) noise(t, 0.14, { ...o, freq: 1800, q: 0.8, gain: 0.25 });
    // הי-הט
    if (pos % 2 === 0) noise(t, 0.04, { ...o, filter: "highpass", freq: 8000, gain: pos % 4 === 2 ? 0.14 : 0.07 });
    // בס
    if ([0, 3, 8, 11].includes(pos)) tone(t, midi(cfg.root - 24 + chord[0]), 0.28, { ...o, type: "triangle", gain: 0.35 });
    // פד רך בתחילת כל תיבה
    if (pos === 0) {
      const barDur = (60 / cfg.bpm) * 4;
      chord.forEach((iv) => tone(t, midi(cfg.root + iv), barDur, { ...o, type: "sawtooth", gain: 0.035, attack: 0.4, lowpass: 900 }));
    }
    // ארפג'יו קטן ועדין
    if (pos % 4 === 2) tone(t, midi(cfg.root + 12 + chord[(pos / 4 | 0) % 3]), 0.18, { ...o, type: "triangle", gain: 0.06 });
  }

  function startMusic(id, delay = 0) {
    stopMusic();
    if (!prefs.music) return;
    const c = ac();
    if (!c) return;
    const cfg = SONGS[id] || SONGS.football;
    const bus = c.createGain();
    bus.connect(musicBus);
    const t0 = c.currentTime + delay + 0.05;
    bus.gain.setValueAtTime(0.0001, t0);
    bus.gain.exponentialRampToValueAtTime(1, t0 + 2);
    music = { cfg, bus, step: 0, next: t0 };
    const sixteenth = 60 / cfg.bpm / 4;
    music.timer = setInterval(() => {
      while (music && music.next < ctx.currentTime + 0.15) {
        playStep(music, music.step, music.next);
        music.next += sixteenth;
        music.step++;
      }
    }, 25);
  }

  function stopMusic() {
    if (!music) return;
    clearInterval(music.timer);
    const { bus } = music, t = ctx.currentTime;
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), t);
    bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    setTimeout(() => bus.disconnect(), 400);
    music = null;
  }

  function sfx(fn) {
    if (!prefs.sfx) return 0;
    const c = ac();
    return c ? fn(c.currentTime + 0.02) || 0 : 0;
  }

  return {
    click: () => sfx((t) => {
      tone(t, 1400, 0.035, { to: 700, gain: 0.15 });
      noise(t, 0.015, { freq: 4000, gain: 0.05 });
    }),
    intro: (id) => sfx((t) => (INTROS[id] || INTROS.football)(t)),
    end: (id) => sfx((t) => (ENDS[id] || ((tt) => fanfare(tt, [72, 76, 79, 84])))(t)),
    startMusic,
    stopMusic,
    get musicOn() { return prefs.music; },
    get sfxOn() { return prefs.sfx; },
    setMusic(v) { prefs.music = v; save(); if (!v) stopMusic(); },
    setSfx(v) { prefs.sfx = v; save(); }
  };
})();
