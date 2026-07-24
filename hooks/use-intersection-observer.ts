import { useCallback, useRef, useState } from "react";

function useIntersectionObserver<T extends Element>(options: IntersectionObserverInit) {
  const { threshold = 1, root = null, rootMargin = "0px" } = options;
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const previousObserverRef = useRef<IntersectionObserver | null>(null);

  const customRef = useCallback(
    (node: T | null) => {
      if (previousObserverRef.current) {
        previousObserverRef.current.disconnect();
        previousObserverRef.current = null;
      }

      if (node?.nodeType === Node.ELEMENT_NODE) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setEntry(entry);
          },
          { threshold, root, rootMargin },
        );

        observer.observe(node);
        previousObserverRef.current = observer;
      }
    },
    [threshold, root, rootMargin],
  );

  return [customRef, entry] as const;
}

export default useIntersectionObserver;
