import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/**
 * Resolves the project slug from either a flat `[slug].mdx` file or a
 * folder-based `[slug]/content.mdx` layout.
 * @param {import('contentlayer/source-files').RawDocumentData} raw
 * @returns {string}
 */
function resolveSlug(raw) {
  const dir = raw.sourceFileDir;
  if (dir === "." || dir === "") {
    // Flat layout: springgate.mdx → "springgate"
    return raw.sourceFileName.replace(/\.mdx$/, "");
  }
  // Folder layout: springgate/content.mdx → "springgate"
  return dir.split("/").at(-1);
}

/** @type {import('contentlayer/source-files').ComputedFields} */
const projectComputedFields = {
  path: {
    resolve: (doc) => `/projects/${resolveSlug(doc._raw)}`,
    type: "string",
  },
  slug: {
    resolve: (doc) => resolveSlug(doc._raw),
    type: "string",
  },
};

export const Project = defineDocumentType(() => ({
  computedFields: projectComputedFields,
  contentType: "mdx",
  fields: {
    contributor: {
      type: "boolean",
    },
    date: {
      type: "date",
    },
    description: {
      required: true,
      type: "string",
    },
    legacy: {
      type: "boolean",
    },
    published: {
      type: "boolean",
    },
    repository: {
      type: "string",
    },
    title: {
      required: true,
      type: "string",
    },
    url: {
      type: "string",
    },
  },
  filePathPattern: "{*/content.mdx,*.mdx}",
  name: "Project",
}));

export default makeSource({
  contentDirPath: "./public/projects",
  documentTypes: [Project],
  mdx: {
    esbuildOptions: (options) => {
      // Ensure the generated MDX code is safe to execute during Next.js prerender/build.
      // Without this, mdx-bundler can emit React's dev runtime (jsxDEV) which can break
      // under production React/Next vendored runtimes.
      options.define = {
        ...(options.define ?? {}),
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV ?? "production",
        ),
      };
      options.jsxDev = false;
      return options;
    },
    mdxOptions: (opts) => {
      // Force non-dev output so MDX compiles to `jsx`/`jsxs` instead of `jsxDEV`.
      // This prevents React 19 + Next.js production builds from crashing during prerender.
      opts.development = false;
      return opts;
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          onVisitHighlightedLine(node) {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedWord(node) {
            node.properties.className = ["word--highlighted"];
          },
          onVisitLine(node) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          theme: "github-dark",
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            ariaLabel: "Link to section",
            className: ["subheading-anchor"],
          },
        },
      ],
    ],
    remarkPlugins: [remarkGfm],
  },
});
