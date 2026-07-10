import { useEffect, useEffectEvent } from "react";

type UseKeyPressOptions = {
  event?: keyof WindowEventMap;
  target?: Element | Window;
  eventOptions?: AddEventListenerOptions;
};

export function useKeyPress(
  key: string,
  cb: (event: KeyboardEvent) => void,
  options: UseKeyPressOptions = {},
) {
  const { event = "keydown", target = window, eventOptions } = options;

  const onListen = useEffectEvent(() => {
    if (!target?.addEventListener)
      return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === key) {
        cb(e);
      }
    };

    target.addEventListener(event, handler as EventListener, eventOptions);

    return () => {
      target.removeEventListener(event, handler as EventListener, eventOptions);
    };
  });

  useEffect(() => {
    const cleanup = onListen();
    return cleanup;
  }, [onListen]);
}
