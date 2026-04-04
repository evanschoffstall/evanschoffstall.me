import { ParticlesBackground } from "@/presentation/home/particles-background";
import { ANIMATION } from "@/shared/constants";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <ParticlesBackground quantity={ANIMATION.DEFAULT_PARTICLE_QUANTITY} />
      {children}
    </div>
  );
}
