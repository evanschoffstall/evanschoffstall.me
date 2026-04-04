/**
 * Thin shadcn-style wrapper around @radix-ui/react-scroll-area.
 *
 * Replaces the native browser scrollbar with a styled overlay thumb.
 * Use as a drop-in for any scrollable region that needs custom scroll styling.
 */

import { cn } from "@/shared/lib/cn";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

type ScrollAreaProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
>;

/**
 * Fixed-height scroll container with a permanently visible styled scrollbar.
 * Uses type="always" so the custom track is rendered whether or not the user
 * is actively hovering — avoids the OS native scrollbar appearing instead.
 */
export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      {...props}
      type="always"
      className={cn("relative overflow-hidden", className)}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

type ScrollBarProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> & { orientation?: "vertical" | "horizontal" };

/** Styled scrollbar thumb rendered as a thin overlay track. */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2 rounded-full border-l border-l-transparent bg-zinc-900/60 p-px",
        orientation === "horizontal" &&
          "h-2 flex-col rounded-full border-t border-t-transparent bg-zinc-900/60 p-px",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-zinc-600/70 transition-colors hover:bg-zinc-500/80" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}
