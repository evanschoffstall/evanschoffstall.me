"use client";
import { consumeSkipHomeIntroOnce } from "@/shared/lib/home-intro";
import { fadeIn, fadeInUp } from "@/shared/lib/motion";
import type { Project } from "contentlayer/generated";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, RefreshCw, Twitter } from "lucide-react";
import { useCallback, useState } from "react";
import { Glow } from "../common/glow";
import { ProjectHeroCard } from "../projects/project-hero-card";
import { HeroName } from "./hero-name";
import { PortfolioCard } from "./portfolio-card";

type Props = {
  onViewProjects?: () => void;
  featuredProject?: Project;
  featuredViews?: number;
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
          className="w-full max-w-3xl mt-6 relative"
          initial="hidden"
          animate={nameSettled ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <Glow />
          <PortfolioCard
            onViewProjects={onViewProjects}
            nameSettled={nameSettled}
          />
        </motion.div>
      </div>
    </>
  );
}
