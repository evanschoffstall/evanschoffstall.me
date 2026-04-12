/** Public surface for project-domain selectors, validation, and view services. */
export {
  type ProjectExternalLinks,
  resolveProjectExternalLinks,
} from "@/features/projects/model/links";
export {
  groupAndSortProjects,
  pickFeaturedProjects,
} from "@/features/projects/model/selection";
export { extractSlugFromBody } from "@/features/projects/model/slug";
export {
  getProjectView,
  getProjectViews,
  incrementProjectView,
} from "@/features/projects/model/views";
