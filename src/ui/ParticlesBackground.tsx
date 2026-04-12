import { Particles } from "@/ui";

interface ParticlesBackgroundProps {
  interactive?: boolean;
  quantity?: number;
}

/** Shared ambient particles backdrop used by top-level page layouts. */
export function ParticlesBackground({
  interactive = true,
  quantity = 200,
}: ParticlesBackgroundProps) {
  return (
    <>
      <div className="
        fixed inset-0 -z-20 bg-gradient-to-tl from-black via-zinc-600/20
        to-black
      " />
      <Particles
        className="fixed inset-0 -z-10 animate-fade-in"
        interactive={interactive}
        quantity={quantity}
      />
    </>
  );
}