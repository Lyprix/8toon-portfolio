"use client";
import { useState, useEffect, useMemo, useRef } from "react";

type GameId = "snake" | "mines" | "memory" | "chess" | "checkers" | "book";

function loadBest(key: string, fallback: number): number {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : Number(v) || fallback;
  } catch {
    return fallback;
  }
}

function saveBest(key: string, v: number) {
  try {
    window.localStorage.setItem(key, String(v));
  } catch {
    /* storage unavailable — scores just won't persist */
  }
}

function GameShell({ title, onExit, children, status }: { title: string; onExit: () => void; children: React.ReactNode; status?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={onExit} className="px-2 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] active:border-t-[#716f64] active:border-l-[#716f64] active:border-b-white active:border-r-white text-xs font-bold">← games</button>
        <p className="font-bold text-sm">{title}</p>
        {status && <p className="ml-auto text-[11px] font-mono text-gray-600">{status}</p>}
      </div>
      {children}
    </div>
  );
}

/* ---------------- SNAKE ---------------- */
const SN = 16;
const SPX = 320;
const SCELL = SPX / SN;

function SnakeGame({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"ready" | "playing" | "over">("ready");
  const scoreRef = useRef(0);
  const st = useRef({
    snake: [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }],
    dir: { x: 1, y: 0 },
    want: { x: 1, y: 0 },
    food: { x: 12, y: 8 },
    speed: 150,
  });

  useEffect(() => {
    setBest(loadBest("8toon-snake-best", 0));
  }, []);

  const placeFood = () => {
    const s = st.current;
    const taken = new Set(s.snake.map((p) => p.x + "," + p.y));
    const free: { x: number; y: number }[] = [];
    for (let x = 0; x < SN; x++)
      for (let y = 0; y < SN; y++) if (!taken.has(x + "," + y)) free.push({ x, y });
    if (free.length) s.food = free[Math.floor(Math.random() * free.length)];
  };

  const draw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const s = st.current;
    g.fillStyle = "#0b0033";
    g.fillRect(0, 0, SPX, SPX);
    g.strokeStyle = "rgba(1,205,254,0.12)";
    g.lineWidth = 1;
    for (let i = 1; i < SN; i++) {
      g.beginPath(); g.moveTo(i * SCELL, 0); g.lineTo(i * SCELL, SPX); g.stroke();
      g.beginPath(); g.moveTo(0, i * SCELL); g.lineTo(SPX, i * SCELL); g.stroke();
    }
    g.fillStyle = "#ff2975";
    g.shadowColor = "#ff2975";
    g.shadowBlur = 10;
    g.fillRect(s.food.x * SCELL + 3, s.food.y * SCELL + 3, SCELL - 6, SCELL - 6);
    g.shadowBlur = 0;
    s.snake.forEach((p, i) => {
      g.fillStyle = i === 0 ? "#01cdfe" : i % 2 ? "#00e676" : "#00c853";
      g.fillRect(p.x * SCELL + 1, p.y * SCELL + 1, SCELL - 2, SCELL - 2);
    });
  };

  const steer = (dx: number, dy: number) => {
    st.current.want = { x: dx, y: dy };
    setStatus((s) => (s === "ready" ? "playing" : s));
  };

  const reset = () => {
    st.current = {
      snake: [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }],
      dir: { x: 1, y: 0 }, want: { x: 1, y: 0 }, food: { x: 12, y: 8 }, speed: 150,
    };
    scoreRef.current = 0;
    setScore(0);
    placeFood();
    draw();
    setStatus("playing");
  };

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = st.current;
      if (!(s.want.x === -s.dir.x && s.want.y === -s.dir.y)) s.dir = s.want;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= SN || head.y >= SN || s.snake.some((p) => p.x === head.x && p.y === head.y)) {
        setStatus("over");
        setBest((b) => {
          const nb = Math.max(b, scoreRef.current);
          saveBest("8toon-snake-best", nb);
          return nb;
        });
        return;
      }
      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        s.speed = Math.max(70, 150 - scoreRef.current * 4);
        placeFood();
      } else {
        s.snake.pop();
      }
      draw();
      t = setTimeout(tick, s.speed);
    };
    t = setTimeout(tick, st.current.speed);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const dirs: Record<string, { x: number; y: number }> = {
      arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    };
    const onKey = (e: KeyboardEvent) => {
      const d = dirs[e.key.toLowerCase()];
      if (!d) return;
      e.preventDefault();
      steer(d.x, d.y);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameShell title="🐍 Snake" onExit={onExit} status={`SCORE ${score} · BEST ${best}`}>
      <div className="flex flex-col items-center gap-2">
        <canvas ref={canvasRef} width={SPX} height={SPX} className="border-2 border-[#716f64] max-w-full" style={{ width: "min(100%, 320px)", height: "auto" }} />
        {status === "ready" && (
          <button onClick={reset} className="px-4 py-1 bg-[#245edb] text-white text-xs font-bold border-2 border-t-white border-l-white border-b-[#102a6b] border-r-[#102a6b]">▶ START (arrow keys / WASD)</button>
        )}
        {status === "over" && (
          <div className="text-center">
            <p className="font-black text-[#c93a26]">💀 GAME OVER — score {score}</p>
            <button onClick={reset} className="mt-1 px-4 py-1 bg-[#245edb] text-white text-xs font-bold border-2 border-t-white border-l-white border-b-[#102a6b] border-r-[#102a6b]">↻ PLAY AGAIN</button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1 select-none">
          <span />
          <button onClick={() => steer(0, -1)} className="w-10 h-10 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] font-bold">▲</button>
          <span />
          <button onClick={() => steer(-1, 0)} className="w-10 h-10 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] font-bold">◀</button>
          <button onClick={() => steer(0, 1)} className="w-10 h-10 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] font-bold">▼</button>
          <button onClick={() => steer(1, 0)} className="w-10 h-10 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] font-bold">▶</button>
        </div>
      </div>
    </GameShell>
  );
}

/* ---------------- MINESWEEPER ---------------- */
const MW = 9;
const MH = 9;
const MM = 10;
const NUM_COLORS = ["", "#0000ff", "#008200", "#ff0000", "#000084", "#840000", "#008284", "#000000", "#808080"];

function emptyGrid<T>(v: T): T[][] {
  return Array.from({ length: MH }, () => Array.from({ length: MW }, () => v));
}

function MinesGame({ onExit }: { onExit: () => void }) {
  const [mines, setMines] = useState<boolean[][]>(() => emptyGrid(false));
  const [rev, setRev] = useState<boolean[][]>(() => emptyGrid(false));
  const [flag, setFlag] = useState<boolean[][]>(() => emptyGrid(false));
  const [status, setStatus] = useState<"ready" | "playing" | "won" | "lost">("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [secs, setSecs] = useState(0);
  const [best, setBest] = useState(0);
  const [boom, setBoom] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setBest(loadBest("8toon-mines-best", 0));
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const t = setInterval(() => setSecs((s) => Math.min(999, s + 1)), 1000);
    return () => clearInterval(t);
  }, [status]);

  const count = (m: boolean[][], x: number, y: number) => {
    let n = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < MW && ny < MH && m[ny][nx]) n++;
      }
    return n;
  };

  const reset = () => {
    setMines(emptyGrid(false));
    setRev(emptyGrid(false));
    setFlag(emptyGrid(false));
    setStatus("ready");
    setSecs(0);
    setBoom(null);
  };

  const flagsUsed = flag.flat().filter(Boolean).length;

  const openAt = (fx: number, fy: number) => {
    if (status === "won" || status === "lost") return;
    if (rev[fy][fx] || flag[fy][fx]) return;
    let m = mines;
    let st: typeof status = status;
    if (status === "ready") {
      const cells: { x: number; y: number }[] = [];
      for (let y = 0; y < MH; y++)
        for (let x = 0; x < MW; x++) if (x !== fx || y !== fy) cells.push({ x, y });
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
      }
      m = emptyGrid(false);
      cells.slice(0, MM).forEach(({ x, y }) => { m[y][x] = true; });
      setMines(m);
      st = "playing";
      setStatus("playing");
    }
    if (m[fy][fx]) {
      const all = rev.map((row) => row.slice());
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (m[y][x]) all[y][x] = true;
      setRev(all);
      setBoom({ x: fx, y: fy });
      setStatus("lost");
      return;
    }
    const next = rev.map((row) => row.slice());
    const stack = [[fx, fy]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x < 0 || y < 0 || x >= MW || y >= MH || next[y][x] || flag[y][x]) continue;
      next[y][x] = true;
      if (count(m, x, y) === 0) {
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) stack.push([x + dx, y + dy]);
      }
    }
    setRev(next);
    const shown = next.flat().filter(Boolean).length;
    if (shown === MW * MH - MM) {
      setStatus("won");
      setBest((b) => {
        const nb = b === 0 ? secs : Math.min(b, secs);
        saveBest("8toon-mines-best", nb);
        return nb;
      });
    } else if (st === "playing") {
      setStatus("playing");
    }
  };

  const toggleFlag = (x: number, y: number) => {
    if (status === "won" || status === "lost" || rev[y][x]) return;
    if (status === "ready") setStatus("playing");
    setFlag((f) => {
      const next = f.map((row) => row.slice());
      next[y][x] = !next[y][x];
      return next;
    });
  };

  const face = status === "lost" ? "😵" : status === "won" ? "😎" : "🙂";

  return (
    <GameShell title="💣 Minesweeper" onExit={onExit} status={best > 0 ? `BEST ${best}s` : undefined}>
      <div className="bg-[#bdb8ad] border-2 border-t-[#716f64] border-l-[#716f64] border-b-white border-r-white p-2">
        <div className="flex items-center justify-between bg-[#bdb8ad] border-2 border-t-[#7b7b7b] border-l-[#7b7b7b] border-b-white border-r-white px-2 py-1 mb-2">
          <span className="bg-black text-red-500 font-mono font-bold text-sm px-1">{String(MM - flagsUsed).padStart(3, "0")}</span>
          <button onClick={reset} className="text-2xl leading-none bg-[#bdb8ad] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] w-9 h-9" title="New game">{face}</button>
          <span className="bg-black text-red-500 font-mono font-bold text-sm px-1">{String(secs).padStart(3, "0")}</span>
        </div>
        <div className="grid gap-0 mx-auto" style={{ gridTemplateColumns: `repeat(${MW}, 26px)`, width: "fit-content" }}>
          {Array.from({ length: MH }, (_, y) =>
            Array.from({ length: MW }, (_, x) => {
              const isRev = rev[y][x];
              const isMine = mines[y][x];
              const n = count(mines, x, y);
              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => (flagMode ? toggleFlag(x, y) : openAt(x, y))}
                  onContextMenu={(e) => { e.preventDefault(); toggleFlag(x, y); }}
                  className={`w-[26px] h-[26px] text-sm font-black flex items-center justify-center ${
                    isRev
                      ? `bg-[#e8e4d8] border border-[#7b7b7b] ${boom && boom.x === x && boom.y === y ? "!bg-red-500" : ""}`
                      : "bg-[#bdb8ad] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] active:border-0"
                  }`}
                  style={isRev && n > 0 ? { color: NUM_COLORS[n] } : undefined}
                >
                  {isRev ? (isMine ? "💥" : n > 0 ? n : "") : flag[y][x] ? "🚩" : ""}
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setFlagMode((f) => !f)}
            className={`px-2 py-1 text-xs font-bold border-2 ${flagMode ? "bg-[#fffb96] border-t-[#716f64] border-l-[#716f64] border-b-white border-r-white" : "bg-[#ece9d8] border-t-white border-l-white border-b-[#716f64] border-r-[#716f64]"}`}
            title="Touch-friendly flag mode"
          >
            🚩 flag mode: {flagMode ? "ON" : "OFF"}
          </button>
          <p className="text-[10px] text-gray-700">left-click dig · right-click flag</p>
        </div>
        {status === "won" && <p className="mt-1 text-center font-black text-green-700">🏆 FIELD CLEARED in {secs}s!</p>}
        {status === "lost" && <p className="mt-1 text-center font-black text-[#c93a26]">💥 BOOM! hit the face to retry</p>}
      </div>
    </GameShell>
  );
}

/* ---------------- MEMORY MATCH ---------------- */
const FACES = ["👾", "🚀", "🌴", "🍕", "🎮", "🐱", "⚡", "🍩"];

function MemoryGame({ onExit }: { onExit: () => void }) {
  const fresh = () => {
    const d = [...Array(8).keys(), ...Array(8).keys()];
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  };
  const [deck, setDeck] = useState<number[]>(fresh);
  const [open, setOpen] = useState<number[]>([]);
  const [hit, setHit] = useState<boolean[]>(() => Array(16).fill(false));
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    setBest(loadBest("8toon-memory-best", 0));
  }, []);

  const reset = () => {
    setDeck(fresh());
    setOpen([]);
    setHit(Array(16).fill(false));
    setMoves(0);
    lock.current = false;
  };

  const flip = (i: number) => {
    if (lock.current || open.includes(i) || hit[i]) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (deck[next[0]] === deck[next[1]]) {
        const h = hit.slice();
        h[next[0]] = h[next[1]] = true;
        setHit(h);
        setOpen([]);
        if (h.every(Boolean)) {
          const finalMoves = moves + 1;
          setBest((b) => {
            const nb = b === 0 ? finalMoves : Math.min(b, finalMoves);
            saveBest("8toon-memory-best", nb);
            return nb;
          });
        }
      } else {
        lock.current = true;
        setTimeout(() => {
          setOpen([]);
          lock.current = false;
        }, 650);
      }
    }
  };

  const won = hit.every(Boolean);

  return (
    <GameShell title="🃏 Memory Match" onExit={onExit} status={`MOVES ${moves}${best > 0 ? ` · BEST ${best}` : ""}`}>
      <div className="grid grid-cols-4 gap-1.5">
        {deck.map((f, i) => {
          const face = open.includes(i) || hit[i];
          return (
            <button
              key={i}
              onClick={() => flip(i)}
              className={`h-14 text-2xl flex items-center justify-center border-2 ${
                face
                  ? hit[i]
                    ? "bg-[#d6ffd6] border-green-600"
                    : "bg-white border-[#245edb]"
                  : "bg-gradient-to-b from-[#3f8cf3] to-[#245edb] border-t-white border-l-white border-b-[#102a6b] border-r-[#102a6b] text-white/80 text-lg"
              }`}
            >
              {face ? FACES[f] : "?"}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={reset} className="px-3 py-1 bg-[#ece9d8] text-xs font-bold border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] active:border-t-[#716f64] active:border-l-[#716f64] active:border-b-white active:border-r-white">↻ SHUFFLE</button>
        {won && <p className="font-black text-green-700 text-sm">🏆 ALL PAIRS in {moves} moves!</p>}
      </div>
    </GameShell>
  );
}

/* ---------------- CHESS (you are White, CPU is Black) ---------------- */
type PC = "w" | "b";
type PT = "p" | "n" | "b" | "r" | "q" | "k";
type ChessPiece = { t: PT; c: PC };
type ChessBoard = (ChessPiece | null)[][];
type CMove = { fx: number; fy: number; tx: number; ty: number; promo?: PT; castle?: "K" | "Q"; ep?: boolean };
type Castle = { wk: boolean; wq: boolean; bk: boolean; bq: boolean };

const CVAL: Record<PT, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const GLYPH: Record<PC, Record<PT, string>> = {
  w: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
};

const cinB = (x: number, y: number) => x >= 0 && y >= 0 && x < 8 && y < 8;
const copp = (c: PC): PC => (c === "w" ? "b" : "w");

function initialChess(): ChessBoard {
  const back: PT[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const b: ChessBoard = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
  for (let x = 0; x < 8; x++) {
    b[0][x] = { t: back[x], c: "b" };
    b[1][x] = { t: "p", c: "b" };
    b[6][x] = { t: "p", c: "w" };
    b[7][x] = { t: back[x], c: "w" };
  }
  return b;
}

function cAttacked(b: ChessBoard, x: number, y: number, by: PC): boolean {
  const pd = by === "w" ? -1 : 1;
  for (const dx of [-1, 1]) {
    const px = x + dx, py = y - pd;
    if (cinB(px, py)) {
      const p = b[py][px];
      if (p && p.c === by && p.t === "p") return true;
    }
  }
  for (const [dx, dy] of [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]) {
    const nx = x + dx, ny = y + dy;
    if (cinB(nx, ny)) {
      const p = b[ny][nx];
      if (p && p.c === by && p.t === "n") return true;
    }
  }
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (cinB(nx, ny)) {
        const p = b[ny][nx];
        if (p && p.c === by && p.t === "k") return true;
      }
    }
  const rays: [number, number, PT][] = [[1, 0, "r"], [-1, 0, "r"], [0, 1, "r"], [0, -1, "r"], [1, 1, "b"], [1, -1, "b"], [-1, 1, "b"], [-1, -1, "b"]];
  for (const [dx, dy, kind] of rays) {
    let nx = x + dx, ny = y + dy;
    while (cinB(nx, ny)) {
      const p = b[ny][nx];
      if (p) {
        if (p.c === by && (p.t === kind || p.t === "q")) return true;
        break;
      }
      nx += dx;
      ny += dy;
    }
  }
  return false;
}

function cKing(b: ChessBoard, c: PC): { x: number; y: number } {
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const p = b[y][x];
      if (p && p.c === c && p.t === "k") return { x, y };
    }
  return { x: -1, y: -1 };
}

function cPseudo(b: ChessBoard, turn: PC, cast: Castle, ep: { x: number; y: number } | null): CMove[] {
  const moves: CMove[] = [];
  const fwd = turn === "w" ? -1 : 1;
  const startRow = turn === "w" ? 6 : 1;
  const promoRow = turn === "w" ? 0 : 7;
  const push = (fx: number, fy: number, tx: number, ty: number, extra?: Partial<CMove>, promoAll?: boolean) => {
    if (promoAll) {
      (["q", "r", "b", "n"] as PT[]).forEach((pr) => moves.push({ fx, fy, tx, ty, promo: pr }));
    } else {
      moves.push({ fx, fy, tx, ty, ...extra });
    }
  };
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const p = b[y][x];
      if (!p || p.c !== turn) continue;
      if (p.t === "p") {
        if (cinB(x, y + fwd) && !b[y + fwd][x]) {
          if (y + fwd === promoRow) push(x, y, x, y + fwd, undefined, true);
          else push(x, y, x, y + fwd);
          if (y === startRow && !b[y + 2 * fwd][x]) push(x, y, x, y + 2 * fwd);
        }
        for (const dx of [-1, 1]) {
          const nx = x + dx, ny = y + fwd;
          if (!cinB(nx, ny)) continue;
          const t = b[ny][nx];
          if (t && t.c !== turn) {
            if (ny === promoRow) push(x, y, nx, ny, undefined, true);
            else push(x, y, nx, ny);
          } else if (!t && ep && ep.x === nx && ep.y === ny) push(x, y, nx, ny, { ep: true });
        }
      } else if (p.t === "n" || p.t === "k") {
        const steps = p.t === "n"
          ? [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
          : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dx, dy] of steps) {
          const nx = x + dx, ny = y + dy;
          if (!cinB(nx, ny)) continue;
          const t = b[ny][nx];
          if (!t || t.c !== turn) push(x, y, nx, ny);
        }
        if (p.t === "k") {
          const home = turn === "w" ? 7 : 0;
          const foe: PC = turn === "w" ? "b" : "w";
          const K = turn === "w" ? cast.wk : cast.bk;
          const Q = turn === "w" ? cast.wq : cast.bq;
          if (y === home && x === 4) {
            if (K && !b[home][5] && !b[home][6] && !cAttacked(b, 4, home, foe) && !cAttacked(b, 5, home, foe) && !cAttacked(b, 6, home, foe))
              push(x, y, 6, home, { castle: "K" });
            if (Q && !b[home][1] && !b[home][2] && !b[home][3] && !cAttacked(b, 4, home, foe) && !cAttacked(b, 3, home, foe) && !cAttacked(b, 2, home, foe))
              push(x, y, 2, home, { castle: "Q" });
          }
        }
      } else {
        const dirs = p.t === "r" ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : p.t === "b" ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dx, dy] of dirs) {
          let nx = x + dx, ny = y + dy;
          while (cinB(nx, ny)) {
            const t = b[ny][nx];
            if (!t) push(x, y, nx, ny);
            else {
              if (t.c !== turn) push(x, y, nx, ny);
              break;
            }
            nx += dx;
            ny += dy;
          }
        }
      }
    }
  return moves;
}

function cApply(b: ChessBoard, m: CMove): ChessBoard {
  const nb = b.map((r) => r.slice());
  const p = nb[m.fy][m.fx]!;
  nb[m.fy][m.fx] = null;
  if (m.ep) nb[m.fy][m.tx] = null;
  if (m.castle) {
    if (m.tx === 6) { nb[m.fy][5] = nb[m.fy][7]; nb[m.fy][7] = null; }
    else { nb[m.fy][3] = nb[m.fy][0]; nb[m.fy][0] = null; }
  }
  nb[m.ty][m.tx] = m.promo ? { t: m.promo, c: p.c } : p;
  return nb;
}

function cLegal(b: ChessBoard, turn: PC, cast: Castle, ep: { x: number; y: number } | null): CMove[] {
  return cPseudo(b, turn, cast, ep).filter((m) => {
    const nb = cApply(b, m);
    const k = cKing(nb, turn);
    return k.x >= 0 && !cAttacked(nb, k.x, k.y, copp(turn));
  });
}

function cApplyFull(b: ChessBoard, m: CMove, c: Castle, half: number) {
  const nb = cApply(b, m);
  const nc = { ...c };
  const p = b[m.fy][m.fx]!;
  if (p.t === "k") {
    if (p.c === "w") { nc.wk = nc.wq = false; } else { nc.bk = nc.bq = false; }
  }
  if (m.fx === 0 && m.fy === 7) nc.wq = false;
  if (m.fx === 7 && m.fy === 7) nc.wk = false;
  if (m.fx === 0 && m.fy === 0) nc.bq = false;
  if (m.fx === 7 && m.fy === 0) nc.bk = false;
  const cap = b[m.ty][m.tx];
  if (cap && cap.t === "r") {
    if (m.tx === 0 && m.ty === 7) nc.wq = false;
    if (m.tx === 7 && m.ty === 7) nc.wk = false;
    if (m.tx === 0 && m.ty === 0) nc.bq = false;
    if (m.tx === 7 && m.ty === 0) nc.bk = false;
  }
  const nep = p.t === "p" && Math.abs(m.ty - m.fy) === 2 ? { x: m.tx, y: (m.ty + m.fy) / 2 } : null;
  const nhalf = p.t === "p" || cap || m.ep ? 0 : half + 1;
  return { b: nb, cast: nc, ep: nep, half: nhalf, captured: cap };
}

function cEval(b: ChessBoard): number {
  let s = 0;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const p = b[y][x];
      if (!p) continue;
      let v = CVAL[p.t];
      if (x >= 2 && x <= 5 && y >= 2 && y <= 5) v += 8;
      if (p.t === "p") v += (p.c === "w" ? 6 - y : y - 1) * 6;
      s += p.c === "w" ? v : -v;
    }
  return s;
}

function cOrder(b: ChessBoard, ms: CMove[]): CMove[] {
  return ms.slice().sort((a, c) => {
    const va = b[a.ty][a.tx] ? CVAL[b[a.ty][a.tx]!.t] : 0;
    const vc = b[c.ty][c.tx] ? CVAL[b[c.ty][c.tx]!.t] : 0;
    return vc - va;
  });
}

function cNega(b: ChessBoard, turn: PC, cast: Castle, ep: { x: number; y: number } | null, depth: number, alpha: number, beta: number): number {
  const ms = cLegal(b, turn, cast, ep);
  if (ms.length === 0) {
    const k = cKing(b, turn);
    if (cAttacked(b, k.x, k.y, copp(turn))) return -100000 - depth;
    return 0;
  }
  if (depth === 0) {
    const e = cEval(b);
    return turn === "w" ? e : -e;
  }
  let best = -Infinity;
  for (const m of cOrder(b, ms)) {
    const ap = cApplyFull(b, m, cast, 0);
    const v = -cNega(ap.b, copp(turn), ap.cast, ap.ep, depth - 1, -beta, -alpha);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function cInsufficient(b: ChessBoard): boolean {
  const rest: PT[] = [];
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const p = b[y][x];
      if (p && p.t !== "k") rest.push(p.t);
    }
  if (rest.some((t) => t === "p" || t === "r" || t === "q")) return false;
  return rest.length <= 1;
}

function ChessGame({ onExit }: { onExit: () => void }) {
  const [board, setBoard] = useState<ChessBoard>(initialChess);
  const [turn, setTurn] = useState<PC>("w");
  const [cast, setCast] = useState<Castle>({ wk: true, wq: true, bk: true, bq: true });
  const [ep, setEp] = useState<{ x: number; y: number } | null>(null);
  const [half, setHalf] = useState(0);
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);
  const [promo, setPromo] = useState<CMove[] | null>(null);
  const [last, setLast] = useState<CMove | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [wins, setWins] = useState(0);

  useEffect(() => {
    setWins(loadBest("8toon-chess-wins", 0));
  }, []);

  const moves = useMemo(() => cLegal(board, turn, cast, ep), [board, turn, cast, ep]);
  const inCheck = useMemo(() => {
    const k = cKing(board, turn);
    return k.x >= 0 && cAttacked(board, k.x, k.y, copp(turn));
  }, [board, turn]);

  useEffect(() => {
    if (over) return;
    if (moves.length === 0) {
      if (inCheck) {
        if (turn === "w") setOver("0–1 · CPU wins by checkmate");
        else {
          setOver("1–0 · You win by checkmate! 🏆");
          setWins((w) => {
            saveBest("8toon-chess-wins", w + 1);
            return w + 1;
          });
        }
      } else setOver("½–½ · Draw by stalemate");
    } else if (cInsufficient(board)) setOver("½–½ · Draw — insufficient material");
    else if (half >= 100) setOver("½–½ · Draw — fifty-move rule");
  }, [moves, inCheck, turn, board, half, over]);

  const doMove = (m: CMove) => {
    const ap = cApplyFull(board, m, cast, half);
    setBoard(ap.b);
    setCast(ap.cast);
    setEp(ap.ep);
    setHalf(ap.half);
    setLast(m);
    setSel(null);
    setPromo(null);
    setTurn(copp(turn));
  };

  useEffect(() => {
    if (turn !== "b" || over) return;
    setThinking(true);
    const t = setTimeout(() => {
      const ms = cLegal(board, "b", cast, ep).filter((m) => !m.promo || m.promo === "q");
      if (ms.length) {
        let bestM = ms[0];
        let bestV = -Infinity;
        for (const m of cOrder(board, ms)) {
          const ap = cApplyFull(board, m, cast, half);
          const v = -cNega(ap.b, "w", ap.cast, ap.ep, 2, -Infinity, Infinity) + Math.random() * 6;
          if (v > bestV) {
            bestV = v;
            bestM = m;
          }
        }
        const ap = cApplyFull(board, bestM, cast, half);
        setBoard(ap.b);
        setCast(ap.cast);
        setEp(ap.ep);
        setHalf(ap.half);
        setLast(bestM);
        setTurn("w");
      }
      setThinking(false);
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, board, cast, ep, over]);

  const reset = () => {
    setBoard(initialChess());
    setTurn("w");
    setCast({ wk: true, wq: true, bk: true, bq: true });
    setEp(null);
    setHalf(0);
    setSel(null);
    setPromo(null);
    setLast(null);
    setOver(null);
    setThinking(false);
  };

  const click = (x: number, y: number) => {
    if (over || thinking || turn !== "w" || promo) return;
    const p = board[y][x];
    if (sel && (x !== sel.x || y !== sel.y)) {
      const opts = moves.filter((m) => m.fx === sel.x && m.fy === sel.y && m.tx === x && m.ty === y);
      if (opts.length > 1) {
        setPromo(opts);
        return;
      }
      if (opts.length === 1) {
        doMove(opts[0]);
        return;
      }
    }
    if (p && p.c === "w") setSel({ x, y });
    else setSel(null);
  };

  const targets = sel ? moves.filter((m) => m.fx === sel.x && m.fy === sel.y) : [];
  const isTarget = (x: number, y: number) => targets.some((m) => m.tx === x && m.ty === y);
  const isLast = (x: number, y: number) => !!last && ((last.fx === x && last.fy === y) || (last.tx === x && last.ty === y));

  const missing = (c: PC) => {
    const need: Record<PT, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    for (let yy = 0; yy < 8; yy++)
      for (let xx = 0; xx < 8; xx++) {
        const p = board[yy][xx];
        if (p && p.c === c) need[p.t]--;
      }
    const out: PT[] = [];
    (Object.keys(need) as PT[]).forEach((t) => {
      for (let i = 0; i < need[t]; i++) out.push(t);
    });
    return out;
  };
  const scoreOf = (c: PC) => missing(copp(c)).reduce((s, t) => s + CVAL[t], 0) / 100;

  const status = over ?? (thinking ? "CPU thinking…" : turn === "w" ? "Your move (White)" : "CPU move (Black)");

  return (
    <GameShell title="♞ Chess" onExit={onExit} status={wins > 0 ? `🏅 ${wins} wins` : undefined}>
      <p className="text-xs font-bold">{status}</p>
      <div className="grid w-full max-w-[360px] mx-auto border-2 border-[#716f64]" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
        {Array.from({ length: 8 }, (_, y) =>
          Array.from({ length: 8 }, (_, x) => {
            const p = board[y][x];
            const dark = (x + y) % 2 === 1;
            const selected = sel && sel.x === x && sel.y === y;
            const kingDanger = p && p.t === "k" && p.c === turn && inCheck;
            return (
              <button
                key={`${x}-${y}`}
                onClick={() => click(x, y)}
                className="aspect-square flex items-center justify-center text-2xl sm:text-3xl relative"
                style={{ background: selected ? "#fffb96" : kingDanger ? "#ff7b7b" : isLast(x, y) ? (dark ? "#b8a24a" : "#e0cd7a") : dark ? "#a06a42" : "#ecd9b0" }}
              >
                {p && (
                  <span style={p.c === "w" ? { color: "#f8f8f8", textShadow: "0 0 2px #000, 1px 1px 0 #000" } : { color: "#14141c", textShadow: "0 0 2px #fff" }}>
                    {GLYPH[p.c][p.t]}
                  </span>
                )}
                {isTarget(x, y) && <span className="absolute w-3 h-3 rounded-full bg-black/40" />}
              </button>
            );
          })
        )}
      </div>
      {promo && (
        <div className="flex items-center gap-2 justify-center bg-[#fffb96] border border-[#c9a800] p-2">
          <span className="text-xs font-bold">Promote to:</span>
          {(["q", "r", "b", "n"] as PT[]).map((t) => (
            <button
              key={t}
              onClick={() => doMove(promo.find((m) => m.promo === t)!)}
              className="w-10 h-10 text-2xl bg-white border-2 border-[#245edb]"
            >
              {GLYPH.w[t]}
            </button>
          ))}
        </div>
      )}
      <div className="text-[11px] space-y-0.5">
        <p>⚪ captured: {missing("b").map((t, i) => <span key={i}>{GLYPH.b[t]} </span>)} {scoreOf("w") > scoreOf("b") && <b>+{scoreOf("w") - scoreOf("b")}</b>}</p>
        <p>⚫ captured: {missing("w").map((t, i) => <span key={i}>{GLYPH.w[t]} </span>)} {scoreOf("b") > scoreOf("w") && <b>+{scoreOf("b") - scoreOf("w")}</b>}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={reset} className="px-3 py-1 bg-[#ece9d8] text-xs font-bold border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] active:border-t-[#716f64] active:border-l-[#716f64] active:border-b-white active:border-r-white">↻ NEW GAME</button>
        {over && <p className="font-black text-sm">{over}</p>}
      </div>
      <p className="text-[10px] text-gray-600">You play White. Full rules: castling, en passant, promotion. Pawn promotes via picker.</p>
    </GameShell>
  );
}

/* ---------------- CHECKERS (you are Red, CPU is Black) ---------------- */
type CC = "r" | "b";
type CPiece = { k: boolean; c: CC } | null;
type CBoard = CPiece[][];
type KMove = { fx: number; fy: number; tx: number; ty: number; cx: number; cy: number };

const cin8 = (x: number, y: number) => x >= 0 && y >= 0 && x < 8 && y < 8;

function initialCheckers(): CBoard {
  const b: CBoard = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 8; x++) if ((x + y) % 2 === 1) b[y][x] = { k: false, c: "b" };
  for (let y = 5; y < 8; y++)
    for (let x = 0; x < 8; x++) if ((x + y) % 2 === 1) b[y][x] = { k: false, c: "r" };
  return b;
}

function cDirs(p: { k: boolean; c: CC }): [number, number][] {
  if (p.k) return [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  return p.c === "r" ? [[-1, -1], [1, -1]] : [[-1, 1], [1, 1]];
}

function cPieceMoves(b: CBoard, x: number, y: number, capturesOnly: boolean): KMove[] {
  const p = b[y][x];
  if (!p) return [];
  const out: KMove[] = [];
  for (const [dx, dy] of cDirs(p)) {
    const nx = x + dx, ny = y + dy;
    const jx = x + 2 * dx, jy = y + 2 * dy;
    if (cin8(jx, jy) && cin8(nx, ny) && b[ny][nx] && b[ny][nx]!.c !== p.c && !b[jy][jx]) {
      out.push({ fx: x, fy: y, tx: jx, ty: jy, cx: nx, cy: ny });
    } else if (!capturesOnly && cin8(nx, ny) && !b[ny][nx]) {
      out.push({ fx: x, fy: y, tx: nx, ty: ny, cx: -1, cy: -1 });
    }
  }
  return out;
}

function cSideMoves(b: CBoard, c: CC): KMove[] {
  const caps: KMove[] = [];
  const quiet: KMove[] = [];
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const p = b[y][x];
      if (!p || p.c !== c) continue;
      for (const m of cPieceMoves(b, x, y, false)) {
        (m.cx >= 0 ? caps : quiet).push(m);
      }
    }
  return caps.length ? caps : quiet;
}

function CheckersGame({ onExit }: { onExit: () => void }) {
  const [board, setBoard] = useState<CBoard>(initialCheckers);
  const [turn, setTurn] = useState<CC>("r");
  const [sel, setSel] = useState<{ x: number; y: number } | null>(null);
  const [locked, setLocked] = useState<{ x: number; y: number } | null>(null);
  const [winner, setWinner] = useState<CC | null>(null);
  const [wins, setWins] = useState(0);

  useEffect(() => {
    setWins(loadBest("8toon-checkers-wins", 0));
  }, []);

  const avail = useMemo(() => {
    if (winner) return [];
    if (locked) return cPieceMoves(board, locked.x, locked.y, true);
    return cSideMoves(board, turn);
  }, [board, turn, locked, winner]);

  const finishIfOver = (b: CBoard, mover: CC): boolean => {
    const foe: CC = mover === "r" ? "b" : "r";
    let foePieces = 0;
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) if (b[y][x] && b[y][x]!.c === foe) foePieces++;
    if (foePieces === 0 || cSideMoves(b, foe).length === 0) {
      setWinner(mover);
      if (mover === "r") {
        setWins((w) => {
          saveBest("8toon-checkers-wins", w + 1);
          return w + 1;
        });
      }
      return true;
    }
    return false;
  };

  const applyOn = (b: CBoard, m: KMove): { b: CBoard; crowned: boolean } => {
    const nb = b.map((r) => r.slice());
    const p = nb[m.fy][m.fx]!;
    nb[m.fy][m.fx] = null;
    if (m.cx >= 0) nb[m.cy][m.cx] = null;
    const crowned = !p.k && ((p.c === "r" && m.ty === 0) || (p.c === "b" && m.ty === 7));
    nb[m.ty][m.tx] = { k: p.k || crowned, c: p.c };
    return { b: nb, crowned };
  };

  const playerMove = (m: KMove) => {
    const { b: nb, crowned } = applyOn(board, m);
    setBoard(nb);
    if (m.cx >= 0 && !crowned) {
      const more = cPieceMoves(nb, m.tx, m.ty, true);
      if (more.length) {
        setLocked({ x: m.tx, y: m.ty });
        setSel({ x: m.tx, y: m.ty });
        return;
      }
    }
    setLocked(null);
    setSel(null);
    if (!finishIfOver(nb, "r")) setTurn("b");
  };

  useEffect(() => {
    if (turn !== "b" || winner) return;
    const t = setTimeout(() => {
      let b = board.map((r) => r.slice());
      let guard = 0;
      for (;;) {
        const ms = cSideMoves(b, "b");
        if (!ms.length) break;
        const caps = ms.filter((m) => m.cx >= 0);
        let pick: KMove;
        if (caps.length) {
          let best = -Infinity;
          pick = caps[0];
          for (const m of caps) {
            const victim = b[m.cy][m.cx]!;
            const v = (victim.k ? 10 : 3) + (m.ty === 7 ? 5 : 0) + Math.random() * 2;
            if (v > best) {
              best = v;
              pick = m;
            }
          }
        } else {
          let best = -Infinity;
          pick = ms[0];
          for (const m of ms) {
            const v = (m.ty - m.fy) * 1.5 + (m.ty === 7 ? 4 : 0) + Math.random() * 2;
            if (v > best) {
              best = v;
              pick = m;
            }
          }
        }
        const r = applyOn(b, pick);
        b = r.b;
        if (pick.cx < 0 || r.crowned) break;
        if (cPieceMoves(b, pick.tx, pick.ty, true).length === 0) break;
        if (++guard > 12) break;
      }
      setBoard(b);
      setSel(null);
      if (!finishIfOver(b, "b")) setTurn("r");
    }, 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, board, winner]);

  const reset = () => {
    setBoard(initialCheckers());
    setTurn("r");
    setSel(null);
    setLocked(null);
    setWinner(null);
  };

  const click = (x: number, y: number) => {
    if (winner || turn !== "r") return;
    const p = board[y][x];
    if (sel && (x !== sel.x || y !== sel.y)) {
      const m = avail.find((a) => a.fx === sel.x && a.fy === sel.y && a.tx === x && a.ty === y);
      if (m) {
        playerMove(m);
        return;
      }
    }
    if (p && p.c === "r" && (!locked || (locked.x === x && locked.y === y))) {
      if (avail.some((a) => a.fx === x && a.fy === y)) setSel({ x, y });
    } else if (!locked) {
      setSel(null);
    }
  };

  const targets = sel ? avail.filter((a) => a.fx === sel.x && a.fy === sel.y) : [];
  const forced = !locked && avail.length > 0 && avail.every((a) => a.cx >= 0);

  return (
    <GameShell title="🔴 Checkers" onExit={onExit} status={wins > 0 ? `🏅 ${wins} wins` : undefined}>
      <p className="text-xs font-bold">
        {winner ? (winner === "r" ? "🏆 You win!" : "CPU wins — run it back!") : turn === "r" ? "Your move (red)" : "CPU thinking…"}
        {!winner && forced && <span className="text-[#c93a26]"> · capture required!</span>}
        {!winner && locked && <span className="text-[#c93a26]"> · keep jumping!</span>}
      </p>
      <div className="grid w-full max-w-[340px] mx-auto border-2 border-[#716f64]" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
        {Array.from({ length: 8 }, (_, y) =>
          Array.from({ length: 8 }, (_, x) => {
            const p = board[y][x];
            const dark = (x + y) % 2 === 1;
            const selected = sel && sel.x === x && sel.y === y;
            const dot = targets.some((m) => m.tx === x && m.ty === y);
            return (
              <button
                key={`${x}-${y}`}
                onClick={() => click(x, y)}
                className="aspect-square flex items-center justify-center relative"
                style={{ background: selected ? "#fffb96" : dark ? "#8a5a33" : "#ecd9b0" }}
              >
                {p && (
                  <span
                    className="w-3/4 h-3/4 rounded-full flex items-center justify-center text-sm shadow-[inset_-2px_-3px_4px_rgba(0,0,0,0.5)]"
                    style={{ background: p.c === "r" ? "radial-gradient(circle at 35% 30%, #ff8a8a, #d21f1f 60%, #7a0e0e)" : "radial-gradient(circle at 35% 30%, #6a6a72, #232328 60%, #000)" }}
                  >
                    {p.k && <span>👑</span>}
                  </span>
                )}
                {dot && !p && <span className="absolute w-3 h-3 rounded-full bg-cyan-400/80" />}
              </button>
            );
          })
        )}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={reset} className="px-3 py-1 bg-[#ece9d8] text-xs font-bold border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] active:border-t-[#716f64] active:border-l-[#716f64] active:border-b-white active:border-r-white">↻ NEW GAME</button>
      </div>
      <p className="text-[10px] text-gray-600">American rules: men march forward, captures are mandatory, multi-jumps chain, back rank crowns kings.</p>
    </GameShell>
  );
}

/* ---------------- BOOKWORM (make words from touching letters) ---------------- */
const BAG = "EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNNRRRRRRRTTTTTTLLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJQXZ";
const LVAL: Record<string, number> = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10 };
const WORDS = new Set(
  ("cat dog sun fun run box fox pig cow hen bee ant egg ice tea cup hat bat rat bus car van bed log fog net pen map pin win top hop pop mop cop rob job lot hot dot pot not apt art ark ear eye leg arm toe lip jaw gem fin bin tin mix zip zap cop cap tap gap lap pal ram ham jam yam sew few new dew pew low row tow vow cow sow joy toy boy sun fun bun gun nun hug rug tug jug mug bud mud bud sub tub rub sob mob rod nod god pod cod fog bog jog log hog cog gem hem rim dim vim wit kit hit sit bit fit kit lit pit wit zit ape are era eve ewe owl own how now cow bow vow row how two who use fur cur our are").split(" ").concat(
  ("game play code star moon fish bird tree leaf rain snow wind fire lake road town city door book page word time lime play clay tray game same came fame name mode work fork home love dove like bike jump bump pump lump fast last past cast slow blow flow glow blue clue glue tree free deaf leaf fish star moon soon cool fool pool tool dish fish bird cake bake lake make take fire wire rain brain drain snow blow flow glow wind kind mind find bind road toad town down gown city door floor cage rage word world time lime tray same came fame name mode fork home dove bike bump pump lump cast blow glue free tool dish bake take wire quiz zero hero love like jump fast slow blue tree leaf star cool fool pool fish dish bake fire rain snow wind kind mind road town door cage word time play game code moon fish bird tree leaf rain snow wind fire lake road town city door book page word time").split(" ")).concat(
  ("apple grape lemon melon berry mango peach table chair shelf couch house mouse horse world words games plays codes stars codes quick brown jumps zebra panda tiger piano train brain drain three glove floor drive tray bread break dream cream steam laugh dance music magic party happy fuzzy vivid waste taste water ocean river beach sunny storm flame light night right fight sight power super lucky joker candy honey sugar spice eagle shark whale snake tulip daisy comet robot laser medal bread break dream cream steam dance music magic party happy fuzzy vivid taste ocean beach storm flame night right fight sight power super lucky candy honey sugar spice eagle shark whale snake robot laser medal").split(" ")).concat(
  ("planet garden forest jungle desert island castle guitar violin soccer tennis rocket silver golden purple orange yellow monkey turtle rabbit lizard parrot sailor pocket bottle candle bridge winter summer spring autumn banana pepper cheese picnic circus meteor cloudy breeze meadow valley canyon harbor market dragon wizard knight pirate record player puzzle wisdom planet garden forest jungle desert island castle guitar tennis rocket silver purple orange yellow monkey turtle rabbit parrot pocket bottle candle bridge winter summer spring banana pepper cheese picnic circus planet garden").split(" ")).concat(
  ("trophy arcade galaxy nebula cosmos voyage journey wonder thunder rainbow sunset sunrise hunter village captain parrot hamster peacock dolphin penguin kitchen balloon puzzle mystery whisper freedom courage arcade galaxy nebula cosmos voyage journey wonder thunder rainbow sunset sunrise hunter village captain hamster dolphin kitchen balloon mystery whisper freedom courage trophy arcade").split(" "))
);

const BCOLS = 7;
const BROWS = 7;
const pickLetter = () => BAG[Math.floor(Math.random() * BAG.length)];

function BookGame({ onExit }: { onExit: () => void }) {
  const freshGrid = () => Array.from({ length: BROWS }, () => Array.from({ length: BCOLS }, () => pickLetter()));
  const [grid, setGrid] = useState<string[][]>(freshGrid);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [msg, setMsg] = useState("Tap touching letters to spell words (3+ letters).");
  const used = useRef<Set<string>>(new Set());

  useEffect(() => {
    setBest(loadBest("8toon-book-best", 0));
  }, []);

  const inPath = (x: number, y: number) => path.findIndex((p) => p.x === x && p.y === y);

  const tap = (x: number, y: number) => {
    const idx = inPath(x, y);
    if (idx >= 0) {
      if (idx === path.length - 1) setPath(path.slice(0, -1));
      return;
    }
    if (path.length === 0) {
      setPath([{ x, y }]);
      return;
    }
    const l = path[path.length - 1];
    if (Math.abs(l.x - x) <= 1 && Math.abs(l.y - y) <= 1) setPath([...path, { x, y }]);
  };

  const word = path.map((p) => grid[p.y][p.x]).join("");

  const submit = () => {
    const w = word.toLowerCase();
    if (path.length < 3) {
      setMsg("Too short — words need 3+ letters!");
      return;
    }
    if (used.current.has(w)) {
      setMsg(`"${word}" already found — no farming!`);
      return;
    }
    if (!WORDS.has(w)) {
      setMsg(`"${word}" isn't in the word list.`);
      return;
    }
    const pts = path.reduce((s, p) => s + (LVAL[grid[p.y][p.x]] ?? 1), 0) + word.length + (word.length >= 6 ? 10 : 0);
    const gone = new Set(path.map((p) => p.x + "," + p.y));
    const next = grid.map((row) => row.slice());
    for (let x = 0; x < BCOLS; x++) {
      const col: string[] = [];
      for (let y = BROWS - 1; y >= 0; y--) if (!gone.has(x + "," + y)) col.push(next[y][x]);
      for (let y = BROWS - 1, i = 0; y >= 0; y--, i++) next[y][x] = i < col.length ? col[i] : pickLetter();
    }
    setGrid(next);
    setPath([]);
    used.current.add(w);
    setFound((f) => [word, ...f].slice(0, 30));
    const ns = score + pts;
    setScore(ns);
    if (ns > best) {
      setBest(ns);
      saveBest("8toon-book-best", ns);
    }
    setMsg(`+${pts} for "${word}"!`);
  };

  const scramble = () => {
    setGrid(freshGrid());
    setPath([]);
    setMsg("Board scrambled — fresh letters!");
  };

  const reset = () => {
    setGrid(freshGrid());
    setPath([]);
    setScore(0);
    setFound([]);
    used.current = new Set();
    setMsg("Tap touching letters to spell words (3+ letters).");
  };

  const preview = path.reduce((s, p) => s + (LVAL[grid[p.y][p.x]] ?? 1), 0) + word.length;

  return (
    <GameShell title="🐛 Bookworm" onExit={onExit} status={`SCORE ${score}${best > 0 ? ` · BEST ${best}` : ""}`}>
      <div className="bg-[#0b0033] text-[#01cdfe] px-2 py-1.5 font-mono text-sm border-2 border-[#ff71ce] min-h-9 break-all">
        {word || <span className="opacity-50">_ _ _</span>}
        {word.length > 0 && <span className="text-[#fffb96]"> ({preview} pts)</span>}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${BCOLS}, 1fr)` }}>
        {grid.map((row, y) =>
          row.map((ch, x) => {
            const idx = inPath(x, y);
            const on = idx >= 0;
            return (
              <button
                key={`${x}-${y}`}
                onClick={() => tap(x, y)}
                className={`aspect-square text-xl font-black border-2 relative ${
                  on ? "bg-[#fffb96] border-[#c9a800] text-[#0b0033]" : "bg-gradient-to-b from-white to-[#d4d0c8] border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] text-[#0b0033]"
                }`}
              >
                {ch}
                <span className="absolute bottom-0 right-0.5 text-[8px] font-mono text-gray-500">{LVAL[ch]}</span>
                {on && <span className="absolute top-0 left-0.5 text-[9px] font-mono text-[#c93a26]">{idx + 1}</span>}
              </button>
            );
          })
        )}
      </div>
      <p className="text-[11px] min-h-4 text-gray-700">{msg}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={submit} className="px-3 py-1 bg-[#2f7b2f] text-white text-xs font-bold border-2 border-t-white border-l-white border-b-[#1d5a1d] border-r-[#1d5a1d]">✔ SUBMIT</button>
        <button onClick={() => setPath([])} className="px-3 py-1 bg-[#ece9d8] text-xs font-bold border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64]">✖ CLEAR</button>
        <button onClick={scramble} className="px-3 py-1 bg-[#ece9d8] text-xs font-bold border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64]">🔀 SCRAMBLE</button>
        <button onClick={reset} className="px-3 py-1 bg-[#ece9d8] text-xs font-bold border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64]">↻ NEW</button>
      </div>
      {found.length > 0 && (
        <div className="bg-white border border-gray-400 p-1.5 max-h-20 overflow-auto text-[11px]">
          <span className="font-bold">📖 Found ({found.length}): </span>{found.join(", ")}
        </div>
      )}
    </GameShell>
  );
}

/* ---------------- ARCADE MENU ---------------- */
export function GamesContent() {
  const [game, setGame] = useState<GameId | null>(null);
  const [bests, setBests] = useState({ snake: 0, mines: 0, memory: 0, chess: 0, checkers: 0, book: 0 });

  useEffect(() => {
    if (game === null) {
      setBests({
        snake: loadBest("8toon-snake-best", 0),
        mines: loadBest("8toon-mines-best", 0),
        memory: loadBest("8toon-memory-best", 0),
        chess: loadBest("8toon-chess-wins", 0),
        checkers: loadBest("8toon-checkers-wins", 0),
        book: loadBest("8toon-book-best", 0),
      });
    }
  }, [game]);

  if (game === "snake") return <SnakeGame onExit={() => setGame(null)} />;
  if (game === "mines") return <MinesGame onExit={() => setGame(null)} />;
  if (game === "memory") return <MemoryGame onExit={() => setGame(null)} />;
  if (game === "chess") return <ChessGame onExit={() => setGame(null)} />;
  if (game === "checkers") return <CheckersGame onExit={() => setGame(null)} />;
  if (game === "book") return <BookGame onExit={() => setGame(null)} />;

  const list: { id: GameId; icon: string; name: string; file: string; desc: string; best: string }[] = [
    { id: "snake", icon: "🐍", name: "Snake", file: "snake.exe", desc: "Eat pixels. Don't bite yourself.", best: bests.snake > 0 ? `🏅 best ${bests.snake}` : "" },
    { id: "mines", icon: "💣", name: "Minesweeper", file: "mines.exe", desc: "The XP classic. Clear 10 mines.", best: bests.mines > 0 ? `⏱ best ${bests.mines}s` : "" },
    { id: "memory", icon: "🃏", name: "Memory Match", file: "memory.exe", desc: "Flip cards, find all 8 pairs.", best: bests.memory > 0 ? `🏅 best ${bests.memory} moves` : "" },
    { id: "chess", icon: "♞", name: "Chess", file: "chess.exe", desc: "You are White. Outsmart the CPU.", best: bests.chess > 0 ? `🏅 ${bests.chess} wins` : "" },
    { id: "checkers", icon: "🔴", name: "Checkers", file: "checkers.exe", desc: "Jump everything. Crown kings.", best: bests.checkers > 0 ? `🏅 ${bests.checkers} wins` : "" },
    { id: "book", icon: "🐛", name: "Bookworm", file: "bookworm.exe", desc: "Connect letters, spell words.", best: bests.book > 0 ? `🏅 best ${bests.book}` : "" },
  ];

  return (
    <div className="space-y-2">
      <div className="bg-gradient-to-r from-[#ff71ce] to-[#01cdfe] text-white px-2 py-1.5 text-xs font-black tracking-widest border border-[#0b0033]">
        ★ INSERT COIN — pick your game ★
      </div>
      {list.map((g) => (
        <button
          key={g.id}
          onClick={() => setGame(g.id)}
          className="w-full flex items-center gap-3 bg-white border-2 border-[#245edb] p-2 text-left hover:bg-[#fffb96] transition-colors shadow-sm"
        >
          <span className="text-3xl">{g.icon}</span>
          <span className="flex-1">
            <span className="block font-black text-sm">{g.name} <span className="text-[10px] font-mono font-normal text-gray-500">{g.file}</span></span>
            <span className="block text-xs text-gray-600">{g.desc}</span>
            {g.best && <span className="block text-[11px] font-bold text-[#b8860b]">{g.best}</span>}
          </span>
          <span className="text-xl">▶</span>
        </button>
      ))}
      <div className="bg-[#0b0033] text-[#01cdfe] p-2 text-[11px] font-mono border-2 border-[#ff71ce]">
        C:\games&gt; loading fun.dll <span className="blink">█</span>
      </div>
    </div>
  );
}
