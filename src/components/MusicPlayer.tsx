"use client";
import { useEffect, useRef, useState } from "react";

// A2, F2, C3, G2 roots + chord tones (Hz)
const CHORDS: number[][] = [
  [110.0, 130.81, 164.81], // Am: A2 C3 E3
  [87.31, 110.0, 130.81], // F: F2 A2 C3
  [130.81, 164.81, 196.0], // C: C3 E3 G3
  [98.0, 123.47, 146.83], // G: G2 B2 D3
];

function note(freq: number, ctx: AudioContext, dest: AudioNode, t: number, dur: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.detune.value = 4;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.5, t + 1.1);
  g.gain.setValueAtTime(0.5, t + dur - 1.2);
  g.gain.linearRampToValueAtTime(0, t + dur);
  osc.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.1);
  // bass root, one octave feel
  const bass = ctx.createOscillator();
  const bg = ctx.createGain();
  bass.type = "sine";
  bass.frequency.value = freq / 2;
  bg.gain.setValueAtTime(0, t);
  bg.gain.linearRampToValueAtTime(0.6, t + 0.4);
  bg.gain.linearRampToValueAtTime(0, t + dur);
  bass.connect(bg).connect(dest);
  bass.start(t);
  bass.stop(t + dur + 0.1);
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(true); // starts on first click (autoplay policy)
  const [mode, setMode] = useState<"synth" | "file">("synth");
  const ctxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chordRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(true);
  playingRef.current = playing;

  // Detect user-provided track: drop your song as public/bgm.mp3
  useEffect(() => {
    fetch("/bgm.mp3", { method: "HEAD" })
      .then((r) => {
        if (r.ok) {
          setMode("file");
          const a = new Audio("/bgm.mp3");
          a.loop = true;
          a.volume = 0.6;
          audioRef.current = a;
        }
      })
      .catch(() => {})
    return () => audioRef.current?.pause();
  }, []);

  // Start audio on first user gesture (browsers block autoplay with sound)
  useEffect(() => {
    const kick = () => {
      if (!playingRef.current) return;
      if (mode === "file") {
        audioRef.current?.play().catch(() => {});
      } else if (!ctxRef.current) {
        const ctx = new AudioContext();
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 750;
        const master = ctx.createGain();
        master.gain.value = 0.14;
        filter.connect(master).connect(ctx.destination);
        ctxRef.current = ctx;
        filterRef.current = filter;
        const play = () => {
          if (!playingRef.current || !ctxRef.current || !filterRef.current) return;
          const t = ctxRef.current.currentTime + 0.05;
          CHORDS[chordRef.current % CHORDS.length].forEach((f) =>
            note(f, ctxRef.current!, filterRef.current!, t, 3.4)
          );
          chordRef.current += 1;
        };
        play();
        timerRef.current = setInterval(play, 3200);
      } else {
        ctxRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("keydown", kick, { once: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
  }, [mode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const toggle = () => {
    const next = !playing;
    setPlaying(next);
    if (mode === "file") {
      if (next) audioRef.current?.play().catch(() => {});
      else audioRef.current?.pause();
    } else if (ctxRef.current) {
      if (next) ctxRef.current.resume().catch(() => {});
      else ctxRef.current.suspend().catch(() => {});
    }
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      title={playing ? `Pause music (${mode === "file" ? "bgm.mp3" : "synthwave loop"})` : "Play music"}
      className="flex items-center gap-1 px-2 text-white text-xs hover:bg-white/10 border-l border-white/30"
    >
      <span className={playing ? "animate-pulse" : ""}>{playing ? "🔊" : "🔇"}</span>
      <span className="hidden md:inline text-[10px]">{mode === "file" ? "bgm" : "synth"}</span>
    </button>
  );
}
