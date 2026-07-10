import { useCallback, useRef, useState } from "react";

function useIntersectionObserver<T extends Element>(options: IntersectionObserverInit) {
  const { threshold = 1, root = null, rootMargin = "0px" } = options;
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const previousObserver = useRef<IntersectionObserver | null>(null);

  const customRef = useCallback(
    (node: T | null) => {
      if (previousObserver.current) {
        previousObserver.current.disconnect();
        previousObserver.current = null;
      }

      if (node?.nodeType === Node.ELEMENT_NODE) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setEntry(entry);
          },
          { threshold, root, rootMargin },
        );

        observer.observe(node);
        previousObserver.current = observer;
      }
    },
    [threshold, root, rootMargin],
  );

  return [customRef, entry] as const;
}

export default useIntersectionObserver;
