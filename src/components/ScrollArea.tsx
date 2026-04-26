/**
 * Thin shadcn-style wrapper around \@radix-ui/react-scroll-area.
 *
 * Replaces the native browser scrollbar with a styled overlay thumb.
 * Use as a drop-in for any scrollable region that needs custom scroll styling.
 */

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/shared";

/**
 * Base Radix ScrollArea props plus an optional forwarded viewport ref for scroll-state access.
 */
type ScrollAreaProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> & {
  /**
   * Optional ref forwarded to the inner Radix ScrollArea Viewport element.
   * Use this when you need to programmatically read or set `scrollTop` on the
   * scroll container (e.g. For save/restore of scroll position).
   */
  viewportRef?: React.Ref<HTMLDivElement>;
};

/**
 * Base Radix scrollbar props plus the axis used by the styled overlay thumb.
 */
type ScrollBarProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> & { orientation?: "horizontal" | "vertical" };

/**
 * Fixed-height scroll container with a permanently visible styled scrollbar.
 * Uses type="always" so the custom track is rendered whether or not the user
 * is actively hovering — avoids the OS native scrollbar appearing instead.
 * @param props - ScrollArea props plus an optional forwarded viewport ref.
 * @returns The styled Radix ScrollArea wrapper.
 */
export function ScrollArea(props: ScrollAreaProps) {
  const { children, className, viewportRef, ...rootProps } = props;

  return (
    <ScrollAreaPrimitive.Root
      {...rootProps}
      className={cn("relative overflow-hidden", className)}
      type="always"
    >
      <ScrollAreaPrimitive.Viewport
        className="size-full rounded-[inherit]"
        ref={viewportRef}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * Styled scrollbar thumb rendered as a thin overlay track.
 * @param props - Scrollbar props and the preferred axis orientation.
 * @returns The styled Radix scrollbar component.
 */
function ScrollBar(props: ScrollBarProps) {
  const { className, orientation = "vertical", ...scrollbarProps } = props;

  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          `
            h-full w-2 rounded-full border-l border-l-transparent bg-zinc-900/60
            p-px
          `,
        orientation === "horizontal" &&
          `
            h-2 flex-col rounded-full border-t border-t-transparent
            bg-zinc-900/60 p-px
          `,
        className,
      )}
      orientation={orientation}
      {...scrollbarProps}
    >
      <ScrollAreaPrimitive.Thumb
        className="
        relative flex-1 rounded-full bg-zinc-600/70 transition-colors
        hover:bg-zinc-500/80
      "
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}
