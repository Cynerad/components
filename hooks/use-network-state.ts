import { useRef, useSyncExternalStore } from "react";

type NetworkInformation = {
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  type?: string;
  addEventListener: (type: "change", listener: EventListener) => void;
  removeEventListener: (type: "change", listener: EventListener) => void;
};

type NetworkState = {
  online: boolean;
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
  type?: string;
};

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

function getConnection(): NetworkInformation | undefined {
  return navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection;
}

function isShallowEqual<T extends object>(a: T, b: T) {
  if (Object.is(a, b)) return true;

  const aKeys = Object.keys(a) as (keyof T)[];
  const bKeys = Object.keys(b) as (keyof T)[];

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!Object.is(a[key], b[key])) return false;
  }

  return true;
}

function useNetworkStateSubscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();

  window.addEventListener("online", handler, { passive: true });
  window.addEventListener("offline", handler, { passive: true });

  const connection = getConnection();
  if (connection) {
    connection.addEventListener("change", handler);
  }

  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);

    if (connection) {
      connection.removeEventListener("change", handler);
    }
  };
}

function getNetworkStateServerSnapshot(): never {
  throw new Error("useNetworkState is a client-only hook");
}

export function useNetworkState(): NetworkState {
  const cache = useRef<NetworkState | null>(null);

  const getSnapshot = (): NetworkState => {
    const online = navigator.onLine;
    const connection = getConnection();

    const nextState: NetworkState = {
      online,
      downlink: connection?.downlink,
      downlinkMax: connection?.downlinkMax,
      effectiveType: connection?.effectiveType,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
      type: connection?.type,
    };

    if (cache.current && isShallowEqual(cache.current, nextState)) {
      return cache.current;
    }

    cache.current = nextState;
    return nextState;
  };

  return useSyncExternalStore(useNetworkStateSubscribe, getSnapshot, getNetworkStateServerSnapshot);
}
