import {
  homeStackItems,
  homeStackTierClassNames,
} from "@/features/home/content";
import { cn } from "@/shared";

/**
 * Core stack badge grid rendered in the lower home overview grid.
 * @returns The badge list for the technologies highlighted on the home page.
 */
export function HomeStackSection() {
  return (
    <div className="space-y-4">
      <p
        className="
        text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600
      "
      >
        Core Stack
      </p>
      <div className="flex flex-wrap gap-1.5">
        {homeStackItems.map(({ label, tier }) => (
          <span
            className={cn(
              `
                inline-flex items-center rounded-md px-2 py-0.5 text-[11px]
                font-medium ring-1 ring-inset
              `,
              homeStackTierClassNames[tier],
            )}
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
