import { homeContextRows } from "@/features/home/content";

/** Compact experience summary rendered in the lower home overview grid. */
export function HomeContextSection() {
  return (
    <div className="space-y-4">
      <p className="
        text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600
      ">
        Context
      </p>
      <dl className="space-y-2.5">
        {homeContextRows.map(({ label, value }) => (
          <div className="grid grid-cols-[6rem_1fr] gap-x-3 text-sm" key={label}>
            <dt className="text-zinc-600">{label}</dt>
            <dd className="text-zinc-400">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}