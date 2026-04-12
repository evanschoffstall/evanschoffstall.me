"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

import { cn } from "@/lib";

import { ScrollArea } from "./ScrollArea";

/** Variable-height item rendered inside the TanStack-backed scroll surface. */
interface VirtualScrollAreaItem {
  className?: string;
  estimateSize: number;
  key: string;
  node: React.ReactNode;
}

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
 */
export function VirtualScrollArea({
  className,
  items,
  overscan = 3,
  viewportRef,
  ...props
}: VirtualScrollAreaProps) {
  const internalViewportRef = React.useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: (index) => items[index].estimateSize,
    getScrollElement: () => internalViewportRef.current,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <ScrollArea
      {...props}
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

function assignRef<T>(
  ref: React.Ref<T> | undefined,
  value: T,
): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  ref.current = value;
}