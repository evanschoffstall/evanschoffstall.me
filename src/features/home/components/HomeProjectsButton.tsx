import { ArrowRight, Layers } from "lucide-react";

/**
 * Callback used to switch the landing page from the overview to the projects panel.
 */
interface HomeProjectsButtonProps {
  onViewProjects?: () => void;
}

/**
 * Entry point from the home overview into the projects panel.
 * @param props - The button callback used to open the projects panel.
 * @returns The projects CTA button rendered beneath the overview cards.
 */
export function HomeProjectsButton(props: HomeProjectsButtonProps) {
  const { onViewProjects } = props;

  return (
    <button
      className="
        group flex w-full items-center justify-between rounded-lg border
        border-zinc-800/70 bg-zinc-900/30 px-3 py-2.5 text-left transition-all
        duration-200
        hover:border-zinc-700/80 hover:bg-zinc-800/40
      "
      onClick={onViewProjects}
      type="button"
    >
      <span
        className="
        flex items-center gap-2 text-xs text-zinc-500 transition-colors
        duration-200
        group-hover:text-zinc-300
      "
      >
        <Layers className="size-3.5 shrink-0" />
        See all projects
      </span>
      <ArrowRight
        className="
        size-3.5 shrink-0 text-zinc-700 transition-all duration-200
        group-hover:translate-x-0.5 group-hover:text-zinc-400
      "
      />
    </button>
  );
}
