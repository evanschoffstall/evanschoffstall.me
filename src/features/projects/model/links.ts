import {
  isSafeExternalUrl,
  normalizeExternalHref,
  normalizeRepoHref,
} from "@/lib";

/** Safe, normalized external links derived from project content fields. */
export interface ProjectExternalLinks {
  liveHref: string;
  repositoryHref: string;
}

/** Minimal project link shape accepted by the shared project link resolver. */
interface ProjectLinkSource {
  repository?: string;
  url?: string;
}

/**
 * Normalizes project URLs and drops any value that fails the external URL
 * safety guard so consuming surfaces can render links without repeating checks.
 */
export function resolveProjectExternalLinks(
  project: ProjectLinkSource,
): ProjectExternalLinks {
  const repositoryHref = toSafeRepositoryHref(project.repository);
  const liveHref = toSafeExternalHref(project.url);

  return {
    liveHref,
    repositoryHref,
  };
}

/** Rejects blocked schemes before normalization so invalid content stays inert. */
function hasBlockedScheme(value: string): boolean {
  return /^(?:javascript|data|vbscript|file):/i.test(value.trim());
}

/** Normalizes a project live URL only when the raw input is allowed. */
function toSafeExternalHref(url?: string): string {
  if (!url || hasBlockedScheme(url)) {
    return "";
  }

  const normalizedUrl = normalizeExternalHref(url);
  return isSafeExternalUrl(normalizedUrl) ? normalizedUrl : "";
}

/** Normalizes a repository reference only when the raw input is allowed. */
function toSafeRepositoryHref(repository?: string): string {
  if (!repository || hasBlockedScheme(repository)) {
    return "";
  }

  const repositoryHref = normalizeRepoHref(repository);

  return isSafeExternalUrl(repositoryHref) ? repositoryHref : "";
}