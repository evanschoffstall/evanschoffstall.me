import Link from "next/link";
import * as React from "react";

import { cn } from "@/shared";

/**
 * Native anchor props forwarded from compiled MDX links.
 */
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
/**
 * Native blockquote props forwarded from compiled MDX content.
 */
type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;
/**
 * Inline code element props forwarded from compiled MDX content.
 */
type CodeProps = React.HTMLAttributes<HTMLElement>;
/**
 * List item props forwarded from compiled MDX list content.
 */
type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;
/**
 * Ordered and unordered list props forwarded from compiled MDX content.
 */
type ListProps = React.HTMLAttributes<HTMLOListElement | HTMLUListElement>;
/**
 * Paragraph props forwarded from compiled MDX prose blocks.
 */
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
/**
 * Preformatted code-block props forwarded from compiled MDX content.
 */
type PreProps = React.HTMLAttributes<HTMLPreElement>;

/**
 * Renders MDX anchor elements with internal-link routing and safe external-link behavior.
 * @param props - Anchor props supplied by the compiled MDX content.
 * @returns The rendered anchor element.
 */
export function renderAnchor(props: AnchorProps) {
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
export function renderBlockquote(props: BlockquoteProps) {
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
export function renderCode(props: CodeProps) {
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
 * Renders standard image tags inside MDX content.
 * @param props - Image props supplied by the compiled MDX content.
 * @returns The rendered image element.
 */
export function renderImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
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
export function renderListItem(props: ListItemProps) {
  const { className, ...listItemProps } = props;

  return <li className={cn("mt-2", className)} {...listItemProps} />;
}

/**
 * Renders ordered lists inside MDX prose content.
 * @param props - Ordered-list props supplied by the compiled MDX content.
 * @returns The rendered ordered list.
 */
export function renderOrderedList(props: ListProps) {
  const { className, ...listProps } = props;

  return (
    <ol className={cn("my-6 ml-6 list-decimal", className)} {...listProps} />
  );
}

/**
 * Renders paragraphs inside MDX prose content.
 * @param props - Paragraph props supplied by the compiled MDX content.
 * @returns The rendered paragraph element.
 */
export function renderParagraph(props: ParagraphProps) {
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
export function renderPre(props: PreProps) {
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
 * Renders unordered lists inside MDX prose content.
 * @param props - Unordered-list props supplied by the compiled MDX content.
 * @returns The rendered unordered list.
 */
export function renderUnorderedList(props: ListProps) {
  const { className, ...listProps } = props;

  return <ul className={cn("my-6 ml-6 list-disc", className)} {...listProps} />;
}
