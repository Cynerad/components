import { type RefObject, useEffect, useRef } from "react";

const defaultEvents = ["mousedown", "touchstart"];

type UseClickAwayOptions<EventType extends Event = Event> = {
  ref: RefObject<HTMLElement | null>;
  onClickAway: (event: EventType) => void;
  events?: string[];
};

function useClickOutside<EventType extends Event = Event>({ ref, onClickAway, events = defaultEvents }: UseClickAwayOptions<EventType>) {
  const savedCallback = useRef(onClickAway);

  useEffect(() => {
    savedCallback.current = onClickAway;
  }, [onClickAway]);

  useEffect(() => {
    const handler = (event: EventType) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        savedCallback.current(event);
      }
    };
    for (const eventName of events) {
      window.addEventListener(eventName, handler as EventListener);
    }
    return () => {
      for (const eventName of events) {
        window.removeEventListener(eventName, handler as EventListener);
      }
    };
  }, [events, ref]);
}

export default useClickOutside;
