import { redirect } from "next/navigation";

/**
 * Redirects the dedicated projects route to the home-page projects section.
 */
export default function ProjectsPage() {
  redirect("/#projects");
}
