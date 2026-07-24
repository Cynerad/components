import { useEffect, useEffectEvent, useRef } from "react";

function useInterval(cb: CallableFunction, delay: number) {
  const idRef = useRef<number | undefined>(undefined);
  const onInterval = useEffectEvent(cb);

  const handleClearInterval = () => {
    window.clearInterval(idRef.current);
  };

  useEffect(() => {
    idRef.current = window.setInterval(onInterval, delay);
    return window.clearInterval(idRef.current);
  }, [delay]);

  return handleClearInterval;
}

export default useInterval;
