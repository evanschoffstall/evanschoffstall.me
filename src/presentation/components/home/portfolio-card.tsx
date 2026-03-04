"use client";

import { cn } from "@/shared/lib/cn";
import { motion, useMotionTemplate, useSpring } from "framer-motion";
import {
  Code2,
  Github,
  Layers,
  Linkedin,
  Mail,
  Rss,
  Terminal,
  Twitter,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";

type Props = {
  onViewProjects?: () => void;
  nameSettled: boolean;
};

const highlights = [
  {
    icon: <Terminal className="w-3.5 h-3.5" />,
    label: "15+ Years",
    sub: "Gov · Enterprise · Startup",
    color: "text-violet-400",
    bg: "bg-violet-950/40",
    ring: "ring-violet-800/50",
  },
  {
    icon: <Code2 className="w-3.5 h-3.5" />,
    label: "Full Stack",
    sub: "TS · Rust · K8s",
    color: "text-sky-400",
    bg: "bg-sky-950/40",
    ring: "ring-sky-800/50",
  },
  {
    icon: <Users className="w-3.5 h-3.5" />,
    label: "Builder & Leader",
    sub: "IC to Executive",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    ring: "ring-amber-800/50",
  },
  {
    icon: <Rss className="w-3.5 h-3.5" />,
    label: "Open Source",
    sub: "LibreRSS · resh",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    ring: "ring-emerald-800/50",
  },
];

const stackTags = [
  { label: "TypeScript", tier: "primary" },
  { label: "Python", tier: "primary" },
  { label: "Rust", tier: "primary" },
  { label: "C#", tier: "primary" },
  { label: "React", tier: "primary" },
  { label: "Next.js", tier: "primary" },
  { label: "Node.js", tier: "primary" },
  { label: ".NET", tier: "primary" },
  { label: "Docker", tier: "infra" },
  { label: "Kubernetes", tier: "infra" },
  { label: "AWS", tier: "infra" },
  { label: "Azure", tier: "infra" },
  { label: "PostgreSQL", tier: "data" },
  { label: "Redis", tier: "data" },
  { label: "SAP ERP", tier: "data" },
];

const socials = [
  {
    icon: <Github className="w-3.5 h-3.5" />,
    href: "https://github.com/evanschoffstall",
    label: "GitHub",
  },
  {
    icon: <Linkedin className="w-3.5 h-3.5" />,
    href: "https://www.linkedin.com/in/evan-schoffstall-2a9531163/",
    label: "LinkedIn",
  },
  {
    icon: <Twitter className="w-3.5 h-3.5" />,
    href: "https://twitter.com/evnschoffstall",
    label: "Twitter",
  },
  {
    icon: <Mail className="w-3.5 h-3.5" />,
    href: "mailto:hello@evanschoffstall.me",
    label: "Email",
  },
];

const tierStyle: Record<string, string> = {
  primary: "bg-zinc-800/60 text-zinc-300 ring-zinc-700/50",
  infra: "bg-sky-950/30 text-sky-400/80 ring-sky-800/30",
  data: "bg-emerald-950/30 text-emerald-400/80 ring-emerald-800/30",
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function PortfolioCard({ onViewProjects, nameSettled }: Props) {
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(260px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <motion.div
      onMouseMove={onMouseMove}
      className="relative overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900/40 shadow-2xl shadow-zinc-900/50 group"
      initial="hidden"
      animate={nameSettled ? "visible" : "hidden"}
      variants={stagger}
    >
      {/* Top edge accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent pointer-events-none z-10" />

      {/* Mouse-follow shimmer */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-zinc-100/10 via-zinc-100/5 to-transparent opacity-0 mix-blend-overlay transition duration-1000 group-hover:opacity-100"
          style={style}
        />
      </div>

      {/* ── HEADER ── */}
      <motion.div
        className="relative flex items-start justify-between gap-4 p-5 md:p-6"
        variants={item}
      >
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Image
              src="/pfp.png"
              alt="Evan Schoffstall"
              width={64}
              height={64}
              className="rounded-full ring-2 ring-zinc-700/80"
            />
            {/* Available dot */}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-100 tracking-tight">
              Evan Schoffstall
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Technologist · Engineer · Business Officer
            </p>
            {/* Social row */}
            <div className="flex items-center gap-3 mt-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* View Projects CTA */}
        <button
          type="button"
          onClick={onViewProjects}
          className="shrink-0 group/btn relative overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-3.5 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-600/70 hover:bg-zinc-700/50 active:translate-y-0"
        >
          <span className="relative flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400 transition-colors duration-200 group-hover/btn:text-zinc-200" />
            <span className="text-xs font-medium text-zinc-300 transition-colors duration-200 group-hover/btn:text-white whitespace-nowrap">
              View Projects
            </span>
          </span>
        </button>
      </motion.div>

      {/* ── DIVIDER ── */}
      <div className="mx-5 md:mx-6 h-px bg-zinc-800/70" />

      {/* ── BIO ── */}
      <motion.p
        className="px-5 md:px-6 py-4 text-sm leading-relaxed text-zinc-400"
        variants={item}
      >
        Technologist and engineer with expertise spanning code to teams to
        revenue. Currently contributing to state-level public procurement
        systems. Previously drove a winery's technical operations from inception
        to multi-million dollar success.
      </motion.p>

      {/* ── HIGHLIGHTS ── */}
      <motion.div
        className="grid grid-cols-2 gap-2 px-5 md:px-6 pb-5 md:pb-6"
        variants={stagger}
      >
        {highlights.map((h) => (
          <motion.div
            key={h.label}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3.5 py-3 ring-1",
              h.bg,
              h.ring,
            )}
            variants={item}
          >
            <span className={cn("mt-0.5 shrink-0", h.color)}>{h.icon}</span>
            <div>
              <p className={cn("text-xs font-semibold", h.color)}>{h.label}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                {h.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── DIVIDER ── */}
      <div className="mx-5 md:mx-6 h-px bg-zinc-800/70" />

      {/* ── STACK TAGS ── */}
      <motion.div className="px-5 md:px-6 py-5" variants={item}>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
          Core Stack
        </p>
        <div className="flex flex-wrap gap-1.5">
          {stackTags.map((t) => (
            <span
              key={t.label}
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                tierStyle[t.tier],
              )}
            >
              {t.label}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
