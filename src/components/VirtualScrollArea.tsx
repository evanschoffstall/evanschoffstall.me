"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

import { cn } from "@/shared";

import { ScrollArea } from "./ScrollArea";

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
