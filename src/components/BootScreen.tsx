"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BIOS_LINES = [
  "8TOON BIOS v6.00PG — Energy Star Ally",
  "CPU : VaporCore 2000+ @ 2.6GHz",
  "Memory Test :  640K OK",
  "Detecting IDE Drives ... OK",
  "Starting 8ToonOS ...",
];

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState(0);
  const [phase, setPhase] = useState<"bios" | "loading" | "fade">("bios");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BIOS_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setLines(i + 1), 350 + i * 320));
    });
    timers.push(setTimeout(() => setPhase("loading"), 350 + BIOS_LINES.length * 320 + 300));
    timers.push(setTimeout(() => setPhase("fade"), 4900));
    timers.push(setTimeout(onDone, 5300));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      onClick={onDone}
      className="h-screen w-screen bg-black flex flex-col cursor-pointer overflow-hidden select-none"
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      {phase === "bios" ? (
        <div className="p-6 sm:p-10 font-mono text-green-400 text-xs sm:text-sm leading-6">
          {BIOS_LINES.slice(0, lines).map((l) => (
            <p key={l}>{l}</p>
          ))}
          <span className="blink">█</span>
          <p className="mt-8 text-gray-600 text-[10px]">CLICK TO SKIP_</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-black">
          <p className="text-white font-black text-4xl sm:text-5xl tracking-tight">
            8Toon<span className="text-[#ff71ce]">XP</span>
          </p>
          <p className="text-gray-400 text-xs mt-1 tracking-[0.3em]">v a p o r w a v e&nbsp;&nbsp;e d i t i o n</p>
          <div className="mt-8 w-44 h-4 border border-gray-500 rounded-sm overflow-hidden flex gap-[3px] p-[2px]">
            <div className="xp-loadbar flex gap-[3px]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-full bg-gradient-to-b from-[#7db4f5] to-[#245edb]" />
              ))}
            </div>
          </div>
          <p className="text-gray-600 text-[10px] mt-6 font-mono">loading desktop modules…</p>
        </div>
      )}
      <style jsx>{`
        .xp-loadbar {
          animation: loadslide 1.1s linear infinite;
        }
        @keyframes loadslide {
          from { transform: translateX(-24px); }
          to { transform: translateX(160px); }
        }
      `}</style>
    </motion.div>
  );
}
