/**
 * Introductory profile copy shown on the left side of the home overview.
 * @returns The profile copy block for the home overview layout.
 */
export function HomeBioPanel() {
  return (
    <div className="space-y-3">
      <p
        className="
        text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600
      "
      >
        Technologist &middot; Engineer &middot; Business Officer
      </p>
      <p
        className="
        text-lg font-medium leading-7 text-zinc-200
        sm:text-xl sm:leading-8
        lg:text-2xl lg:leading-9
      "
      >
        I close the gap between engineering and outcome &mdash;{" "}
        <span className="text-zinc-400">
          writing code that ships, infrastructure that scales, and organizations
          that compound on both.
        </span>
      </p>
      <p className="text-sm leading-7 text-zinc-500">
        15+ years across public sector, enterprise, and startups. Currently
        involved in state-level procurement; previously led a winery from
        inception to multimillion-dollar annual revenue.
      </p>
    </div>
  );
}
