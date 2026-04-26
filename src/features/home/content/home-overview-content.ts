/** Display-ready stack badge definition for the home overview. */
interface HomeStackItem {
  label: string;
  tier: HomeStackTier;
}

/** Semantic group used to style core-stack items consistently. */
type HomeStackTier = "data" | "infra" | "lang" | "web";

/** Fixed context rows shown in the home overview profile summary. */
export const homeContextRows = [
  { label: "Experience", value: "15+ yrs · gov, enterprise, startup" },
  { label: "Current", value: "State-level procurement" },
  { label: "Past", value: "Winery: zero → multimillion revenue" },
  { label: "Style", value: "IC through executive; hands-on throughout" },
] as const;

/** Core stack badges rendered in the home overview. */
export const homeStackItems: HomeStackItem[] = [
  { label: "TypeScript", tier: "lang" },
  { label: "Rust", tier: "lang" },
  { label: "Python", tier: "lang" },
  { label: "C#", tier: "lang" },
  { label: "React", tier: "web" },
  { label: "Next.js", tier: "web" },
  { label: "Node.js", tier: "web" },
  { label: ".NET", tier: "web" },
  { label: "Docker", tier: "infra" },
  { label: "Neon", tier: "infra" },
  { label: "Oracle", tier: "infra" },
  { label: "PostgreSQL", tier: "data" },
  { label: "Redis", tier: "data" },
];

/** Tier-specific badge classes for the core stack row. */
export const homeStackTierClassNames: Record<HomeStackTier, string> = {
  data: "bg-emerald-950/50 text-emerald-300 ring-emerald-700/40",
  infra: "bg-sky-950/50 text-sky-300 ring-sky-700/40",
  lang: "bg-violet-950/50 text-violet-300 ring-violet-700/40",
  web: "bg-blue-950/50 text-blue-300 ring-blue-700/40",
};
