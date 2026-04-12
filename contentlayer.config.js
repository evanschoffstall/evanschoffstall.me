import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields = {
  path: {
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
    type: "string",
  },
  slug: {
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
    type: "string",
  },
};

export const Project = defineDocumentType(() => ({
  computedFields,
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

  filePathPattern: "./projects/**/*.mdx",
  name: "Project",
}));

export const Page = defineDocumentType(() => ({
  computedFields,
  contentType: "mdx",
  fields: {
    description: {
      type: "string",
    },
    title: {
      required: true,
      type: "string",
    },
  },
  filePathPattern: "pages/**/*.mdx",
  name: "Page",
}));

export default makeSource({
  contentDirPath: "./src/content",
  documentTypes: [Page, Project],
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
