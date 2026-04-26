"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { ParticlesBackground } from "@/components";
import { fadeIn, fadeInUp } from "@/shared";

/**
 * One call-to-action rendered in the shared status-page footer row.
 */
interface StatusPageAction {
  href?: string;
  label: string;
  onClick?: () => void;
  tone: "primary" | "secondary";
}

/**
 * Wrapper props for rendering a single status-page action as either a button or link.
 */
interface StatusPageActionButtonProps {
  action: StatusPageAction;
}

/**
 * Copy and action data required to render the shared full-screen status surface.
 */
interface StatusPageProps {
  actions: StatusPageAction[];
  code: string;
  description: string;
  headline: string;
}

/**
 * Shared status surface used by the app-level 404 and 500 boundaries.
 * @param props - Status copy and action descriptors for the rendered state page.
 * @returns The shared status page surface.
 */
export function StatusPage(props: StatusPageProps) {
  return (
    <div
      className="
      relative flex min-h-screen items-center justify-center overflow-hidden
    "
    >
      <ParticlesBackground interactive={false} quantity={80} />
      <StatusPageTopBar />
      <StatusPageContent {...props} />
    </div>
  );
}

/**
 * Renders one action button or link inside the status page CTA row.
 * @param props - The action descriptor that controls tone and navigation behavior.
 * @returns The action link or button for the status page.
 */
function StatusPageActionButton(props: StatusPageActionButtonProps) {
  const { action } = props;

  const className =
    action.tone === "primary"
      ? `
        rounded-md border border-zinc-700 bg-zinc-800/80 px-6 py-2.5 text-sm
        font-medium text-zinc-200 transition-all duration-200
        hover:border-zinc-600 hover:bg-zinc-700
      `
      : `
        rounded-md border border-zinc-800 bg-zinc-900/60 px-6 py-2.5 text-sm
        font-medium text-zinc-400 transition-all duration-200
        hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-zinc-200
      `;

  if (action.href) {
    return (
      <Link className={className} href={action.href}>
        {action.label}
      </Link>
    );
  }

  return (
    <button className={className} onClick={action.onClick} type="button">
      {action.label}
    </button>
  );
}

/**
 * Renders the main centered content of the status page.
 * @param props - The status code, copy, and action descriptors for the current state.
 * @returns The animated status page content block.
 */
function StatusPageContent(props: StatusPageProps) {
  const { actions, code, description, headline } = props;

  return (
    <motion.div
      animate="visible"
      className="relative z-10 flex flex-col items-center px-4 text-center"
      initial="hidden"
      variants={fadeInUp}
    >
      <StatusPageGlow />

      <h1
        className="
          text-edge-outline bg-white bg-clip-text font-display
          text-[clamp(7rem,22vw,20rem)] leading-none text-transparent
        "
        style={{ letterSpacing: "-0.04em" }}
      >
        {code}
      </h1>

      <div
        className="
        mt-3 h-px w-40 bg-gradient-to-r from-transparent via-zinc-600
        to-transparent
      "
      />

      <p className="mt-6 text-base font-medium text-zinc-300">{headline}</p>
      <p className="mt-3 max-w-sm text-sm text-zinc-500">{description}</p>

      <div className="mt-8 flex items-center gap-3">
        {actions.map((action) => (
          <StatusPageActionButton action={action} key={action.label} />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Renders the blurred glow behind the status code.
 * @returns The background glow element for the status page.
 */
function StatusPageGlow() {
  return (
    <div
      aria-hidden
      className="
        pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2
        blur-[120px]
      "
    >
      <div className="mx-auto size-64 rounded-full bg-zinc-700/20" />
    </div>
  );
}

/**
 * Renders the top navigation bar shown on status pages.
 * @returns The animated top bar for the shared status page shell.
 */
function StatusPageTopBar() {
  return (
    <motion.div
      animate="visible"
      className="absolute left-0 right-0 top-0 z-20"
      initial="hidden"
      variants={fadeIn}
    >
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50
          to-transparent
        "
      />
      <div
        className="
        relative flex items-center px-4 py-3
        sm:px-6
      "
      >
        <Link
          className="
            font-mono text-xs text-zinc-600 transition-colors
            hover:text-zinc-300
          "
          href="/"
        >
          ← evanschoffstall.me
        </Link>
      </div>
    </motion.div>
  );
}
