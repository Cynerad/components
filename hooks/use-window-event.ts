import { useEffect, useRef } from "react";

function useWindowEvent<K extends keyof WindowEventMap, R>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => R,
  options?: boolean | AddEventListenerOptions,
): void {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const eventListener = (event: WindowEventMap[K]) => {
      listenerRef.current.call(window, event);
    };

    window.addEventListener(type, eventListener, options);

    return () => {
      window.removeEventListener(type, eventListener, options);
    };
  }, [type, options]);
}

export default useWindowEvent;
