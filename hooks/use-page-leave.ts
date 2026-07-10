import { useEffect, useEffectEvent } from "react";

function usePageLeave(cb: () => void) {
  const onLeave = useEffectEvent((event: MouseEvent) => {
    if (!event.relatedTarget) {
      cb();
    }
  });

  useEffect(() => {
    document.addEventListener("mouseout", onLeave);

    return () => document.removeEventListener("mouseout", onLeave);
  }, []);
}

export default usePageLeave;
