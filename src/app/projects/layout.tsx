import { ANIMATION } from "@/lib";
import { ParticlesBackground } from "@/ui";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <ParticlesBackground
        interactive={false}
        quantity={Math.round(ANIMATION.DEFAULT_PARTICLE_QUANTITY * 0.48)}
      />
      {children}
    </div>
  );
}
