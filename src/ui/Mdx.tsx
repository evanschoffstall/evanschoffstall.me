"use client";

import { getMDXComponent } from "mdx-bundler/client";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;
type CodeProps = React.HTMLAttributes<HTMLElement>;
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type HrProps = React.HTMLAttributes<HTMLHRElement>;
type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;
type ListProps = React.HTMLAttributes<HTMLOListElement | HTMLUListElement>;
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type PreProps = React.HTMLAttributes<HTMLPreElement>;
type TableProps = React.HTMLAttributes<HTMLTableElement>;
type TdProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type ThProps = React.ThHTMLAttributes<HTMLTableCellElement>;
type TrProps = React.HTMLAttributes<HTMLTableRowElement>;

const components: Record<string, React.ElementType> = {
	a: ({ className, href, ...props }: AnchorProps) => {
		const classes = cn(
			"font-medium text-zinc-900 underline underline-offset-4",
			className,
		);

		if (!href) {
			return <a className={classes} {...props} />;
		}

		const isInternal = href.startsWith("/") || href.startsWith("#");
		if (isInternal) {
			return (
				<Link className={classes} href={href} {...props} />
			);
		}

		return (
			<a
				className={classes}
				href={href}
				rel={props.rel ?? "noopener noreferrer"}
				target={props.target ?? "_blank"}
				{...props}
			/>
		);
	},
	blockquote: ({ className, ...props }: BlockquoteProps) => (
		<blockquote
			className={cn(
				`
      mt-6 border-l-2 border-zinc-300 pl-6 italic text-zinc-800
      [&>*]:text-zinc-600
    `,
				className,
			)}
			{...props}
		/>
	),
	code: ({ className, ...props }: CodeProps) => (
		<code
			className={cn(
				`
      relative rounded border bg-zinc-300 bg-opacity-25 px-[0.3rem] py-[0.2rem]
      font-mono text-sm text-zinc-600
    `,
				className,
			)}
			{...props}
		/>
	),
	h1: ({ className, ...props }: HeadingProps) => (
		<h1
			className={cn(
				"mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h2: ({ className, ...props }: HeadingProps) => (
		<h2
			className={cn(
				`
      mt-10 scroll-m-20 border-b border-b-zinc-800 pb-1 text-3xl font-semibold
      tracking-tight
      first:mt-0
    `,
				className,
			)}
			{...props}
		/>
	),
	h3: ({ className, ...props }: HeadingProps) => (
		<h3
			className={cn(
				"mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h4: ({ className, ...props }: HeadingProps) => (
		<h4
			className={cn(
				"mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h5: ({ className, ...props }: HeadingProps) => (
		<h5
			className={cn(
				"mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h6: ({ className, ...props }: HeadingProps) => (
		<h6
			className={cn(
				"mt-8 scroll-m-20 text-base font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	hr: ({ ...props }: HrProps) => (
		<hr className="
    my-4 border-zinc-200
    md:my-8
  " {...props} />
	),
	Image,
	img: ({
		alt,
		className,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement>) => (
		<img
			alt={alt}
			className={cn("rounded-md border border-zinc-200", className)}
			{...props}
		/>
	),
	li: ({ className, ...props }: ListItemProps) => (
		<li className={cn("mt-2", className)} {...props} />
	),
	ol: ({ className, ...props }: ListProps) => (
		<ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
	),
	p: ({ className, ...props }: ParagraphProps) => (
		<p
			className={cn(`
     leading-7
     [&:not(:first-child)]:mt-6
   `, className)}
			{...props}
		/>
	),
	pre: ({ className, ...props }: PreProps) => (
		<pre
			className={cn(
				"mb-4 mt-6 overflow-x-auto rounded-lg bg-zinc-900 py-4",
				className,
			)}
			{...props}
		/>
	),
	table: ({ className, ...props }: TableProps) => (
		<div className="my-6 w-full overflow-y-auto">
			<table className={cn("w-full", className)} {...props} />
		</div>
	),
	td: ({ className, ...props }: TdProps) => (
		<td
			className={cn(
				`
      border border-zinc-200 px-4 py-2 text-left
      [&[align=center]]:text-center
      [&[align=right]]:text-right
    `,
				className,
			)}
			{...props}
		/>
	),
	th: ({ className, ...props }: ThProps) => (
		<th
			className={cn(
				`
      border border-zinc-200 px-4 py-2 text-left font-bold
      [&[align=center]]:text-center
      [&[align=right]]:text-right
    `,
				className,
			)}
			{...props}
		/>
	),
	tr: ({ className, ...props }: TrProps) => (
		<tr
			className={cn(
				`
      m-0 border-t border-zinc-300 p-0
      even:bg-zinc-100
    `,
				className,
			)}
			{...props}
		/>
	),
	ul: ({ className, ...props }: ListProps) => (
		<ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
	),
};

interface MdxProps {
	code: string;
}

export function Mdx({ code }: MdxProps) {
	const Component = React.useMemo(() => getMDXComponent(code), [code]);

	return (
		<div className="mdx">
			<Component components={components} />
		</div>
	);
}
