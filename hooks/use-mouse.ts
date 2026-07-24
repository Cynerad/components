import { useLayoutEffect, useRef, useState } from "react";

type MouseState = {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  elementPositionX: number;
  elementPositionY: number;
};

function useMouse<T extends HTMLElement = HTMLElement>() {
  const [state, setState] = useState<MouseState>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    elementPositionX: 0,
    elementPositionY: 0,
  });

  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const next: Partial<MouseState> = {
        x: event.pageX,
        y: event.pageY,
      };

      if (ref.current) {
        const { left, top } = ref.current.getBoundingClientRect();
        const elementPositionX = left + window.scrollX;
        const elementPositionY = top + window.scrollY;

        next.elementX = event.pageX - elementPositionX;
        next.elementY = event.pageY - elementPositionY;
        next.elementPositionX = elementPositionX;
        next.elementPositionY = elementPositionY;
      }

      setState(prev => ({ ...prev, ...next }));
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return [state, ref] as const;
}

export default useMouse;
