import { useCallback, useEffect, useRef, useState } from "react";

type CountdownOptions = {
  countStart: number;

  intervalMs?: number;
  isIncrement?: boolean;

  countStop?: number;
};

type CountdownControllers = {
  startCountdown: () => void;
  stopCountdown: () => void;
  resetCountdown: () => void;
};

export default function useCountdown({
  countStart,
  countStop = 0,
  intervalMs = 1000,
  isIncrement = false,
}: CountdownOptions): [number, CountdownControllers] {
  const savedCallbackRef = useRef(() => {});

  const [count, setCount] = useState(countStart);
  const increment = useCallback(() => setCount(count + 1), [count]);
  const decrement = useCallback(() => setCount(count - 1), [count]);
  const resetCounter = useCallback(() => setCount(countStart), [countStart]);

  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const startCountdown = useCallback(() => setIsCountdownRunning(true), []);
  const stopCountdown = useCallback(() => setIsCountdownRunning(false), []);

  // Will set running false and reset the seconds to initial value.
  const resetCountdown = useCallback(() => {
    stopCountdown();
    resetCounter();
  }, [stopCountdown, resetCounter]);

  const countdownCallback = useCallback(() => {
    if (count === countStop) {
      stopCountdown();
      return;
    }

    if (isIncrement) {
      increment();
    }
    else {
      decrement();
    }
  }, [count, countStop, decrement, increment, isIncrement, stopCountdown]);

  useEffect(() => {
    savedCallbackRef.current = countdownCallback;
  });

  const delay = isCountdownRunning ? intervalMs : null;

  useEffect(() => {
    if (delay !== null) {
      const interval = setInterval(() => savedCallbackRef.current(), delay || 0);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [delay]);

  return [count, { startCountdown, stopCountdown, resetCountdown }];
}
