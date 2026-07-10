import { useSyncExternalStore } from "react";

function useMediaQuery(query: string) {
  const subscribe = (callback: () => void) => {
    const matchQueryList = matchMedia(query);
    matchQueryList.addEventListener("change", callback);
    return () => {
      matchQueryList.removeEventListener("change", callback);
    };
  };

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return false;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useMediaQuery;
