import { useCallback, useEffect, useSyncExternalStore } from "react";

function dispatchStorageEvent(key: string, newValue: string | null) {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

function setLocalStorageItem<T>(key: string, value: T) {
  const stringifiedValue = JSON.stringify(value);
  window.localStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
}

function removeLocalStorageItem(key: string) {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
}

function getLocalStorageItem(key: string): string | null {
  return window.localStorage.getItem(key);
}

function useLocalStorageSubscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getLocalStorageServerSnapshot(): string | null {
  throw new Error("useLocalStorage is a client-only hook");
}

export function useLocalStorage<T>(
  key: string,
  initialValue?: T,
): [T | undefined, (v: T | ((prev: T | undefined) => T | undefined)) => void] {
  const getSnapshot = (): string | null => getLocalStorageItem(key);

  /* Subscribe to storage events */
  const store = useSyncExternalStore(useLocalStorageSubscribe, getSnapshot, getLocalStorageServerSnapshot);

  const setState = useCallback(
    (v: T | ((prev: T | undefined) => T | undefined)) => {
      try {
        const prev = store ? JSON.parse(store) : undefined;
        const nextState = typeof v === "function" ? (v as (prev: T | undefined) => T | undefined)(prev) : v;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, store],
  );

  useEffect(() => {
    if (getLocalStorageItem(key) === null && initialValue !== undefined) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  const parsedStore = store ? (JSON.parse(store) as T) : initialValue;

  return [parsedStore, setState];
}
