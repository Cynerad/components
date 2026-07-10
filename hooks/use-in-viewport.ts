import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  once?: boolean;
};

export function useInViewport(
  ref: React.RefObject<HTMLElement | null>,
  options: UseInViewOptions = {},
): boolean {
  const { threshold = 0, root = null, rootMargin = "0px", once = false } = options;
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current)
      return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? false);
        if (entry?.isIntersecting && once) {
          observerRef.current?.unobserve(entry.target);
        }
      },
      { threshold, root, rootMargin },
    );

    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [root, rootMargin, threshold, once]);

  return isInView;
}
