import { useMemo, useRef } from "react";

type LongPressOptions = {
  threshold?: number;
  onStart?: (e: MouseEvent | TouchEvent) => void;
  onFinish?: (e: MouseEvent | TouchEvent) => void;
  onCancel?: (e: MouseEvent | TouchEvent) => void;
};

type LongPressEventHandlers = {
  onMouseDown: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onMouseLeave: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
};

function isMouseEvent(e: Event): e is MouseEvent {
  return "button" in e;
}

function isTouchEvent(e: Event): e is TouchEvent {
  return "touches" in e;
}

function useLongPress(callback: (e: MouseEvent | TouchEvent) => void, options: LongPressOptions = {}): LongPressEventHandlers {
  const { threshold = 400, onStart, onFinish, onCancel } = options;

  const isLongPressActiveRef = useRef(false);
  const isPressedRef = useRef(false);
  const timerIdRef = useRef<number | undefined>(undefined);

  return useMemo(() => {
    if (typeof callback !== "function") {
      throw new TypeError("Callback must be a function");
    }

    const start = (event: MouseEvent | TouchEvent) => {
      if (!isMouseEvent(event) && !isTouchEvent(event))
        return;

      if (onStart)
        onStart(event);

      isPressedRef.current = true;
      timerIdRef.current = window.setTimeout(() => {
        callback(event);
        isLongPressActiveRef.current = true;
      }, threshold);
    };

    const cancel = (event: MouseEvent | TouchEvent) => {
      if (!isMouseEvent(event) && !isTouchEvent(event))
        return;

      if (isLongPressActiveRef.current) {
        if (onFinish)
          onFinish(event);
      }
      else if (isPressedRef.current) {
        if (onCancel)
          onCancel(event);
      }

      isLongPressActiveRef.current = false;
      isPressedRef.current = false;

      if (timerIdRef.current !== undefined) {
        window.clearTimeout(timerIdRef.current);
        timerIdRef.current = undefined;
      }
    };

    return {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
    };
  }, [callback, threshold, onCancel, onFinish, onStart]);
}

export default useLongPress;
export type { LongPressEventHandlers, LongPressOptions };
