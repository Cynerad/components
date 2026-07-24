import { useEffect, useRef, useState } from "react";

function useThrottle<T>(value: T, interval: number = 500) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdatedRef = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();

    if (lastUpdatedRef.current && now >= lastUpdatedRef.current + interval) {
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    }
    else {
      const id = window.setTimeout(() => {
        lastUpdatedRef.current = now;
        setThrottledValue(value);
      }, interval);

      return () => window.clearTimeout(id);
    }
  }, [value, interval]);

  return throttledValue;
}

export default useThrottle;
