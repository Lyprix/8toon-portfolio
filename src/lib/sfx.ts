// Synthesized system sounds (original chimes — no audio files needed).
// Browsers require a user gesture for audio; every call fails silently
// instead of throwing when playback is blocked.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function bell(c: AudioContext, dest: AudioNode, freq: number, t: number, dur = 1.4, vol = 0.2) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.1);
  // shimmer harmonic
  const o2 = c.createOscillator();
  const g2 = c.createGain();
  o2.type = "sine";
  o2.frequency.value = freq * 2;
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(vol * 0.25, t + 0.02);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.6);
  o2.connect(g2).connect(dest);
  o2.start(t);
  o2.stop(t + dur);
}

function pad(c: AudioContext, dest: AudioNode, freqs: number[], t: number, dur: number, vol: number) {
  for (const f of freqs) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.7);
    g.gain.setValueAtTime(vol, t + dur - 0.8);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.1);
  }
}

/** Warm rising chime when the desktop appears. */
export function playStartup() {
  const c = ac();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.9;
  master.connect(c.destination);
  const t = c.currentTime + 0.05;
  pad(c, master, [220, 277.18, 329.63], t, 2.6, 0.05); // A-major swell
  [587.33, 739.99, 880, 1174.66].forEach((f, i) => bell(c, master, f, t + 0.15 + i * 0.22, 1.6, 0.2)); // D5 F#5 A5 D6
}

/** Gentle descending chime when powering off. */
export function playShutdown() {
  const c = ac();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.9;
  master.connect(c.destination);
  const t = c.currentTime + 0.05;
  [880, 698.46, 587.33, 440].forEach((f, i) => bell(c, master, f, t + i * 0.2, 1.2, 0.2)); // A5 F5 D5 A4
}
