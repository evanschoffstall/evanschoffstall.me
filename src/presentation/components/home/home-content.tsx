"use client";
import { consumeSkipHomeIntroOnce } from "@/shared/lib/home-intro";
import { fadeIn, fadeInUp } from "@/shared/lib/motion";
import type { Project } from "contentlayer/generated";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Github,
  Layers,
  Linkedin,
  Mail,
  RefreshCw,
  Rss,
  Terminal,
  Twitter,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Card } from "../common/card";
import { Glow } from "../common/glow";
import { ProjectHeroCard } from "../projects/project-hero-card";
import { HeroName } from "./hero-name";

type Props = {
  onViewProjects?: () => void;
  featuredProject?: Project;
  featuredViews?: number;
};

// ========================================
// CONTENT - Edit all bio text here
// ========================================

const content = {
  subtitle: "Technologist, Engineer, and Business Officer",

  summary:
    "Technologist, engineer, and business officer with expertise spanning code to teams to revenue. Currently contributing to state-level public procurement systems and procurement operations. Previously facilitated compliant data science initiatives at a national utility and drove a local winery's technical operations from inception to multi-million dollar success.",

  highlights: [
    {
      icon: <Terminal className="w-4 h-4" />,
      title: "15+ Years",
      description:
        "Ground floor to executive across government, enterprise, and startups.",
    },
    {
      icon: <Code2 className="w-4 h-4" />,
      title: "Full Stack",
      description:
        "Web, cloud, and systems. TypeScript to Rust, React to Kubernetes.",
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: "Builder & Leader",
      description:
        "From solo projects to team operations. Technical and business ownership.",
    },
    {
      icon: <Rss className="w-4 h-4" />,
      title: "Open Source",
      description: "LibreRSS, resh, and contributions to OpenEmu & Wineskin.",
    },
  ],

  stack: {
    title: "Core Stack",
    items: [
      {
        label: "Primary",
        tech: "TypeScript, Python, Rust, C# • React, Next.js, Node.js, .NET",
      },
      {
        label: "Infrastructure",
        tech: "Docker, Kubernetes • AWS, Azure • CI/CD automation",
      },
      {
        label: "Data",
        tech: "PostgreSQL, Redis • SAP ERP • Data pipelines & analytics",
      },
      {
        label: "Also",
        tech: "Java, Go, C++, Swift, PHP • MySQL, MariaDB • OpenShift, Vercel, Jenkins",
      },
    ],
  },
};

// ========================================

const socials = [
  {
    icon: <Github className="w-4 h-4" />,
    href: "https://github.com/evanschoffstall",
    label: "GitHub",
  },
  {
    icon: <Linkedin className="w-4 h-4" />,
    href: "https://www.linkedin.com/in/evan-schoffstall-2a9531163/",
    label: "LinkedIn",
  },
  {
    icon: <Twitter className="w-4 h-4" />,
    href: "https://twitter.com/evnschoffstall",
    label: "Twitter",
  },
  {
    icon: <Mail className="w-4 h-4" />,
    href: "mailto:hello@evanschoffstall.me",
    label: "Email",
  },
];

export function HomeContent({
  onViewProjects,
  featuredProject,
  featuredViews = 0,
}: Props) {
  const [skipInitialHeroAnimation] = useState(() => consumeSkipHomeIntroOnce());
  const [nameSettled, setNameSettled] = useState(skipInitialHeroAnimation);
  const [heroRunId, setHeroRunId] = useState(0);

  const handleSettled = useCallback(() => {
    setNameSettled(true);
  }, []);

  const handleReplayHero = useCallback(() => {
    setNameSettled(false);
    setHeroRunId((runId) => runId + 1);
  }, []);

  return (
    <>
      {/* Nav */}
      <motion.nav
        className="absolute top-0 left-0 right-0 z-20"
        initial="hidden"
        animate={nameSettled ? "visible" : "hidden"}
        variants={fadeIn}
      >
        <div className="flex items-center justify-end px-6 py-4">
          <div className="flex items-center gap-4">
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
            <span className="w-px h-3 bg-zinc-800" />
            <button
              type="button"
              onClick={handleReplayHero}
              aria-label="Replay intro"
              className="text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Centered stack: name + tagline + card */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <HeroName
          key={heroRunId}
          onSettled={handleSettled}
          skipInitialAnimation={skipInitialHeroAnimation && heroRunId === 0}
        />

        <motion.div
          className="w-full max-w-3xl mt-6"
          initial="hidden"
          animate={nameSettled ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <button
            type="button"
            onClick={onViewProjects}
            className="w-full group relative overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-5 py-4 shadow-2xl shadow-zinc-900/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-600/70 hover:bg-zinc-800/10 active:translate-y-0"
          >
            {/* Top edge accent — same pattern as the cards below */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent" />

            <span className="relative flex items-center justify-between gap-3.5">
              <span className="flex items-center gap-3.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/70 text-zinc-400 ring-1 ring-zinc-700/60 transition-all duration-200 group-hover:bg-zinc-700/60 group-hover:text-zinc-200 group-hover:ring-zinc-600/60">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold tracking-wide text-zinc-200 transition-colors duration-200 group-hover:text-white">
                    View Projects
                  </span>
                  <span className="text-[11px] text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
                    Explore my work
                  </span>
                </span>
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-zinc-300" />
            </span>
          </button>
        </motion.div>

        {featuredProject ? (
          <motion.div
            className="w-full max-w-3xl mt-6 relative"
            initial="hidden"
            animate={nameSettled ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <ProjectHeroCard
              project={featuredProject}
              views={featuredViews}
              headingId="featured-home-project"
              featured
            />
          </motion.div>
        ) : null}

        {/* About card */}
        <motion.div
          className="w-full max-w-3xl mt-10 relative"
          initial="hidden"
          animate={nameSettled ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          {/* Subtle glow effect */}
          <Glow />
          <Card className="border-zinc-700/60 bg-zinc-900/40 hover:border-zinc-600/70">
            {/* Top edge accent — mirrors featured card design language */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent pointer-events-none" />
            {/* Card header */}
            <motion.div
              className="flex items-center gap-5 p-5 md:p-6 border-b border-zinc-800/50"
              initial={{ opacity: 0, y: 10 }}
              animate={
                nameSettled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={{
                duration: 0.5,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
            >
              <Image
                src="/pfp.png"
                alt="Evan Schoffstall"
                width={56}
                height={56}
                className="rounded-full ring-1 ring-zinc-800 shrink-0"
              />
              <div>
                <h2 className="text-sm font-medium text-zinc-100">
                  Evan Schoffstall
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {content.subtitle}
                </p>
              </div>
            </motion.div>

            {/* Professional Summary */}
            <motion.div
              className="p-5 md:p-6 border-b border-zinc-800/50"
              initial={{ opacity: 0, y: 10 }}
              animate={
                nameSettled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={{
                duration: 0.5,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
            >
              <p className="text-[13px] leading-relaxed text-zinc-400">
                {content.summary}
              </p>
            </motion.div>

            {/* Highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/50">
              {content.highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  className={`p-5 md:p-6 ${i >= 2 ? "border-t border-zinc-800/50" : ""}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={
                    nameSettled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.7 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800/40 text-zinc-500 shadow-lg shadow-zinc-950/50">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-medium text-zinc-300">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-600 pl-[38px]">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Skills & Technologies */}
            <motion.div
              className="p-5 md:p-6 border-t border-zinc-800/50"
              initial={{ opacity: 0, y: 10 }}
              animate={
                nameSettled ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={{
                duration: 0.5,
                delay: 1.1,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
            >
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                {content.stack.title}
              </h3>
              <div className="space-y-2.5">
                {content.stack.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs text-zinc-500 min-w-[80px] pt-0.5">
                      {item.label}
                    </span>
                    <p className="text-[13px] text-zinc-400 leading-relaxed">
                      {item.tech}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
