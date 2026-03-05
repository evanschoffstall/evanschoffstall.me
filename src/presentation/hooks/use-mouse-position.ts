import { useCallback, useEffect, useRef, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Hook to track mouse position with requestAnimationFrame throttling.
 * Automatically cleans up listeners and animation frames on unmount.
 */
export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const rafRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (isMounted.current) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      isMounted.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  return mousePosition;
}
