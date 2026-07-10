import { useCallback, useState } from "react";

function useCounter(
  startingValue: number = 0,
  options: {
    min?: number;
    max?: number;
  } = {},
) {
  const { min, max } = options;

  if (typeof min === "number" && startingValue < min) {
    throw new Error(`Your starting value of ${startingValue} is less than your min of ${min}.`);
  }

  if (typeof max === "number" && startingValue > max) {
    throw new Error(`Your starting value of ${startingValue} is greater than your max of ${max}.`);
  }

  const [count, setCount] = useState(startingValue);

  const increment = useCallback(() => {
    setCount((c) => {
      const nextCount = c + 1;

      if (typeof max === "number" && nextCount > max) {
        return c;
      }

      return nextCount;
    });
  }, [max]);

  const decrement = useCallback(() => {
    setCount((c) => {
      const nextCount = c - 1;

      if (typeof min === "number" && nextCount < min) {
        return c;
      }

      return nextCount;
    });
  }, [min]);

  const set = useCallback(
    (nextCount: number) => {
      setCount((c) => {
        if (typeof max === "number" && nextCount > max) {
          return c;
        }

        if (typeof min === "number" && nextCount < min) {
          return c;
        }

        return nextCount;
      });
    },
    [max, min],
  );

  const reset = useCallback(() => {
    setCount(startingValue);
  }, [startingValue]);

  return [
    count,
    {
      increment,
      decrement,
      set,
      reset,
    },
  ];
}

export default useCounter;
