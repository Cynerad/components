import { useEffect, useEffectEvent, useRef } from "react";

function useInterval(cb: CallableFunction, delay: number) {
  const id = useRef<number | undefined>(undefined);
  const onInterval = useEffectEvent(cb);

  const handleClearInterval = () => {
    window.clearInterval(id.current);
  };

  useEffect(() => {
    id.current = window.setInterval(onInterval, delay);
    return handleClearInterval;
  }, [delay]);

  return handleClearInterval;
}

export default useInterval;
