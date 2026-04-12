"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIsIntersecting<T extends Element>(
  options: Options = {},
) {
  const { root, rootMargin, threshold } = options;
  const ref = useRef<null | T>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => { setIsIntersecting(entry.isIntersecting); },
      { root, rootMargin, threshold },
    );

    observer.observe(ref.current);
    return () => { observer.disconnect(); };
  }, [root, rootMargin, threshold]);

  return { isIntersecting, ref };
}
