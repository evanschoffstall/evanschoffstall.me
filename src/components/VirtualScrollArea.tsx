"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

import { cn } from "@/shared";

const HASH_SCROLL_OFFSET_PX = 24;
const HASH_SCROLL_RETRY_DELAYS_MS = [0, 100, 500] as const;

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

/** Coordinates URL hash jumps with the custom scroll viewport. */
interface UseHashNavigationOptions {
  enabled: boolean;
  internalViewportRef: React.RefObject<HTMLDivElement | null>;
}

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
  enableHashNavigation?: boolean;
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
    enableHashNavigation = false,
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

  useHashNavigation({ enabled: enableHashNavigation, internalViewportRef });

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
 * Creates the delegated click handler that turns same-viewport hash anchors into smooth scrolls.
 * @param viewport - The viewport that owns hash-scrollable content.
 * @param scrollHashIntoView - Callback that performs the measured viewport scroll.
 * @returns A click handler bound to the current viewport.
 */
function createHashAnchorClickHandler(
  viewport: HTMLDivElement,
  scrollHashIntoView: (hash: string, behavior: ScrollBehavior) => void,
): (event: MouseEvent) => void {
  return (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const anchor = event.target.closest<HTMLAnchorElement>("a[href^='#']");
    const hash = anchor?.getAttribute("href");

    if (!anchor || !hash || hash === "#") {
      return;
    }

    const target = getHashTarget(viewport, hash);
    if (!target) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", hash);
    scrollHashIntoView(hash, "smooth");
  };
}

/**
 * Decodes a URL hash into the target id value used in the document.
 * @param hash - The raw URL hash, including the leading `#`.
 * @returns The decoded id, or null for an empty or invalid hash.
 */
function decodeHash(hash: string): null | string {
  if (!hash.startsWith("#") || hash.length === 1) {
    return null;
  }

  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

/**
 * Resolves a hash fragment to an element inside the custom viewport.
 * @param viewport - The scroll viewport that owns the rendered content.
 * @param hash - The URL hash fragment to resolve.
 * @returns The matching id or name target, when it exists inside the viewport.
 */
function getHashTarget(
  viewport: HTMLDivElement | null,
  hash: string,
): HTMLElement | null {
  const targetId = decodeHash(hash);
  if (!viewport || !targetId) {
    return null;
  }

  const idTarget = document.getElementById(targetId);
  if (idTarget instanceof HTMLElement && viewport.contains(idTarget)) {
    return idTarget;
  }

  const namedTargets = viewport.querySelectorAll<HTMLElement>("[name]");
  for (const namedTarget of namedTargets) {
    if (namedTarget.getAttribute("name") === targetId) {
      return namedTarget;
    }
  }

  return null;
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

/**
 * Retries the current URL hash while virtualized content and browser layout settle.
 * @param scrollHashIntoView - Callback that performs the measured viewport scroll.
 */
function scrollCurrentHashWithRetries(
  scrollHashIntoView: (hash: string, behavior: ScrollBehavior) => void,
): void {
  for (const delay of HASH_SCROLL_RETRY_DELAYS_MS) {
    window.setTimeout(() => {
      scrollHashIntoView(window.location.hash, "auto");
    }, delay);
  }
}

/**
 * Handles fragment navigation inside the virtualized Radix viewport.
 * @param options - The viewport ref and feature flag controlling hash navigation.
 */
function useHashNavigation(options: UseHashNavigationOptions): void {
  const { enabled, internalViewportRef } = options;

  const scrollHashIntoView = React.useCallback(
    (hash: string, behavior: ScrollBehavior) => {
      const viewport = internalViewportRef.current;
      const target = getHashTarget(viewport, hash);

      if (!viewport || !target) {
        return;
      }

      window.requestAnimationFrame(() => {
        const targetRect = target.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const top =
          viewport.scrollTop +
          targetRect.top -
          viewportRect.top -
          HASH_SCROLL_OFFSET_PX;

        viewport.scrollTo({ behavior, top: Math.max(0, top) });
      });
    },
    [internalViewportRef],
  );

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    /** Replays hash scrolling after the viewport mounts and whenever the hash changes. */
    const scrollCurrentHash = (): void => {
      scrollCurrentHashWithRetries(scrollHashIntoView);
    };

    scrollCurrentHash();
    window.addEventListener("hashchange", scrollCurrentHash);

    return () => {
      window.removeEventListener("hashchange", scrollCurrentHash);
    };
  }, [enabled, scrollHashIntoView]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const viewport = internalViewportRef.current;
    if (!viewport) {
      return;
    }

    const handleClick = createHashAnchorClickHandler(
      viewport,
      scrollHashIntoView,
    );

    viewport.addEventListener("click", handleClick);

    return () => {
      viewport.removeEventListener("click", handleClick);
    };
  }, [enabled, internalViewportRef, scrollHashIntoView]);
}
