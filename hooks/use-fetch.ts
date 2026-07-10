import { useEffect, useEffectEvent, useReducer, useRef } from "react";

type FetchState<T> = {
  data?: T;
  error?: Error;
};

type FetchAction<T> = { type: "loading" } | { type: "fetched"; payload: T } | { type: "error"; payload: Error };

const initialState: FetchState<unknown> = {
  data: undefined,
  error: undefined,
};

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  switch (action.type) {
    case "loading":
      return { data: undefined, error: undefined };

    case "fetched":
      return { data: action.payload, error: undefined };

    case "error":
      return { data: undefined, error: action.payload };

    default:
      return state;
  }
}

function useFetch<T = unknown>(url: string, options?: RequestInit): FetchState<T> {
  const cacheRef = useRef<Record<string, T>>({});

  const [state, dispatch] = useReducer(fetchReducer<T>, initialState as FetchState<T>);

  const onFetch = useEffectEvent((url: string) => {
    return fetch(url, options);
  });

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      const cached = cacheRef.current[url];

      if (cached) {
        dispatch({ type: "fetched", payload: cached });
        return;
      }

      dispatch({ type: "loading" });

      try {
        const res = await onFetch(url);

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        const json = (await res.json()) as T;
        cacheRef.current[url] = json;

        if (!ignore) {
          dispatch({ type: "fetched", payload: json });
        }
      } catch (err) {
        if (!ignore) {
          dispatch({
            type: "error",
            payload: err instanceof Error ? err : new Error("Unknown error"),
          });
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [url]);

  return state;
}

export default useFetch;
