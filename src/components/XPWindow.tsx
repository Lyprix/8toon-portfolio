"use client";
import { useRef, useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  isMobile: boolean;
  focused: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  children: ReactNode;
};

export default function XPWindow({
  id, title, icon, x, y, w, h, z, isMobile, focused, onFocus, onClose, onMinimize, children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const drag = useRef<{ dx: number; dy: number; dragging: boolean }>({ dx: 0, dy: 0, dragging: false });

  useEffect(() => setPos({ x, y }), [x, y]);

  const startDrag = (e: React.MouseEvent) => {
    if (isMobile) return;
    onFocus(id);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, dragging: true };
    const move = (ev: MouseEvent) => {
      if (!drag.current.dragging) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 120, ev.clientX - drag.current.dx)),
        y: Math.max(0, Math.min(window.innerHeight - 120, ev.clientY - drag.current.dy)),
      });
    };
    const up = () => {
      drag.current.dragging = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const style: React.CSSProperties = isMobile
    ? { left: 8, right: 8, top: 12, bottom: 56, zIndex: z }
    : { left: pos.x, top: pos.y, width: w, height: h, zIndex: z };

  return (
    <motion.div
      ref={ref}
      onMouseDown={() => onFocus(id)}
      className="xp-window absolute flex flex-col"
      style={style}
      initial={{ scale: 0.9, opacity: 0, y: 14 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
    >
      <div
        onMouseDown={startDrag}
        className={`xp-titlebar flex items-center justify-between px-2 py-1.5 cursor-default ${
          focused ? "opacity-100" : "opacity-80 grayscale-[0.3]"
        }`}
      >
        <div className="flex items-center gap-2 text-white text-[13px] font-bold drop-shadow truncate">
          <span className="text-base">{icon}</span>
          <span className="truncate">{title}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <button className="xp-button xp-min xp-btn-active" onClick={() => onMinimize(id)} title="Minimize">_</button>
          <button className="xp-button xp-close xp-btn-active" onClick={() => onClose(id)} title="Close">✕</button>
        </div>
      </div>
      <div className="xp-body flex-1 overflow-auto p-4 text-[13px] text-black min-h-0">{children}</div>
    </motion.div>
  );
}
