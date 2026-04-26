"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

import { cn } from "@/shared";

/** Base Radix ScrollArea props plus a viewport ref for virtualizer access. */
type ScrollAreaProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> & {
  viewportRef?: React.Ref<HTMLDivElement>;
};

/** Base Radix scrollbar props plus the axis used by the styled overlay thumb. */
type ScrollBarProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> & { orientation?: "horizontal" | "vertical" };

/** Variable-height item rendered inside the TanStack-backed scroll surface. */
interface VirtualScrollAreaItem {
  className?: string;
  estimateSize: number;
  key: string;
  node: React.ReactNode;
}

/**
 * ScrollArea props plus the virtualized item list and overscan settings used by TanStack.
 */
type VirtualScrollAreaProps = Omit<
  React.ComponentPropsWithoutRef<typeof ScrollArea>,
  "children"
> & {
  items: VirtualScrollAreaItem[];
  overscan?: number;
};

/**
 * Shared scroll surface that keeps the shadcn ScrollArea chrome while letting
 * TanStack own item measurement and render-windowing.
 * @param props - ScrollArea props plus the virtualized item list configuration.
 * @returns The virtualized scroll surface.
 */
export function VirtualScrollArea(props: VirtualScrollAreaProps) {
  const {
    className,
    items,
    overscan = 3,
    viewportRef,
    ...scrollAreaProps
  } = props;

  const internalViewportRef = React.useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    /**
     * Estimates the height for an item before it is measured.
     * @param index - The index of the item being estimated.
     * @returns The estimated item height.
     */
    estimateSize: (index) => items[index].estimateSize,
    /**
     * Returns the current scroll element managed by the virtualizer.
     * @returns The active viewport element, if mounted.
     */
    getScrollElement: () => internalViewportRef.current,
    /**
     * Measures a rendered item after layout.
     * @param element - The rendered element to measure.
     * @returns The element height in pixels.
     */
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <ScrollArea
      {...scrollAreaProps}
      className={className}
      viewportRef={(element) => {
        internalViewportRef.current = element;
        assignRef(viewportRef, element);
      }}
    >
      <div className="relative w-full" style={{ height: `${totalSize}px` }}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];

          return (
            <div
              className={cn("absolute left-0 top-0 w-full", item.className)}
              data-index={virtualItem.index}
              key={item.key}
              ref={(element) => {
                if (element) {
                  virtualizer.measureElement(element);
                }
              }}
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              {item.node}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/**
 * Assigns a value to either a callback ref or a mutable ref object.
 * @param ref - The ref to update.
 * @param value - The value to assign to the ref.
 */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  ref.current = value;
}

/**
 * Fixed-height scroll container with a permanently visible styled scrollbar.
 * @param props - ScrollArea props plus an optional forwarded viewport ref.
 * @returns The styled Radix ScrollArea wrapper.
 */
function ScrollArea(props: ScrollAreaProps) {
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
