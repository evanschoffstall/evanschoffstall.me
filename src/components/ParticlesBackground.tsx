import { Particles } from "@/components";

interface ParticlesBackgroundProps {
  interactive?: boolean;
  quantity?: number;
}

/**
 * Shared ambient particles backdrop used by top-level page layouts.
 * @param props - Particle interaction and density settings for the backdrop.
 * @returns The ambient background layers with particles.
 */
export function ParticlesBackground(props: ParticlesBackgroundProps) {
  const { interactive = true, quantity = 200 } = props;

  return (
    <>
      <div
        className="
        fixed inset-0 -z-20 bg-gradient-to-tl from-black via-zinc-600/20
        to-black
      "
      />
      <Particles
        className="fixed inset-0 -z-10 animate-fade-in"
        interactive={interactive}
        quantity={quantity}
      />
    </>
  );
}
