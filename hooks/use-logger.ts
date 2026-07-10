import { useEffect, useEffectEvent, useRef } from "react";

function useLogger<T>(name: string, ...rest: T[]) {
  const initialRenderRef = useRef(true);

  const handleLog = useEffectEvent((event: string) => {
    console.log(`${name} ${event}:`, rest);
  });

  useEffect(() => {
    if (initialRenderRef.current === false) {
      handleLog("updated");
    }
  });

  useEffect(() => {
    handleLog("mounted");
    initialRenderRef.current = false;

    return () => {
      handleLog("unmounted");
      initialRenderRef.current = true;
    };
  }, []);
}

export default useLogger;
