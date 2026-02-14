import Particles from "../common/particles";

type Props = {
  quantity?: number;
};

export function ParticlesBackground({ quantity = 200 }: Props) {
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-gradient-to-tl from-black via-zinc-600/20 to-black" />
      <Particles className="fixed inset-0 -z-10 animate-fade-in" quantity={quantity} />
    </>
  );
}
