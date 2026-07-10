import { useCallback, useEffect, useSyncExternalStore } from "react";

type ValueType = string | null | undefined;

function dispatchStorageEvent(key: string, newValue: ValueType) {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

function setSessionStorageItem<T>(key: string, value: T) {
  const stringifiedValue = JSON.stringify(value);
  window.sessionStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
}

function removeSessionStorageItem(key: string) {
  window.sessionStorage.removeItem(key);
  dispatchStorageEvent(key, null);
}

function getSessionStorageItem(key: string) {
  return window.sessionStorage.getItem(key);
}

function useSessionStorageSubscribe(callback: EventListenerOrEventListenerObject) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionStorageServerSnapshot(): string | null {
  throw new Error("useSessionStorage is a client-only hook");
}

type SetValue<T> = T | ((prevState: T) => T);

function useSessionStorage<T>(key: string, initialValue: T): [T, (v: SetValue<T>) => void] {
  const getSnapshot = () => getSessionStorageItem(key);

  const store = useSyncExternalStore(
    useSessionStorageSubscribe,
    getSnapshot,
    getSessionStorageServerSnapshot,
  );

  const setState = useCallback(
    (v: SetValue<T>) => {
      try {
        const currentState = store ? JSON.parse(store) : initialValue;
        const nextState = typeof v === "function" ? (v as (prevState: T) => T)(currentState) : v;

        if (nextState === undefined || nextState === null) {
          removeSessionStorageItem(key);
        }
        else {
          setSessionStorageItem(key, nextState);
        }
      }
      catch (e) {
        console.warn(e);
      }
    },
    [key, store, initialValue],
  );

  useEffect(() => {
    if (
      getSessionStorageItem(key) === null
      && typeof initialValue !== "undefined"
    ) {
      setSessionStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [store ? JSON.parse(store) : initialValue, setState];
}

export default useSessionStorage;
