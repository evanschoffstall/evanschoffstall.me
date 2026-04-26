import { ParticlesBackground } from "@/components";
import { ANIMATION } from "@/shared";

/**
 * Child routes rendered inside the shared projects-section background shell.
 */
interface ProjectsLayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps the projects routes with a shared particle background.
 * @param props - The projects route subtree to render inside the layout.
 * @returns The projects layout shell.
 */
export default function ProjectsLayout(props: ProjectsLayoutProps) {
  const { children } = props;

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
