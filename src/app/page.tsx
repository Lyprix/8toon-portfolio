"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import XPWindow from "@/components/XPWindow";
import ParticleField from "@/components/ParticleField";
import SceneBackground from "@/components/SceneBackground";
import VaporFilter from "@/components/VaporFilter";
import BootScreen from "@/components/BootScreen";
import MusicPlayer from "@/components/MusicPlayer";
import { HomeContent, AboutContent, ProjectsContent, SkillsContent, AchievementsContent, ContactContent } from "@/components/WindowContents";
import { GamesContent } from "@/components/Games";
import { portfolio } from "@/data/portfolio";
import { playStartup, playShutdown } from "@/lib/sfx";

type WinId = "home" | "about" | "projects" | "skills" | "achievements" | "contact" | "games";
type IconMeta = { id: WinId; title: string; icon: string; file: string };

const ICONS: IconMeta[] = [
  { id: "home", title: "Home", icon: "🏠", file: "home.exe" },
  { id: "about", title: "About Me", icon: "👤", file: "about.txt" },
  { id: "projects", title: "Projects", icon: "📁", file: "projects" },
  { id: "skills", title: "Skills", icon: "💿", file: "skills.dll" },
  { id: "achievements", title: "Achievements", icon: "🏆", file: "awards.doc" },
  { id: "games", title: "Games", icon: "🎮", file: "games.exe" },
  { id: "contact", title: "Contact", icon: "📬", file: "contact.eml" },
];

const TITLES: Record<WinId, string> = {
  home: "🏠 Welcome - Home",
  about: "👤 About Me - Notepad",
  projects: "📁 My Projects - Explorer",
  skills: "💿 Skills - Control Panel",
  achievements: "🏆 Achievements",
  games: "🎮 Mini Games - Arcade",
  contact: "📬 Contact Me - Outlook",
};

function DeskIcon({ ic, onOpen, isMobile }: { ic: IconMeta; onOpen: (id: WinId) => void; isMobile: boolean }) {
  return (
    <motion.button
      onDoubleClick={() => onOpen(ic.id)}
      onClick={() => onOpen(ic.id)}
      className="desktop-icon flex flex-col items-center gap-1 group"
      whileHover={{ scale: 1.1, rotate: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
    >
      <span className="icon-bg text-4xl p-1.5 rounded-sm transition-colors drop-shadow-[2px_2px_2px_rgba(0,0,0,0.7)]">{ic.icon}</span>
      <span className="text-white text-[11px] text-center leading-tight drop-shadow-[1px_1px_1px_black] px-1">{ic.title}<br /><span className="opacity-70 text-[9px]">{isMobile ? "" : ic.file}</span></span>
    </motion.button>
  );
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);
  if (!now) return "--:--";
  return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const f = () => setM(window.innerWidth < 640);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return m;
}

export default function Desktop() {
  const [open, setOpen] = useState<WinId[]>(["home"]);
  const [minimized, setMinimized] = useState<Set<WinId>>(new Set());
  const [focus, setFocus] = useState<WinId>("home");
  const [zOrder, setZOrder] = useState<WinId[]>(["home"]);
  const [startOpen, setStartOpen] = useState(false);
  const [shuttingDown, setShuttingDown] = useState(false);
  const [off, setOff] = useState(false);
  const [booted, setBooted] = useState(false);
  const clock = useClock();
  const isMobile = useIsMobile();

  const bringToFront = (id: WinId) => {
    setFocus(id);
    setZOrder((z) => [...z.filter((w) => w !== id), id]);
    setMinimized((m) => { const n = new Set(m); n.delete(id); return n; });
  };

  const openWindow = (id: WinId) => {
    setOpen((o) => (o.includes(id) ? o : [...o, id]));
    bringToFront(id);
    setStartOpen(false);
  };

  const closeWindow = (id: string) => setOpen((o) => o.filter((w) => w !== id));
  const minimizeWindow = (id: string) =>
    setMinimized((m) => new Set(m).add(id as WinId));

  const shutdown = () => {
    setStartOpen(false);
    playShutdown();
    setShuttingDown(true);
    setTimeout(() => { setShuttingDown(false); setOff(true); }, 2600);
    try { window.close(); } catch { /* browsers block this — show our screen instead */ }
  };
  const reboot = () => { setOff(false); setOpen(["home"]); setZOrder(["home"]); setFocus("home"); setMinimized(new Set()); };

  const zOf = (id: WinId) => zOrder.indexOf(id) + 10;
  const posOf = (i: number) => ({ x: 60 + i * 36, y: 28 + i * 32 });

  const renderContent = (id: WinId) => {
    switch (id) {
      case "home": return <HomeContent />;
      case "about": return <AboutContent />;
      case "projects": return <ProjectsContent />;
      case "skills": return <SkillsContent />;
      case "achievements": return <AchievementsContent />;
      case "games": return <GamesContent />;
      case "contact": return <ContactContent />;
    }
  };

  if (!booted) {
    return <BootScreen onDone={() => { setBooted(true); playStartup(); }} />;
  }

  if (off) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-center p-6 cursor-pointer" onClick={reboot}>
        <p className="text-orange-400 font-mono text-lg">It is now safe to turn off<br />your computer.</p>
        <p className="text-gray-500 font-mono text-xs mt-6 blink">— CLICK ANYWHERE TO REBOOT —</p>
        <p className="text-gray-700 font-mono text-[10px] mt-2">({portfolio.name}'s portfolio v1.0)</p>
      </div>
    );
  }

  if (shuttingDown) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center" style={{ background: "#00309c" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white text-xl font-sans">Windows is shutting down...</p>
        </div>
        <p className="text-white/60 text-xs mt-4 font-mono">saving your vaporwave settings ✨</p>
      </div>
    );
  }

  return (
    <div className="vapor-bg scanlines relative h-screen w-screen overflow-hidden">
      <SceneBackground />
      <ParticleField />

      {/* Desktop icons */}
      <div className={`absolute top-4 left-4 z-[5] ${isMobile ? "grid grid-cols-3 gap-2 right-4" : "flex flex-col gap-4 w-24"}`}>
        {ICONS.filter((ic) => isMobile || ic.id !== "games").map((ic) => (
          <DeskIcon key={ic.id} ic={ic} onOpen={openWindow} isMobile={isMobile} />
        ))}
      </div>

      {/* Games pinned top-right on desktop */}
      {!isMobile && (
        <div className="absolute top-4 right-4 z-[5] w-24">
          <DeskIcon ic={ICONS.find((x) => x.id === "games")!} onOpen={openWindow} isMobile={isMobile} />
        </div>
      )}

      {/* Windows */}
      <AnimatePresence>
      {open.map((id, i) => {
        if (minimized.has(id)) return null;
        const meta = ICONS.find((x) => x.id === id)!;
        const p = posOf(i);
        return (
          <XPWindow
            key={id}
            id={id}
            title={TITLES[id]}
            icon={meta.icon}
            x={p.x} y={p.y} w={id === "games" ? 540 : 460} h={id === "games" ? 520 : 420}
            z={zOf(id)}
            isMobile={isMobile}
            focused={focus === id}
            onFocus={(x) => bringToFront(x as WinId)}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
          >
            {renderContent(id)}
          </XPWindow>
        );
      })}
      </AnimatePresence>

      {/* Start menu */}
      <AnimatePresence>
      {startOpen && (
        <motion.div
          className="absolute bottom-10 left-0 z-[100] w-64"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        >
          <div className="bg-[#245edb] text-white font-bold px-3 py-2 flex items-center gap-2 rounded-tr-lg">
            <span className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#ff71ce] to-[#01cdfe] flex items-center justify-center text-xl border border-white">👾</span>
            {portfolio.name}
          </div>
          <div className="bg-[#ece9d8] border-x-2 border-[#245edb]">
            {ICONS.map((ic) => (
              <button key={ic.id} onClick={() => openWindow(ic.id)} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#316ac5] hover:text-white text-[13px] text-left">
                <span className="text-lg">{ic.icon}</span> {ic.title}
              </button>
            ))}
          </div>
          <div className="bg-[#245edb] px-3 py-2 flex justify-end gap-2 rounded-br-lg">
            <button onClick={shutdown} className="flex items-center gap-1 bg-[#e0664f] hover:brightness-110 text-white text-xs font-bold px-2 py-1 rounded border border-white/60">⏻ Turn Off</button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="xp-taskbar absolute bottom-0 left-0 right-0 h-10 flex items-stretch z-[90] shadow-[0_-2px_8px_rgba(0,0,0,0.5)]">
        <button onClick={() => setStartOpen((s) => !s)} className="xp-start flex items-center gap-1.5 px-4 text-white font-black italic text-lg rounded-r-xl pr-6">
          <span className="not-italic">🪟</span> start
        </button>
        <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto">
          {open.map((id) => {
            const meta = ICONS.find((x) => x.id === id)!;
            const active = focus === id && !minimized.has(id);
            return (
              <button
                key={id}
                onClick={() => (minimized.has(id) ? bringToFront(id) : active ? minimizeWindow(id) : bringToFront(id))}
                className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-sm min-w-28 max-w-40 truncate border ${
                  active ? "bg-[#1c46a8] text-white border-white/40 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.6)]" : "bg-[#3f8cf3] text-white border-white/20 hover:brightness-110"
                }`}
              >
                <span>{meta.icon}</span><span className="truncate">{meta.title}</span>
              </button>
            );
          })}
        </div>
        <MusicPlayer />
        <button onClick={shutdown} title="Shut down" className="hidden sm:flex items-center px-2 text-white/90 hover:text-white hover:bg-white/10 text-sm">⏻</button>
        <div className="flex items-center gap-1 px-3 text-white text-xs bg-[#1290e9] border-l border-white/30 shadow-[inset_1px_0_3px_rgba(0,0,0,0.4)]">🔊 {clock}</div>
      </div>
      <VaporFilter />
    </div>
  );
}
