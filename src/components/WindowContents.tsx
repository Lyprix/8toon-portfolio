"use client";
import { portfolio, projects, skills, achievements, contactLinks } from "@/data/portfolio";

export function HomeContent() {
  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-[#0058e6] p-4 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]">
        <p className="text-[#ff2975] font-bold text-xs tracking-widest">★ WELCOME TO</p>
        <h1 className="text-2xl font-black text-[#0b0033] leading-tight">Hello! Welcome to {portfolio.name}&apos;s Portfolio</h1>
        <p className="text-[#245edb] font-bold">{portfolio.title}</p>
        <p className="mt-1 italic text-gray-700">{portfolio.tagline} Double-click icons to explore.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {portfolio.highlights.map((h, i, arr) => (
          <div
            key={h}
            className={`bg-[#fffb96] border border-[#c9a800] p-2 text-xs shadow-sm ${
              arr.length % 2 === 1 && i === arr.length - 1 ? "col-span-2 max-w-[calc(50%-4px)] w-full mx-auto text-center" : ""
            }`}
          >
            {h}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-600">Tip: drag windows by the blue title bar!</p>
    </div>
  );
}

export function AboutContent() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-start bg-white p-3 border border-gray-400">
        <div className="w-16 h-16 shrink-0 rounded-sm bg-gradient-to-br from-[#ff71ce] via-[#b967ff] to-[#01cdfe] flex items-center justify-center text-3xl border-2 border-[#0058e6]">
          👾
        </div>
        <div>
          <h2 className="font-bold text-base">{portfolio.fullName}</h2>
          <p className="text-[#245edb] text-xs font-bold">{portfolio.yearStatus}</p>
          <p className="text-xs text-gray-600">{portfolio.title} · {portfolio.college}</p>
          <p className="text-xs text-gray-600">{portfolio.email}</p>
        </div>
      </div>
      <p className="bg-white p-3 border border-gray-400 whitespace-pre-line leading-relaxed">{portfolio.about}</p>
      <div className="flex gap-2">
        <a href={portfolio.github} target="_blank" className="px-3 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] active:border-t-[#716f64] active:border-l-[#716f64] active:border-b-white active:border-r-white text-xs font-bold">🐙 GitHub</a>
        <a href={portfolio.linkedin} target="_blank" className="px-3 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] active:border-t-[#716f64] active:border-l-[#716f64] active:border-b-white active:border-r-white text-xs font-bold">💼 LinkedIn</a>
      </div>
    </div>
  );
}

export function ProjectsContent() {
  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.title} className="bg-white border border-gray-400 shadow-sm">
          <div className="bg-gradient-to-r from-[#245edb] to-[#3f8cf3] text-white px-2 py-1 text-xs font-bold flex justify-between">
            <span>📁 {p.title}</span><span>{p.year}</span>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-800">{p.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {p.tech.map((t) => (
                <span key={t} className="text-[10px] bg-[#e8f0ff] border border-[#245edb] text-[#245edb] px-1.5 py-0.5 rounded-full font-bold">{t}</span>
              ))}
            </div>
            {p.link && <a href={p.link} target="_blank" className="text-xs text-blue-700 underline mt-1 inline-block">🔗 View project →</a>}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-gray-600">See all at <a href="https://github.com/Lyprix" target="_blank" className="text-blue-700 underline">github.com/Lyprix</a></p>
    </div>
  );
}

export function SkillsContent() {
  return (
    <div className="space-y-3">
      {skills.map((g) => (
        <div key={g.category} className="bg-white border border-gray-400">
          <div className="px-2 py-1 bg-[#ece9d8] border-b border-gray-400 font-bold text-xs">💿 {g.category}</div>
          <div className="p-2 flex flex-wrap gap-1.5">
            {g.items.map((s) => (
              <span key={s} className="text-xs px-2 py-1 bg-gradient-to-b from-white to-[#d4d0c8] border border-[#716f64] shadow-sm font-bold">{s}</span>
            ))}
          </div>
        </div>
      ))}
      <div className="bg-[#0b0033] text-[#01cdfe] p-2 text-[11px] font-mono border-2 border-[#ff71ce]">
        C:\skills&gt; loading StillLearningSkills.exe <span className="blink">█</span>
      </div>
    </div>
  );
}

export function AchievementsContent() {
  return (
    <div className="space-y-3">
      {achievements.map((a) => (
        <div key={a.title} className="flex gap-2 bg-white border border-gray-400 p-2">
          <div className="text-2xl">🏆</div>
          <div>
            <p className="font-bold text-[13px]">{a.title}</p>
            <p className="text-[11px] text-[#245edb] font-bold">{a.org} · {a.year}</p>
            <p className="text-xs text-gray-700 mt-0.5">{a.description}</p>
          </div>
        </div>
      ))}
      <div className="bg-[#0b0033] text-[#01cdfe] p-2 text-[11px] font-mono border-2 border-[#ff71ce]">
        C:\achievements&gt; loading StillEarningTrophies.exe <span className="blink">█</span>
      </div>
    </div>
  );
}

export function ContactContent() {
  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-400 p-3 text-center">
        <p className="text-3xl">📬</p>
        <h2 className="font-bold">Let&apos;s connect!</h2>
        <p className="text-xs text-gray-600">I reply within 1-3 Business Days. Pick your channel:</p>
      </div>
      {contactLinks.map((c) => (
        <a key={c.label} href={c.href} target="_blank" className="flex items-center gap-3 bg-white border border-gray-400 p-2 hover:bg-[#fffb96] transition-colors">
          <span className="text-xl">{c.icon}</span>
          <span><span className="block font-bold text-xs">{c.label}</span><span className="block text-xs text-blue-700 underline">{c.value}</span></span>
        </a>
      ))}
    </div>
  );
}
