"use client";

type Pt = [number, number];

/* Vanishing point: x=500 (center), y=400 (40% = horizon) in a 1000x1000 viewBox */
const VP: Pt = [500, 400];

/* --- Wireframe mountain ranges (left ridge; right side is mirrored) --- */
const RIDGE_L: Pt[] = [
  [0, 402], [0, 320], [55, 300], [105, 215], [150, 255], [195, 175],
  [240, 225], [285, 160], [330, 215], [365, 260], [395, 330], [415, 402],
];
/* Small foothill closer to the sun gap, for depth */
const FOOT_L: Pt[] = [
  [330, 402], [352, 352], [396, 338], [438, 370], [470, 402],
];
/* Triangulation: ridge points dropped straight to the base */
const VERTS_L: Pt[] = [
  [55, 300], [105, 215], [150, 255], [195, 175],
  [240, 225], [285, 160], [330, 215], [365, 260],
];
/* Contour lines following the slope */
const CONTOUR1_L: Pt[] = [
  [0, 352], [50, 348], [100, 330], [150, 338], [200, 318],
  [250, 326], [300, 306], [350, 324], [415, 350],
];
const CONTOUR2_L: Pt[] = [
  [0, 378], [60, 374], [120, 366], [180, 372],
  [240, 362], [300, 356], [360, 368], [415, 376],
];
/* Diagonals from peaks to the contour line */
const DIAG_L: [Pt, Pt][] = [
  [[105, 215], [100, 330]], [[105, 215], [150, 338]],
  [[150, 255], [150, 338]], [[150, 255], [200, 318]],
  [[195, 175], [150, 338]], [[195, 175], [200, 318]], [[195, 175], [250, 326]],
  [[240, 225], [200, 318]], [[240, 225], [250, 326]],
  [[285, 160], [250, 326]], [[285, 160], [300, 306]], [[285, 160], [350, 324]],
  [[330, 215], [300, 306]], [[330, 215], [350, 324]],
  [[365, 260], [350, 324]], [[55, 300], [50, 348]],
];

const mirror = (p: Pt): Pt => [1000 - p[0], p[1]];
const line = (pts: Pt[]) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");

function MountainRange({ right }: { right?: boolean }) {
  const m = (pts: Pt[]) => (right ? pts.map(mirror) : pts);
  return (
    <g>
      <path d={line(m(RIDGE_L)) + " Z"} fill="url(#mtnGrad)" />
      <path d={line(m(FOOT_L)) + " Z"} fill="#1a0b48" />
      <path d={line(m(FOOT_L))} fill="none" stroke="rgba(150,170,255,0.4)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={line(m(CONTOUR1_L))} fill="none" stroke="rgba(150,170,255,0.42)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={line(m(CONTOUR2_L))} fill="none" stroke="rgba(150,170,255,0.35)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      {m(VERTS_L).map(([x, y], i) => (
        <line key={`v${i}`} x1={x} y1={y} x2={x + 8} y2={402} stroke="rgba(150,170,255,0.4)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
      {(right ? DIAG_L.map(([a, b]) => [mirror(a), mirror(b)] as [Pt, Pt]) : DIAG_L).map(([a, b], i) => (
        <line key={`d${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(150,170,255,0.35)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
      {/* ridge: cool under-stroke + hot core */}
      <path d={line(m(RIDGE_L))} fill="none" stroke="#8b98ff" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <path d={line(m(RIDGE_L))} fill="none" stroke="#e2e8ff" strokeWidth={1} vectorEffect="non-scaling-stroke" />
    </g>
  );
}

/* --- Palm silhouette (sways gently) --- */
function PalmSvg({ delay }: { delay: number }) {
  const F = "#0d0428";
  return (
    <svg className="scene-palm" style={{ animationDelay: `${delay}s` }} viewBox="0 0 100 130">
      <path d="M48 128 C46 100 44 70 52 44" stroke={F} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M46 126 C44 100 43 74 50 48" stroke="#4a2385" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
      <g fill={F} stroke="#5b2b99" strokeWidth={0.8}>
        <path d="M52 42 Q34 24 12 26 Q34 30 50 48 Z" />
        <path d="M52 42 Q28 38 10 50 Q32 46 50 54 Z" />
        <path d="M52 42 Q32 52 22 70 Q34 56 52 52 Z" />
        <path d="M52 42 Q48 20 60 8 Q56 30 58 44 Z" />
        <path d="M52 42 Q70 24 92 26 Q70 30 56 48 Z" />
        <path d="M52 42 Q76 38 94 50 Q72 46 54 54 Z" />
        <path d="M52 42 Q72 52 82 70 Q70 56 52 52 Z" />
      </g>
      <circle cx={48} cy={47} r={3.2} fill={F} />
      <circle cx={57} cy={48} r={3.2} fill={F} />
    </svg>
  );
}

function Palm({ x, ridgePct, h, delay, flip }: { x: string; ridgePct: number; h: number; delay: number; flip?: boolean }) {
  return (
    <div className="scene-palm-wrap" style={{ left: x, top: `calc(${ridgePct}% - ${h}px)`, width: h * 0.77, height: h, scale: flip ? "-1 1" : "1 1" }}>
      <PalmSvg delay={delay} />
    </div>
  );
}

/* --- Roadside palms rushing past, synced with the grid --- */
function RoadPalm({ side, delay }: { side: -1 | 1; delay: number }) {
  return (
    <div className={`road-palm ${side < 0 ? "road-palm-l" : "road-palm-r"}`} style={{ animationDelay: `${delay}s` }}>
      <PalmSvg delay={delay * 1.7} />
    </div>
  );
}

/* --- DeLorean rear in 3D-style: shaded stainless body, louvered glass,
   glowing lenses, 82N plate, wheels + ground shadow for depth --- */
function CarRear() {
  return (
    <svg className="dlo-svg" viewBox="0 0 230 120">
      <defs>
        <linearGradient id="dloSteel" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#f7dcef" />
          <stop offset={0.12} stopColor="#b39fbf" />
          <stop offset={0.35} stopColor="#6a5f78" />
          <stop offset={0.65} stopColor="#38324a" />
          <stop offset={1} stopColor="#151122" />
        </linearGradient>
        <linearGradient id="dloRoof" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#9c89ab" />
          <stop offset={0.4} stopColor="#4a4258" />
          <stop offset={1} stopColor="#1a1526" />
        </linearGradient>
        <linearGradient id="dloLens" x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor="#ff8aa5" />
          <stop offset={0.55} stopColor="#e01a50" />
          <stop offset={1} stopColor="#8f0f30" />
        </linearGradient>
        <pattern id="dloRibs" width={5} height={4} patternUnits="userSpaceOnUse">
          <rect width={5} height={4} fill="url(#dloLens)" />
          <rect width={2} height={4} fill="rgba(0,0,0,0.45)" />
        </pattern>
        <pattern id="dloMesh" width={4} height={4} patternUnits="userSpaceOnUse">
          <path d="M0,4 L4,0" stroke="rgba(255,255,255,0.09)" strokeWidth={1} />
        </pattern>
        <radialGradient id="dloShadow" cx={0.5} cy={0.5} r={0.5}>
          <stop offset={0} stopColor="rgba(0,0,0,0.6)" />
          <stop offset={1} stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id="dloGlow" cx={0.5} cy={0.5} r={0.5}>
          <stop offset={0} stopColor="rgba(255,60,140,0.55)" />
          <stop offset={1} stopColor="rgba(255,60,140,0)" />
        </radialGradient>
        <filter id="dloLensGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={3} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dloSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>

      {/* ground shadow + underglow */}
      <ellipse cx={115} cy={106} rx={98} ry={9} fill="url(#dloShadow)" filter="url(#dloSoft)" />
      <ellipse className="dlo-glowpulse" cx={115} cy={102} rx={78} ry={7} fill="url(#dloGlow)" />

      {/* 3D wheels: shaded sidewalls, tread grooves, dished metallic rims,
          lug nuts, sunset rim-light on the outer shoulder, contact shadow */}
      {[{ x: 16, dir: -1 }, { x: 184, dir: 1 }].map(({ x, dir }) => (
        <g key={x}>
          <ellipse cx={x + 15} cy={105} rx={17} ry={3.5} fill="rgba(0,0,0,0.55)" filter="url(#dloSoft)" />
          <rect x={x} y={78} width={30} height={28} rx={8} fill="url(#dloTire)" stroke="#000" strokeWidth={1} />
          {[0, 1, 2, 3].map((t) => (
            <line key={t} x1={x + 7 + t * 5.5} y1={99} x2={x + 7 + t * 5.5} y2={105} stroke="rgba(0,0,0,0.6)" strokeWidth={2} />
          ))}
          <ellipse cx={x + 15} cy={92} rx={9.5} ry={10} fill="url(#dloRim)" stroke="#101014" strokeWidth={1} />
          {[0, 1, 2, 3, 4].map((l) => {
            const a = (l / 5) * Math.PI * 2;
            return <circle key={l} cx={x + 15 + Math.cos(a) * 5} cy={92 + Math.sin(a) * 5.5} r={1.3} fill="#0e0e12" />;
          })}
          <circle cx={x + 15} cy={92} r={2.6} fill="#8f8f99" stroke="#2a2a30" strokeWidth={0.75} />
          <path
            d={`M ${x + (dir < 0 ? 7 : 23)},84 Q ${x + (dir < 0 ? 1 : 29)},92 ${x + (dir < 0 ? 7 : 23)},100`}
            fill="none" stroke="rgba(255,150,200,0.5)" strokeWidth={1.2}
          />
        </g>
      ))}

      {/* roof + C-pillars */}
      <polygon points="64,10 166,10 190,34 40,34" fill="url(#dloRoof)" stroke="#050310" strokeWidth={1} />
      <line x1={64} y1={10} x2={166} y2={10} stroke="#ffe4f4" strokeWidth={2.5} />
      <line x1={64} y1={10} x2={40} y2={34} stroke="rgba(0,0,0,0.55)" strokeWidth={3} />
      <line x1={166} y1={10} x2={190} y2={34} stroke="rgba(0,0,0,0.55)" strokeWidth={3} />

      {/* stainless body, wider at the base for perspective */}
      <polygon points="40,34 190,34 206,94 24,94" fill="url(#dloSteel)" stroke="#050310" strokeWidth={1} />
      <polygon points="40,34 52,34 40,94 24,94" fill="rgba(255,220,240,0.20)" />
      <polygon points="190,34 178,34 190,94 206,94" fill="rgba(255,220,240,0.16)" />
      <polygon points="40,34 190,34 188,40 42,40" fill="#ffe9f6" opacity={0.75} />

      {/* louvered rear glass */}
      <polygon points="64,42 166,42 162,60 68,60" fill="#060409" stroke="#000" strokeWidth={1} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={68} y={44.5 + i * 5} width={94} height={2.4} fill="#83838e" opacity={0.9} />
      ))}
      <polygon points="100,42 120,42 104,60 88,60" fill="rgba(255,120,200,0.22)" />

      {/* decklid seam */}
      <line x1={56} y1={63} x2={174} y2={63} stroke="rgba(0,0,0,0.6)" strokeWidth={1} />

      {/* recessed light band: glowing ribbed lenses + mesh center + 82N plate */}
      <rect x={32} y={66} width={166} height={18} rx={3} fill="#0a0812" stroke="#000" />
      <rect className="dlo-lens" x={35} y={68.5} width={55} height={13} rx={2} fill="url(#dloRibs)" filter="url(#dloLensGlow)" />
      <rect className="dlo-lens" x={140} y={68.5} width={55} height={13} rx={2} fill="url(#dloRibs)" filter="url(#dloLensGlow)" />
      <rect x={94} y={68.5} width={42} height={13} fill="#0c0a14" />
      <rect x={94} y={68.5} width={42} height={13} fill="url(#dloMesh)" />
      <rect x={99} y={69.5} width={32} height={11} rx={1.5} fill="#f2edd8" stroke="#8a8570" strokeWidth={1} />
      <text x={115} y={78} textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize={9.5} letterSpacing={0.5} fill="#14206e">82N</text>

      {/* lower valance + exhausts */}
      <polygon points="30,88 200,88 204,97 26,97" fill="#0d0a15" stroke="#000" strokeWidth={0.75} />
      {[78, 152].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={92.5} r={3.5} fill="#16161c" stroke="#9a9aa5" strokeWidth={1} />
          <circle cx={cx} cy={92.5} r={1.5} fill="#000" />
        </g>
      ))}
    </svg>
  );
}

const ROWS = 26;
const ROW_DUR = 2.8;
const DASHES = 7;

export default function SceneBackground() {
  return (
    <div className="scene" aria-hidden>
      <div className="scene-sky" />
      <div className="scene-sunglow" />
      <div className="scene-sun" />
      <div className="scene-haze" />
      <div className="scene-horizon" />

      {/* Ground: terrain, road, longitudinal grid, mountains */}
      <svg className="scene-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="terrainGrad" x1={0} y1={400} x2={0} y2={1000} gradientUnits="userSpaceOnUse">
            <stop offset={0} stopColor="#2a1163" />
            <stop offset={0.35} stopColor="#1d0c46" />
            <stop offset={1} stopColor="#100627" />
          </linearGradient>
          <linearGradient id="roadGrad" x1={0} y1={400} x2={0} y2={1000} gradientUnits="userSpaceOnUse">
            <stop offset={0} stopColor="#1c0e38" />
            <stop offset={0.3} stopColor="#120826" />
            <stop offset={1} stopColor="#070412" />
          </linearGradient>
          <linearGradient id="dloTire" x1={0} y1={0} x2={1} y2={0}>
            <stop offset={0} stopColor="#33333c" />
            <stop offset={0.35} stopColor="#0c0c11" />
            <stop offset={0.6} stopColor="#08080c" />
            <stop offset={1} stopColor="#232329" />
          </linearGradient>
          <radialGradient id="dloRim" cx={0.4} cy={0.35} r={0.8}>
            <stop offset={0} stopColor="#a2a2ac" />
            <stop offset={0.45} stopColor="#6e6e78" />
            <stop offset={1} stopColor="#33333c" />
          </radialGradient>
          <filter id="dloNoise" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0.06 0" />
          </filter>
          <clipPath id="roadClip">
            <polygon points="500,400 170,1010 830,1010" />
          </clipPath>
          <linearGradient id="mtnGrad" x1={0} y1={150} x2={0} y2={402} gradientUnits="userSpaceOnUse">
            <stop offset={0} stopColor="#3a1c86" />
            <stop offset={0.55} stopColor="#2a1268" />
            <stop offset={1} stopColor="#1a0b48" />
          </linearGradient>
          <linearGradient id="streakGrad" x1={0} y1={400} x2={0} y2={1000} gradientUnits="userSpaceOnUse">
            <stop offset={0} stopColor="rgba(255,120,200,0.55)" />
            <stop offset={0.5} stopColor="rgba(255,90,180,0.16)" />
            <stop offset={1} stopColor="rgba(255,90,180,0.05)" />
          </linearGradient>
        </defs>

        <MountainRange />
        <MountainRange right />

        {/* terrain + road fills */}
        <rect x={0} y={400} width={1000} height={610} fill="url(#terrainGrad)" />
        <polygon points={`500,400 170,1010 830,1010`} fill="url(#roadGrad)" />
        {/* asphalt grain, clipped to the road surface */}
        <g clipPath="url(#roadClip)">
          <rect x={100} y={400} width={800} height={610} filter="url(#dloNoise)" opacity={0.55} />
        </g>
        {/* sun reflection streak down the middle of the road */}
        <polygon className="road-streak" points={`492,400 508,400 566,1010 434,1010`} fill="url(#streakGrad)" />

        {/* longitudinal grid lines, fanning out from the vanishing point */}
        {Array.from({ length: 13 }, (_, i) => i - 6).map((k) => (
          <line
            key={k}
            x1={VP[0]} y1={VP[1]} x2={VP[0] + k * 110} y2={1010}
            stroke={Math.abs(k) <= 3 ? "rgba(215,170,255,0.55)" : "rgba(125,165,255,0.5)"}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* bright road edges */}
        {[170, 830].map((x) => (
          <g key={x}>
            <line x1={VP[0]} y1={VP[1]} x2={x} y2={1010} stroke="rgba(90,220,255,0.25)" strokeWidth={7} vectorEffect="non-scaling-stroke" />
            <line x1={VP[0]} y1={VP[1]} x2={x} y2={1010} stroke="#eaf7ff" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>

      {/* transverse grid rows streaming toward the viewer */}
      <div className="scene-rows">
        {Array.from({ length: ROWS }, (_, i) => (
          <div key={i} className="scene-row" style={{ animationDelay: `${(-i * ROW_DUR) / ROWS}s` }} />
        ))}
      </div>

      {/* center lane dashes flowing down the road, in sync with the grid */}
      <div className="road-dashes">
        {Array.from({ length: DASHES }, (_, i) => (
          <div key={i} className="road-dash" style={{ animationDelay: `${(-i * ROW_DUR) / DASHES}s` }} />
        ))}
      </div>

      {/* roadside palms rushing past on both shoulders, synced with the grid */}
      <div className="road-palms">
        {([-1, 1] as const).map((side) => (
          [0, 1, 2, 3].map((i) => (
            <RoadPalm key={`${side}-${i}`} side={side} delay={(-i * ROW_DUR) / 4 - (side < 0 ? 0 : ROW_DUR / 8)} />
          ))
        ))}
      </div>

      {/* palms perched on the ridges (positions track the SVG coords in %) */}
      <Palm x="7.5%" ridgePct={29} h={96} delay={0} />
      <Palm x="22%" ridgePct={19} h={120} delay={1.4} flip />
      <Palm x="31.5%" ridgePct={23.5} h={84} delay={2.6} />
      <Palm x="86.5%" ridgePct={29} h={96} delay={0.8} flip />
      <Palm x="71.5%" ridgePct={19} h={120} delay={2} />
      <Palm x="62.5%" ridgePct={23.5} h={84} delay={3.4} flip />

      {/* the car */}
      <div className="scene-car">
        <CarRear />
        <div className="scar-reflect"><CarRear /></div>
      </div>

      <div className="scene-vignette" />
    </div>
  );
}
