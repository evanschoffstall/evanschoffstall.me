import * as React from "react";

import { cn } from "@/shared";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type HrProps = React.HTMLAttributes<HTMLHRElement>;

/**
 * Renders first-level headings inside MDX content.
 * @param props - Heading props supplied by the compiled MDX content.
 * @returns The rendered `h1` element.
 */
export function renderH1(props: HeadingProps) {
  const { className, ...headingProps } = props;

  return (
    <h1
      className={cn(
        "mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
        className,
      )}
      {...headingProps}
    />
  );
}

/**
 * Renders second-level headings inside MDX content.
 * @param props - Heading props supplied by the compiled MDX content.
 * @returns The rendered `h2` element.
 */
export function renderH2(props: HeadingProps) {
  const { className, ...headingProps } = props;

  return (
    <h2
      className={cn(
        `
      mt-10 scroll-m-20 border-b border-b-zinc-800 pb-1 text-3xl font-semibold
      tracking-tight
      first:mt-0
    `,
        className,
      )}
      {...headingProps}
    />
  );
}

/**
 * Renders third-level headings inside MDX content.
 * @param props - Heading props supplied by the compiled MDX content.
 * @returns The rendered `h3` element.
 */
export function renderH3(props: HeadingProps) {
  const { className, ...headingProps } = props;

  return (
    <h3
      className={cn(
        "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...headingProps}
    />
  );
}

/**
 * Renders fourth-level headings inside MDX content.
 * @param props - Heading props supplied by the compiled MDX content.
 * @returns The rendered `h4` element.
 */
export function renderH4(props: HeadingProps) {
  const { className, ...headingProps } = props;

  return (
    <h4
      className={cn(
        "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...headingProps}
    />
  );
}

/**
 * Renders fifth-level headings inside MDX content.
 * @param props - Heading props supplied by the compiled MDX content.
 * @returns The rendered `h5` element.
 */
export function renderH5(props: HeadingProps) {
  const { className, ...headingProps } = props;

  return (
    <h5
      className={cn(
        "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className,
      )}
      {...headingProps}
    />
  );
}

/**
 * Renders sixth-level headings inside MDX content.
 * @param props - Heading props supplied by the compiled MDX content.
 * @returns The rendered `h6` element.
 */
export function renderH6(props: HeadingProps) {
  const { className, ...headingProps } = props;

  return (
    <h6
      className={cn(
        "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
        className,
      )}
      {...headingProps}
    />
  );
}

/**
 * Renders horizontal rules inside MDX content.
 * @param props - Horizontal-rule props supplied by the compiled MDX content.
 * @returns The rendered horizontal rule element.
 */
export function renderHr(props: HrProps) {
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
