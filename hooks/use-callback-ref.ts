import { useEffect, useMemo, useRef } from "react";

function useCallbackRef<A extends unknown[], R>(callback?: (...args: A) => R) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return useMemo(
    () =>
      (...args: A) =>
        callbackRef.current?.(...args),
    [],
  );
}
export default useCallbackRef;
