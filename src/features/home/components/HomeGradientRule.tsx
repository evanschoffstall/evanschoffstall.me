/** Thin horizontal gradient rule used as a section separator. */
export function HomeGradientRule() {
  return (
    <div
      aria-hidden
      className="
        h-px w-full bg-gradient-to-r from-transparent via-zinc-700/60
        to-transparent
      "
    />
  );
}