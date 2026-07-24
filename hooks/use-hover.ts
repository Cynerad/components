import { useCallback, useRef, useState } from "react";

export function useHover() {
  const [hovering, setHovering] = useState(false);
  const previousNodeRef = useRef<HTMLElement | null>(null);

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const customRef = useCallback(
    (node: HTMLElement | null) => {
      if (previousNodeRef.current?.nodeType === Node.ELEMENT_NODE) {
        previousNodeRef.current.removeEventListener("mouseenter", handleMouseEnter);
        previousNodeRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }

      if (node?.nodeType === Node.ELEMENT_NODE) {
        node.addEventListener("mouseenter", handleMouseEnter);
        node.addEventListener("mouseleave", handleMouseLeave);
      }

      previousNodeRef.current = node;
    },
    [handleMouseEnter, handleMouseLeave],
  );

  return [customRef, hovering];
}
