import { useCallback, useRef, useState } from "react";

type Size = {
  width: number | null;
  height: number | null;
};

function useMeasure() {
  const [dimensions, setDimensions] = useState<Size>({
    width: null,
    height: null,
  });

  const observerRef = useRef<ResizeObserver | null>(null);

  const customRef = useCallback((node: Element | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node)
      return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry)
        return;

      const boxSize = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;

      const width = boxSize?.inlineSize ?? entry.contentRect.width;

      const height = boxSize?.blockSize ?? entry.contentRect.height;

      setDimensions({ width, height });
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return [customRef, dimensions] as const;
}

export default useMeasure;
