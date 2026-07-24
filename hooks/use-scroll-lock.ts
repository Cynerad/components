import { useRef, useState } from "react";

import useIsomorphicLayoutEffect from "@/hooks/use-isomorphic-layout-effect";

type UseScrollLockOptions = {
  autoLock?: boolean;
  lockTarget?: HTMLElement | string;
  widthReflow?: boolean;
};

type UseScrollLockReturn = {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
};

type OriginalStyle = {
  overflow: CSSStyleDeclaration["overflow"];
  paddingRight: CSSStyleDeclaration["paddingRight"];
};

const IS_SERVER = typeof window === "undefined";

/**
 * Hook to handle scroll locking.
 * @param {UseScrollLockOptions} options - The options for the hook.
 * @returns {UseScrollLockReturn} An object containing the current state of the scroll lock and functions to control it.
 */
export default function useScrollLock(options: UseScrollLockOptions = {}): UseScrollLockReturn {
  const { autoLock = true, lockTarget, widthReflow = true } = options;
  const [isLocked, setIsLocked] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const originalStyleRef = useRef<OriginalStyle | null>(null);

  const lock = () => {
    if (targetRef.current) {
      const { overflow, paddingRight } = targetRef.current.style;

      // Save the original styles
      originalStyleRef.current = { overflow, paddingRight };

      // Prevent width reflow
      if (widthReflow) {
        // Use window inner width if body is the target as global scrollbar isn't part of the document
        const offsetWidth = targetRef.current === document.body ? window.innerWidth : targetRef.current.offsetWidth;
        // Get current computed padding right in pixels
        const currentPaddingRight = Number.parseInt(window.getComputedStyle(targetRef.current).paddingRight, 10) || 0;

        const scrollbarWidth = offsetWidth - targetRef.current.scrollWidth;
        targetRef.current.style.paddingRight = `${scrollbarWidth + currentPaddingRight}px`;
      }

      // Lock the scroll
      targetRef.current.style.overflow = "hidden";

      setIsLocked(true);
    }
  };

  const unlock = () => {
    if (targetRef.current && originalStyleRef.current) {
      targetRef.current.style.overflow = originalStyleRef.current.overflow;

      // Only reset padding right if we changed it
      if (widthReflow) {
        targetRef.current.style.paddingRight = originalStyleRef.current.paddingRight;
      }
    }

    setIsLocked(false);
  };

  useIsomorphicLayoutEffect(() => {
    if (IS_SERVER)
      return;

    if (lockTarget) {
      targetRef.current = typeof lockTarget === "string" ? document.querySelector(lockTarget) : lockTarget;
    }

    if (!targetRef.current) {
      targetRef.current = document.body;
    }

    if (autoLock) {
      lock();
    }

    return () => {
      unlock();
    };
  }, [autoLock, lockTarget, widthReflow]);

  return { isLocked, lock, unlock };
}
