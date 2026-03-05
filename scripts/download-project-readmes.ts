import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

type ProjectMeta = {
  slug: string;
  repository?: string;
};

const PROJECTS_DIR = join(process.cwd(), "content", "projects");
const README_DIR = join(process.cwd(), "public", "readmes");
const PUBLIC_DIR = join(process.cwd(), "public");

function getSlugFromPath(filePath: string): string {
  return basename(filePath, ".mdx");
}

function getRepositoryFromFrontmatter(source: string): string | undefined {
  const match = source.match(/^repository:\s*([^\n]+)$/m);
  const repository = match?.[1]?.trim();

  if (!repository) {
    return undefined;
  }

  return repository.replace(/^['"]|['"]$/g, "");
}

async function getProjects(): Promise<ProjectMeta[]> {
  const fileNames = await readdir(PROJECTS_DIR);
  const projectFiles = fileNames.filter((fileName) =>
    fileName.endsWith(".mdx"),
  );

  const projects = await Promise.all(
    projectFiles.map(async (fileName) => {
      const filePath = join(PROJECTS_DIR, fileName);
      const source = await readFile(filePath, "utf-8");

      return {
        slug: getSlugFromPath(fileName),
        repository: getRepositoryFromFrontmatter(source),
      } satisfies ProjectMeta;
    }),
  );

  return projects;
}

/** Fetch raw README markdown from GitHub. */
async function fetchRawReadme(repository: string): Promise<string | null> {
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
      `Failed to fetch README for ${repository}: ${response.status}`,
    );
  }

  return response.text();
}

/**
 * Render markdown through GitHub's own markdown API so the saved HTML is
 * byte-for-byte identical to what github.com would show.
 */
async function renderViaGitHub(
  markdown: string,
  repository: string,
): Promise<string> {
  const response = await fetch("https://api.github.com/markdown", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "evanschoffstall.me-readme-sync",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      text: markdown,
      mode: "gfm",
      context: repository,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub markdown render failed for ${repository}: ${response.status}`,
    );
  }

  return response.text();
}

/** Match bare root-level relative asset paths like logo.svg (no slashes, no protocol). */
function extractRepoRootAssetPaths(renderedHtml: string): string[] {
  const pattern =
    /(?:src|href)="([^/"#:?][^"/]*\.(?:svg|png|jpg|jpeg|gif|webp|ico))"/gi;
  const paths = new Set<string>();
  let match: RegExpExecArray | null = pattern.exec(renderedHtml);

  while (match) {
    const value = match[1];
    if (value && !value.startsWith("public/")) {
      paths.add(value);
    }
    match = pattern.exec(renderedHtml);
  }

  return Array.from(paths);
}

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

function extractRepoPublicAssetPaths(renderedHtml: string): string[] {
  const pattern = /(?:src|href)="(public\/[^"]+)"/g;
  const paths = new Set<string>();
  let match: RegExpExecArray | null = pattern.exec(renderedHtml);

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

function rewriteRepoPublicAssetUrls(
  renderedHtml: string,
  slug: string,
): string {
  return renderedHtml.replace(
    /((?:src|href)=")public\/([^"]+)"/g,
    `$1/projects/${slug}/public/$2"`,
  );
}

async function downloadRepoAsset(
  repository: string,
  assetPath: string,
): Promise<Uint8Array | null> {
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
      `Failed to fetch repo asset ${assetPath} for ${repository}: ${response.status}`,
    );
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function saveAssetForSlug(
  slug: string,
  assetPath: string,
  content: Uint8Array,
): Promise<void> {
  const outputPath = join(PUBLIC_DIR, "projects", slug, assetPath);
  await mkdir(join(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, content);
}

async function main() {
  const projects = await getProjects();

  await rm(README_DIR, { recursive: true, force: true });
  await mkdir(README_DIR, { recursive: true });

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

      await saveAssetForSlug(project.slug, assetPath, asset);
      console.log(`Saved projects/${project.slug}/${assetPath}`);
    }

    const rewrittenHtml = rewriteRepoRootAssetUrls(
      rewriteRepoPublicAssetUrls(html, project.slug),
      project.slug,
      repoRootAssets,
    );

    const outputPath = join(README_DIR, `${project.slug}.html`);
    await writeFile(outputPath, rewrittenHtml, "utf-8");
    downloadedCount += 1;
    console.log(`Saved ${project.slug}.html`);
  }

  console.log(`Downloaded and rendered ${downloadedCount} README file(s).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
