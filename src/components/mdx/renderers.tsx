import type { ElementType } from "react";

import { getMDXComponent } from "mdx-bundler/client";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/shared";

/** Native anchor props forwarded from compiled MDX links. */
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
/** Native blockquote props forwarded from compiled MDX content. */
type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;
/** Inline code element props forwarded from compiled MDX content. */
type CodeProps = React.HTMLAttributes<HTMLElement>;
/** Heading props forwarded from compiled MDX heading elements. */
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
/** Supported heading tags rendered by the MDX heading factory. */
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
/** Horizontal-rule props forwarded from compiled MDX divider elements. */
type HrProps = React.HTMLAttributes<HTMLHRElement>;
/** List item props forwarded from compiled MDX list content. */
type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;
/** Ordered and unordered list props forwarded from compiled MDX content. */
type ListProps = React.HTMLAttributes<HTMLOListElement | HTMLUListElement>;
/** Supported list tags rendered by the MDX list factory. */
type ListTag = "ol" | "ul";
/** Serialized MDX code string that should be hydrated with the shared renderer map. */
interface MdxProps {
  code: string;
}
/** Paragraph props forwarded from compiled MDX prose blocks. */
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
/** Preformatted code-block props forwarded from compiled MDX content. */
type PreProps = React.HTMLAttributes<HTMLPreElement>;
/** Table props forwarded from compiled MDX table nodes. */
type TableProps = React.HTMLAttributes<HTMLTableElement>;
/** Data-cell props forwarded from compiled MDX table nodes. */
type TdProps = React.TdHTMLAttributes<HTMLTableCellElement>;
/** Header-cell props forwarded from compiled MDX table nodes. */
type ThProps = React.ThHTMLAttributes<HTMLTableCellElement>;

/** Table-row props forwarded from compiled MDX table nodes. */
type TrProps = React.HTMLAttributes<HTMLTableRowElement>;

const Heading1 = createHeading(
  "h1",
  "mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
);
const Heading2 = createHeading(
  "h2",
  `
    mt-10 scroll-m-20 border-b border-b-zinc-800 pb-1 text-3xl font-semibold
    tracking-tight
    first:mt-0
  `,
);
const Heading3 = createHeading(
  "h3",
  "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
);
const Heading4 = createHeading(
  "h4",
  "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
);
const Heading5 = createHeading(
  "h5",
  "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
);
const Heading6 = createHeading(
  "h6",
  "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
);
const OrderedList = createList("ol", "my-6 ml-6 list-decimal");
const UnorderedList = createList("ul", "my-6 ml-6 list-disc");

/**
 * Renders compiled MDX content using the site's curated component overrides.
 * @param props - The compiled MDX module code.
 * @returns The rendered MDX content tree.
 */
export function Mdx(props: MdxProps) {
  const { code } = props;
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <div className="mdx">
      <Component components={mdxComponents} />
    </div>
  );
}

/** Curated MDX component overrides shared by compiled content pages. */
export const mdxComponents: Record<string, ElementType> = {
  a: renderAnchor,
  blockquote: renderBlockquote,
  code: renderCode,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  hr: renderHr,
  Image,
  img: renderImage,
  li: renderListItem,
  ol: OrderedList,
  p: renderParagraph,
  pre: renderPre,
  table: renderTable,
  td: renderTableCell,
  th: renderTableHeaderCell,
  tr: renderTableRow,
  ul: UnorderedList,
};

/**
 * Creates a heading renderer for one MDX heading level.
 * @param tag - The heading tag to render.
 * @param defaultClassName - The baseline prose classes for that heading level.
 * @returns A heading renderer suitable for the MDX component map.
 */
function createHeading(tag: HeadingTag, defaultClassName: string) {
  /**
   * Renders an MDX heading with the configured tag and baseline classes.
   * @param props - Heading props supplied by the compiled MDX content.
   * @returns The rendered heading element.
   */
  return function Heading(props: HeadingProps) {
    const { className, ...headingProps } = props;

    return React.createElement(tag, {
      className: cn(defaultClassName, className),
      ...headingProps,
    });
  };
}

/**
 * Creates an ordered or unordered list renderer for MDX prose content.
 * @param tag - The list tag to render.
 * @param defaultClassName - The baseline list classes for the tag.
 * @returns A list renderer suitable for the MDX component map.
 */
function createList(tag: ListTag, defaultClassName: string) {
  /**
   * Renders an MDX list with the configured tag and baseline classes.
   * @param props - List props supplied by the compiled MDX content.
   * @returns The rendered list element.
   */
  return function List(props: ListProps) {
    const { className, ...listProps } = props;

    return React.createElement(tag, {
      className: cn(defaultClassName, className),
      ...listProps,
    });
  };
}

/**
 * Renders MDX anchor elements with internal-link routing and safe external-link behavior.
 * @param props - Anchor props supplied by the compiled MDX content.
 * @returns The rendered anchor element.
 */
function renderAnchor(props: AnchorProps) {
  const { className, href, ...anchorProps } = props;
  const classes = cn(
    "font-medium text-zinc-900 underline underline-offset-4",
    className,
  );

  if (!href) {
    return <a className={classes} {...anchorProps} />;
  }

  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) {
    return <Link className={classes} href={href} {...anchorProps} />;
  }

  return (
    <a
      className={classes}
      href={href}
      rel={anchorProps.rel ?? "noopener noreferrer"}
      target={anchorProps.target ?? "_blank"}
      {...anchorProps}
    />
  );
}

/**
 * Renders MDX blockquotes with the site's prose styling.
 * @param props - Blockquote props supplied by the compiled MDX content.
 * @returns The rendered blockquote element.
 */
function renderBlockquote(props: BlockquoteProps) {
  const { className, ...blockquoteProps } = props;

  return (
    <blockquote
      className={cn(
        `
      mt-6 border-l-2 border-zinc-300 pl-6 italic text-zinc-800
      [&>*]:text-zinc-600
    `,
        className,
      )}
      {...blockquoteProps}
    />
  );
}

/**
 * Renders inline code elements inside MDX prose content.
 * @param props - Inline code props supplied by the compiled MDX content.
 * @returns The rendered inline code element.
 */
function renderCode(props: CodeProps) {
  const { className, ...codeProps } = props;

  return (
    <code
      className={cn(
        `
      relative rounded border bg-zinc-300 bg-opacity-25 px-[0.3rem] py-[0.2rem]
      font-mono text-sm text-zinc-600
    `,
        className,
      )}
      {...codeProps}
    />
  );
}

/**
 * Renders horizontal rules inside MDX content.
 * @param props - Horizontal-rule props supplied by the compiled MDX content.
 * @returns The rendered horizontal rule element.
 */
function renderHr(props: HrProps) {
  return (
    <hr
      className="
    my-4 border-zinc-200
    md:my-8
  "
      {...props}
    />
  );
}

/**
 * Renders standard image tags inside MDX content.
 * @param props - Image props supplied by the compiled MDX content.
 * @returns The rendered image element.
 */
function renderImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { alt, className, ...imageProps } = props;

  return (
    <img
      alt={alt}
      className={cn("rounded-md border border-zinc-200", className)}
      {...imageProps}
    />
  );
}

/**
 * Renders list items inside MDX prose content.
 * @param props - List-item props supplied by the compiled MDX content.
 * @returns The rendered list item.
 */
function renderListItem(props: ListItemProps) {
  const { className, ...listItemProps } = props;

  return <li className={cn("mt-2", className)} {...listItemProps} />;
}

/**
 * Renders paragraphs inside MDX prose content.
 * @param props - Paragraph props supplied by the compiled MDX content.
 * @returns The rendered paragraph element.
 */
function renderParagraph(props: ParagraphProps) {
  const { className, ...paragraphProps } = props;

  return (
    <p
      className={cn(
        `
     leading-7
     [&:not(:first-child)]:mt-6
   `,
        className,
      )}
      {...paragraphProps}
    />
  );
}

/**
 * Renders preformatted code blocks inside MDX prose content.
 * @param props - Preformatted block props supplied by the compiled MDX content.
 * @returns The rendered preformatted block.
 */
function renderPre(props: PreProps) {
  const { className, ...preProps } = props;

  return (
    <pre
      className={cn(
        "mb-4 mt-6 overflow-x-auto rounded-lg bg-zinc-900 py-4",
        className,
      )}
      {...preProps}
    />
  );
}

/**
 * Renders tables inside a horizontally scrollable MDX wrapper.
 * @param props - Table props supplied by the compiled MDX content.
 * @returns The rendered table wrapper and table.
 */
function renderTable(props: TableProps) {
  const { className, ...tableProps } = props;

  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...tableProps} />
    </div>
  );
}

/**
 * Renders table data cells inside MDX content.
 * @param props - Table cell props supplied by the compiled MDX content.
 * @returns The rendered data-cell element.
 */
function renderTableCell(props: TdProps) {
  const { className, ...cellProps } = props;

  return (
    <td
      className={cn(
        `
      border border-zinc-200 px-4 py-2 text-left
      [&[align=center]]:text-center
      [&[align=right]]:text-right
    `,
        className,
      )}
      {...cellProps}
    />
  );
}

/**
 * Renders table header cells inside MDX content.
 * @param props - Table header-cell props supplied by the compiled MDX content.
 * @returns The rendered header-cell element.
 */
function renderTableHeaderCell(props: ThProps) {
  const { className, ...headerCellProps } = props;

  return (
    <th
      className={cn(
        `
      border border-zinc-200 px-4 py-2 text-left font-bold
      [&[align=center]]:text-center
      [&[align=right]]:text-right
    `,
        className,
      )}
      {...headerCellProps}
    />
  );
}

/**
 * Renders table rows inside MDX content.
 * @param props - Table-row props supplied by the compiled MDX content.
 * @returns The rendered table row element.
 */
function renderTableRow(props: TrProps) {
  const { className, ...rowProps } = props;

  return (
    <tr
      className={cn(
        `
      m-0 border-t border-zinc-300 p-0
      even:bg-zinc-100
    `,
        className,
      )}
      {...rowProps}
    />
  );
}
