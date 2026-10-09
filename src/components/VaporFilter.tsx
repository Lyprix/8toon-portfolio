"use client";

/* Page-wide retrowave grade: neon tint, CRT refresh sweep, fine scanlines,
   animated film grain and vignette. Pure overlay — never blocks clicks. */
export default function VaporFilter() {
  return (
    <div className="fx" aria-hidden>
      <div className="fx-tint" />
      <div className="fx-band" />
      <div className="fx-scan" />
      <div className="fx-grain" />
      <div className="fx-vig" />
    </div>
  );
}
