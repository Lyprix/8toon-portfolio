export const portfolio = {
  name: "Aeton Alcantara",
  fullName: "Aeton Sebastian P. Alcantara",
  title: "BSIT & Cybersecurity Student",
  yearStatus: "3rd Year BSIT in the CyberSecurity Specialization (as of 2026)",
  college: "Mapua Malayan Colleges Laguna",
  tagline: "Welcome to my vaporwave desktop!",
  location: "Manila, Philippines",
  email: "aetonalcantara123@gmail.com",
  github: "https://github.com/Lyprix",
  linkedin: "https://www.linkedin.com/in/aeton-alcantara-7652a6440",
  about: `Sup! I build and code things to help me either get one step closer to my dreams or to just have fun in life. I specialize in Python, C#, C++, Javascript, SQLite and many more. When im not coding or building things, I try and get away from the bad things in life. Whether that's working out on the gym every weekdays, playing all sorts of video games, appreciating all sorts of music or enjoying the small details of life.`,

  highlights: [
    "⚡ 3+ years building web apps",
    "🎨 Obsessed with UI detail & retro aesthetics",
    "🌐 Open source contributor",
  ],
};

export type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
  year: string;
};

export const projects: Project[] = [
  {
    title: "VidL — Universal Video Extractor",
    description:
      "Downloads videos as 1080p MP4s from 1000+ sites (YouTube, TikTok, Instagram, etc.). Paste a link, press Download, get the file — with ffmpeg and Deno bundled inside, so it works with zero installs.",
    tech: ["Python", "ffmpeg", "Deno"],
    link: "https://github.com/Lyprix/VidL",
    year: "2026",
  },
  {
    title: "Ciphers",
    description:
      "Collection of projects and programs relating to ciphers — encoding, decoding and breaking classical cryptography.",
    tech: ["Python"],
    link: "https://github.com/Lyprix/Ciphers",
    year: "2026",
  },
  {
    title: "XP Portfolio OS",
    description:
      "This very site — a Windows XP retrowave portfolio with draggable windows, taskbar and shutdown screen.",
    tech: ["Next.js", "React", "TypeScript", "Tailwind"],
    link: "https://github.com/Lyprix",
    year: "2026",
  },
];

export const skills = [
  { category: "Languages", items: ["Python", "C#", "C++", "JavaScript", "SQLite"] },
  { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML/CSS"] },
  { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Firebase"] },
  { category: "Tools & Other", items: ["Git & GitHub", "Vercel", "Figma", "Photoshop"] },
];

export const achievements = [
  {
    title: "Top 40 ASEAN AI Hackathon",
    org: "Mapua Malayan Colleges Laguna",
    year: "2025 - 2026",
    description: "Participated and reached Top 40 Teams in the Hackathon.",
  },
  {
    title: "Dean's Lister",
    org: "Mapua Malayan Colleges Laguna",
    year: "2024 - 2025",
    description: "Was recognized for academic excellence in the 3rd Term of his 1st Year.",
  },
  {
    title: "Angel Awardee",
    org: "Angels in Heaven School Inc.",
    year: "2023 - 2024",
    description: "Has shown highest distinction in both academic and values.",
  },
  {
    title: "Gold Loyalty Awardee",
    org: "Angels in Heaven School Inc.",
    year: "2023 - 2024",
    description: "Has stayed in Angels in Heaven since Grade 1.",
  },
  {
    title: "Proficiency in Business Ethics and Social Responsibility",
    org: "Angels in Heaven School Inc.",
    year: "2023 - 2024",
    description: "Has earned the recognition of possessing superior knowledge, skill and advancement towards the subject.",
  },
  {
    title: "Proficiency in Empowerment Technology (ICT)",
    org: "Angels in Heaven School Inc.",
    year: "2023 - 2024",
    description: "Has earned the recognition of possessing superior knowledge, skill and advancement towards the subject.",
  },
  {
    title: "Best Male Presenter in Research in Daily Life 2",
    org: "Angels in Heaven School Inc.",
    year: "2023 - 2024",
    description: "Has proven himself to be the top performing presenter in Practical Research 2.",
  },
];

export const contactLinks = [
  { label: "Email", value: "aetonalcantara123@gmail.com", href: "mailto:aetonalcantara123@gmail.com", icon: "✉️" },
  { label: "GitHub", value: "github.com/Lyprix", href: "https://github.com/Lyprix", icon: "🐙" },
  { label: "LinkedIn", value: "linkedin.com/in/aeton-alcantara-7652a6440", href: "https://www.linkedin.com/in/aeton-alcantara-7652a6440", icon: "💼" },
];
