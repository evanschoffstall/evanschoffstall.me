"use client";

import { ScrollArea } from "@/presentation/common/scroll-area";
import { consumeSkipHomeIntroOnce } from "@/shared/hero-intro";
import { fadeIn, fadeInUp } from "@/shared/motion";
import type { Project } from "contentlayer/generated";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, RefreshCw, Twitter } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { HeroName } from "./hero-name";
import { HomeOverview } from "./overview";

type Props = {
  onViewProjects?: () => void;
  featuredProject?: Project;
  featuredViews?: number;
};

type NavSocialLink = { href: string; icon: React.ReactNode; label: string };

/** Social links rendered as icon-only buttons in the nav bar. */
const NAV_SOCIAL_LINKS: NavSocialLink[] = [
  {
    href: "https://github.com/evanschoffstall",
    icon: <Github className="h-3 w-3" />,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/evan-schoffstall-2a9531163/",
    icon: <Linkedin className="h-3 w-3" />,
    label: "LinkedIn",
  },
  {
    href: "https://twitter.com/evnschoffstall",
    icon: <Twitter className="h-3 w-3" />,
    label: "Twitter",
  },
  {
    href: "mailto:hello@evanschoffstall.me",
    icon: <Mail className="h-3 w-3" />,
    label: "Email",
  },
];

/**
 * Home page shell: manages the hero animation state, renders the nav (with
 * status badge + social links), and wraps all scrollable content in a custom
 * ScrollArea so the native browser scrollbar is replaced.
 */
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
    <div className="relative h-screen overflow-hidden">
      {/* Nav — status badge + socials on the left, replay on the right */}
      <motion.nav
        className="absolute left-0 right-0 top-0 z-20"
        initial="hidden"
        animate={nameSettled ? "visible" : "hidden"}
        variants={fadeIn}
      >
        {/* Subtle backdrop so content scrolling underneath doesn't bleed through */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"
          aria-hidden
        />
        <div className="relative flex items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: availability badge + social icon buttons */}
          <div className="flex items-center gap-2">
            {/*
             * Badge — collapses to dot-only on mobile (< sm) to prevent nav
             * crowding since the badge text + 4 icons barely fit at 375px.
             */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">Available for new work</span>
            </div>
            {/* Social icons — always shown, smaller on mobile */}
            <div className="flex items-center gap-1">
              {NAV_SOCIAL_LINKS.map((sl) => (
                <Link
                  key={sl.label}
                  href={sl.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={sl.label}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-500 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200 sm:h-7 sm:w-7"
                >
                  {sl.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: replay intro */}
          <button
            type="button"
            onClick={handleReplayHero}
            aria-label="Replay intro"
            className="relative text-zinc-600 transition-colors duration-200 hover:text-zinc-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.nav>

      {/* Scrollable content — custom ScrollArea replaces native browser scroll */}
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col items-center px-4 pb-16 pt-16 sm:px-6 sm:pt-20 md:pt-24 lg:pt-28">
          <HeroName
            key={heroRunId}
            onSettled={handleSettled}
            skipInitialAnimation={skipInitialHeroAnimation && heroRunId === 0}
          />

          <motion.div
            className="mt-10 w-full max-w-5xl md:mt-14"
            initial="hidden"
            animate={nameSettled ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <HomeOverview
              onViewProjects={onViewProjects}
              featuredProject={featuredProject}
              featuredViews={featuredViews}
            />
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
