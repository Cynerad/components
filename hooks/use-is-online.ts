import { useSyncExternalStore } from "react";

/**
 *
 * @returns {boolean} Is navigator online
 */
function getSnapshot(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }

  return navigator.onLine;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window !== "undefined") {
    window.addEventListener("online", onStoreChange);
    window.addEventListener("offline", onStoreChange);
    return () => {
      window.removeEventListener("online", onStoreChange);
      window.removeEventListener("offline", onStoreChange);
    };
  } else {
    console.warn("useOnline: window is undefined.");
    return () => {};
  }
}

function useIsOnline(): boolean | null {
  const isOnline = useSyncExternalStore<boolean | null>(subscribe, getSnapshot);

  return isOnline;
}
export default useIsOnline;
