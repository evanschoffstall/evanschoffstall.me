import { useEffect, useRef, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const rafRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition({ x: event.clientX, y: event.clientY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return mousePosition;
}
