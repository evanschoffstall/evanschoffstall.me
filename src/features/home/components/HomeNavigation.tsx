"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { iconButtonClassName, SocialIconLinks } from "@/components";
import { fadeIn } from "@/shared";

/**
 * Visibility and replay controls for the fixed home navigation overlay.
 */
interface HomeNavigationProps {
  nameSettled: boolean;
  onReplayHero: () => void;
  skipInitialAnimation?: boolean;
}

/**
 * Top navigation overlay for the home screen while the hero is visible.
 * @param props - Data and handlers that control the home navigation state, including
 * the settled flag, replay callback, and optional animation override.
 * @returns The fixed navigation overlay rendered above the home hero.
 */
export function HomeNavigation(props: HomeNavigationProps) {
  const { nameSettled, onReplayHero, skipInitialAnimation = false } = props;

  return (
    <motion.nav
      animate={nameSettled ? "visible" : "hidden"}
      className="
        fixed inset-x-0 top-0 z-50 border-b border-transparent bg-zinc-900/0
        backdrop-blur
      "
      initial={skipInitialAnimation ? false : "hidden"}
      variants={fadeIn}
    >
      <div
        className="
        relative flex items-center justify-between px-4 py-3
        sm:px-6
      "
      >
        <HomeAvailabilityBadge />

        <div className="flex items-center gap-1">
          <button
            aria-label="Replay intro"
            className={iconButtonClassName}
            onClick={onReplayHero}
            type="button"
          >
            <RefreshCw className="size-3" />
          </button>
          <SocialIconLinks />
        </div>
      </div>
    </motion.nav>
  );
}

/**
 * Availability badge shown in the home navigation.
 * @returns The availability pill used beside the navigation actions.
 */
function HomeAvailabilityBadge() {
  return (
    <div
      className="
      inline-flex items-center gap-1.5 rounded-full border border-zinc-800
      bg-zinc-900/70 px-2.5 py-1.5 text-xs font-medium text-zinc-400
      backdrop-blur-sm
    "
    >
      <span className="relative flex size-2 shrink-0">
        <span
          className="
          absolute inline-flex size-full animate-ping rounded-full
          bg-emerald-400 opacity-60
        "
        />
        <span
          className="
          relative inline-flex size-2 rounded-full bg-emerald-500
        "
        />
      </span>
      <span
        className="
        hidden
        sm:inline
      "
      >
        Available for new work
      </span>
    </div>
  );
}
