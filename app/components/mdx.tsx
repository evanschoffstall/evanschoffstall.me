"use client";
import { cn } from "@/util/cn";
import { useMDXComponent } from "next-contentlayer/hooks";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement>;
type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;
type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;
type HrProps = React.HTMLAttributes<HTMLHRElement>;
type PreProps = React.HTMLAttributes<HTMLPreElement>;
type CodeProps = React.HTMLAttributes<HTMLElement>;
type TableProps = React.HTMLAttributes<HTMLTableElement>;
type TrProps = React.HTMLAttributes<HTMLTableRowElement>;
type ThProps = React.ThHTMLAttributes<HTMLTableCellElement>;
type TdProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const components: Record<string, React.ComponentType<any>> = {
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
				"mt-10 scroll-m-20 border-b border-b-zinc-800 pb-1 text-3xl font-semibold tracking-tight first:mt-0",
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
				<Link href={href} className={classes} {...props} />
			);
		}

		return (
			<a
				href={href}
				className={classes}
				rel={props.rel ?? "noreferrer"}
				target={props.target ?? "_blank"}
				{...props}
			/>
		);
	},
	p: ({ className, ...props }: ParagraphProps) => (
		<p
			className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
			{...props}
		/>
	),
	ul: ({ className, ...props }: ListProps) => (
		<ul className={cn("my-6 ml-6 list-disc", className)} {...props} />
	),
	ol: ({ className, ...props }: ListProps) => (
		<ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />
	),
	li: ({ className, ...props }: ListItemProps) => (
		<li className={cn("mt-2", className)} {...props} />
	),
	blockquote: ({ className, ...props }: BlockquoteProps) => (
		<blockquote
			className={cn(
				"mt-6 border-l-2 border-zinc-300 pl-6 italic text-zinc-800 [&>*]:text-zinc-600",
				className,
			)}
			{...props}
		/>
	),
	img: ({
		className,
		alt,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement>) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			className={cn("rounded-md border border-zinc-200", className)}
			alt={alt}
			{...props}
		/>
	),
	hr: ({ ...props }: HrProps) => (
		<hr className="my-4 border-zinc-200 md:my-8" {...props} />
	),
	table: ({ className, ...props }: TableProps) => (
		<div className="w-full my-6 overflow-y-auto">
			<table className={cn("w-full", className)} {...props} />
		</div>
	),
	tr: ({ className, ...props }: TrProps) => (
		<tr
			className={cn(
				"m-0 border-t border-zinc-300 p-0 even:bg-zinc-100",
				className,
			)}
			{...props}
		/>
	),
	th: ({ className, ...props }: ThProps) => (
		<th
			className={cn(
				"border border-zinc-200 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	td: ({ className, ...props }: TdProps) => (
		<td
			className={cn(
				"border border-zinc-200 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	pre: ({ className, ...props }: PreProps) => (
		<pre
			className={cn(
				"mt-6 mb-4 overflow-x-auto rounded-lg bg-zinc-900 py-4",
				className,
			)}
			{...props}
		/>
	),
	code: ({ className, ...props }: CodeProps) => (
		<code
			className={cn(
				"relative rounded border bg-zinc-300 bg-opacity-25 py-[0.2rem] px-[0.3rem] font-mono text-sm text-zinc-600",
				className,
			)}
			{...props}
		/>
	),
	Image,
};

interface MdxProps {
	code: string;
}

export function Mdx({ code }: MdxProps) {
	const Component = useMDXComponent(code);

	return (
		<div className="mdx">
			<Component components={components} />
		</div>
	);
}
