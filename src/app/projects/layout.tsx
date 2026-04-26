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

  return <div className="relative">{children}</div>;
}
