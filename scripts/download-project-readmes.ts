import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

/**
 * Minimal project frontmatter needed to find the matching repository and write
 * its rendered README into the public assets tree.
 */
interface ProjectMeta {
  repository?: string;
  slug: string;
}

const PROJECTS_DIR = join(process.cwd(), "public", "projects");
const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * Downloads a repository asset from the GitHub raw content endpoint.
 * @param repository - The GitHub owner and repository name.
 * @param assetPath - The repository-relative asset path to fetch.
 * @returns The asset bytes when the asset exists, or null when GitHub returns 404.
 */
async function downloadRepoAsset(
  repository: string,
  assetPath: string,
): Promise<null | Uint8Array> {
  const url = `https://raw.githubusercontent.com/${repository}/HEAD/${assetPath}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "evanschoffstall.me-readme-sync",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch repo asset ${assetPath} for ${repository}: ${String(response.status)}`,
    );
  }

  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Extracts repository asset references that already live under a public directory.
 * @param renderedHtml - The rendered README HTML to scan.
 * @returns The unique public asset paths referenced by the rendered HTML.
 */
function extractRepoPublicAssetPaths(renderedHtml: string): string[] {
  const pattern = /(?:src|href)="(public\/[^"]+)"/g;
  const paths = new Set<string>();
  let match: null | RegExpExecArray = pattern.exec(renderedHtml);

  while (match) {
    const value = match[1];
    if (!value) {
      match = pattern.exec(renderedHtml);
      continue;
    }

    paths.add(value.replace(/^\/+/, ""));
    match = pattern.exec(renderedHtml);
  }

  return Array.from(paths);
}

/**
 * Match bare root-level relative asset paths like logo.svg (no slashes, no protocol).
 * @param renderedHtml - The rendered README HTML to scan.
 * @returns The unique root-level asset paths referenced by the rendered HTML.
 */
function extractRepoRootAssetPaths(renderedHtml: string): string[] {
  const pattern =
    /(?:src|href)="([^/"#:?][^"/]*\.(?:svg|png|jpg|jpeg|gif|webp|ico))"/gi;
  const paths = new Set<string>();
  let match: null | RegExpExecArray = pattern.exec(renderedHtml);

  while (match) {
    const value = match[1];
    if (value && !value.startsWith("public/")) {
      paths.add(value);
    }
    match = pattern.exec(renderedHtml);
  }

  return Array.from(paths);
}

/**
 * Fetch raw README markdown from GitHub.
 * @param repository - The GitHub owner and repository name.
 * @returns The raw README markdown, or null when the repository has no README.
 */
async function fetchRawReadme(repository: string): Promise<null | string> {
  const url = `https://api.github.com/repos/${repository}/readme`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      "User-Agent": "evanschoffstall.me-readme-sync",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch README for ${repository}: ${String(response.status)}`,
    );
  }

  return response.text();
}

/**
 * Reads project metadata from the MDX content directory.
 * @returns The project slugs and optional repository names declared in content.
 */
async function getProjects(): Promise<ProjectMeta[]> {
  const fileNames = await readdir(PROJECTS_DIR, { recursive: true });
  const projectFiles = fileNames.filter(
    (fileName) =>
      typeof fileName === "string" &&
      (fileName === "content.mdx" ||
        fileName.endsWith("/content.mdx") ||
        /^[^/]+\.mdx$/.test(fileName)),
  );

  const projects = await Promise.all(
    projectFiles.map(async (fileName) => {
      const filePath = join(PROJECTS_DIR, fileName);
      const source = await readFile(filePath, "utf-8");

      return {
        repository: getRepositoryFromFrontmatter(source),
        slug: getSlugFromPath(fileName),
      } satisfies ProjectMeta;
    }),
  );

  return projects;
}

/**
 * Reads the GitHub repository field from a project frontmatter document.
 * @param source - The raw MDX source text.
 * @returns The normalized repository string when present.
 */
function getRepositoryFromFrontmatter(source: string): string | undefined {
  const match = /^repository:\s*([^\n]+)$/m.exec(source);
  const repository = match?.[1]?.trim();

  if (!repository) {
    return undefined;
  }

  return repository.replace(/^['"]|['"]$/g, "");
}

/**
 * Derives a project slug from its MDX file path.
 * @param filePath - The project content file path.
 * @returns The slug derived from the file name.
 */
function getSlugFromPath(filePath: string): string {
  // Flat layout: springgate.mdx
  const flatMatch = /^([^/]+)\.mdx$/.exec(filePath);
  if (flatMatch) {
    return flatMatch[1]!;
  }
  // Folder layout: springgate/content.mdx
  return basename(dirname(filePath));
}

/**
 * Downloads, renders, rewrites, and saves the README HTML for each configured project.
 * @returns A promise that resolves after the README sync completes.
 */
async function main() {
  const projects = await getProjects();

  let downloadedCount = 0;

  for (const project of projects) {
    if (!project.repository) {
      continue;
    }

    const raw = await fetchRawReadme(project.repository);
    if (!raw) {
      continue;
    }

    const html = await renderViaGitHub(raw, project.repository);

    const repoRootAssets = extractRepoRootAssetPaths(html);
    const repoPublicAssets = extractRepoPublicAssetPaths(html);
    const allAssets = [...repoRootAssets, ...repoPublicAssets];

    for (const assetPath of allAssets) {
      const asset = await downloadRepoAsset(project.repository, assetPath);

      if (!asset) {
        console.warn(
          `Skipped missing repo asset for ${project.slug}: ${assetPath}`,
        );
        continue;
      }

      const outputAssetPath = assetPath.replace(/^public\//, "");

      await saveAssetForSlug(project.slug, outputAssetPath, asset);
      console.log(`Saved projects/${project.slug}/${outputAssetPath}`);
    }

    const rewrittenHtml = rewriteRepoRootAssetUrls(
      rewriteRepoPublicAssetUrls(html, project.slug),
      project.slug,
      repoRootAssets,
    );

    const outputPath = join(
      PUBLIC_DIR,
      "projects",
      project.slug,
      "content.html",
    );
    await mkdir(join(outputPath, ".."), { recursive: true });
    await writeFile(outputPath, rewrittenHtml, "utf-8");
    downloadedCount += 1;
    console.log(`Saved projects/${project.slug}/content.html`);
  }

  console.log(`Downloaded and rendered ${downloadedCount} README file(s).`);
}

/**
 * Render markdown through GitHub's own markdown API so the saved HTML is
 * byte-for-byte identical to what github.com would show.
 * @param markdown - The raw README markdown to render.
 * @param repository - The GitHub owner and repository name used as render context.
 * @returns The rendered HTML returned by GitHub's markdown API.
 */
async function renderViaGitHub(
  markdown: string,
  repository: string,
): Promise<string> {
  const response = await fetch("https://api.github.com/markdown", {
    body: JSON.stringify({
      context: repository,
      mode: "gfm",
      text: markdown,
    }),
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "evanschoffstall.me-readme-sync",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `GitHub markdown render failed for ${repository}: ${String(response.status)}`,
    );
  }

  return response.text();
}

/**
 * Rewrites public asset URLs so they point at the mirrored project asset path.
 * @param renderedHtml - The rendered README HTML to rewrite.
 * @param slug - The project slug that owns the mirrored assets.
 * @returns The HTML with rewritten public asset URLs.
 */
function rewriteRepoPublicAssetUrls(
  renderedHtml: string,
  slug: string,
): string {
  return renderedHtml.replace(
    /((?:src|href)=")public\/([^"]+)"/g,
    `$1/projects/${slug}/$2"`,
  );
}

/**
 * Rewrites root-level asset URLs so they point at the mirrored project asset path.
 * @param renderedHtml - The rendered README HTML to rewrite.
 * @param slug - The project slug that owns the mirrored assets.
 * @param rootPaths - The root-level asset paths discovered in the HTML.
 * @returns The HTML with rewritten root-level asset URLs.
 */
function rewriteRepoRootAssetUrls(
  renderedHtml: string,
  slug: string,
  rootPaths: string[],
): string {
  let result = renderedHtml;
  for (const assetPath of rootPaths) {
    const escaped = assetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`((?:src|href)=")${escaped}"`, "g"),
      `$1/projects/${slug}/${assetPath}"`,
    );
  }
  return result;
}

/**
 * Saves a mirrored repository asset under the public project asset directory.
 * @param slug - The project slug that owns the asset.
 * @param assetPath - The repository-relative asset path.
 * @param content - The asset bytes to write.
 */
async function saveAssetForSlug(
  slug: string,
  assetPath: string,
  content: Uint8Array,
): Promise<void> {
  const outputPath = join(PUBLIC_DIR, "projects", slug, assetPath);
  await mkdir(join(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, content);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
