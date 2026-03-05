"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useIsIntersecting<T extends Element>(
  root?: Element | null,
  rootMargin?: string,
  threshold?: number | number[],
) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { root, rootMargin, threshold },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);

  return { ref, isIntersecting };
}
