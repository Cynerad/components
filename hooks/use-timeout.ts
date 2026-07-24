import { useEffect, useRef } from "react";

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallbackRef = useRef(callback);

  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }

    const id = setTimeout(() => {
      savedCallbackRef.current();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay]);
}

export default useTimeout;
