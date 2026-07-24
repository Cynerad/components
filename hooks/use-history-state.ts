import { useCallback, useReducer, useRef } from "react";

type HistoryStateType<T> = {
  past: T[];
  present: T;
  future: T[];
};

type HistoryAction<T> = { type: "UNDO" } | { type: "REDO" } | { type: "SET"; newPresent: T } | { type: "CLEAR"; initialPresent: T };

export type HistoryState<T> = {
  state: T;
  set: (newPresent: T) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

function historyStateReducer<T>(state: HistoryStateType<T>, action: HistoryAction<T>): HistoryStateType<T> {
  const { past, present, future } = state;
  switch (action.type) {
    case "UNDO":
      if (past.length === 0)
        return state;
      return {
        past: past.slice(0, past.length - 1),
        present: past[past.length - 1] as T,
        future: [present, ...future],
      };
    case "REDO":
      if (future.length === 0)
        return state;
      return {
        past: [...past, present],
        present: future[0] as T,
        future: future.slice(1),
      };
    case "SET":
      if (action.newPresent === present)
        return state;
      return {
        past: [...past, present],
        present: action.newPresent,
        future: [],
      };
    case "CLEAR":
      return {
        past: [],
        present: action.initialPresent,
        future: [],
      };
    default:
      throw new Error("Unsupported action type");
  }
}

function useHistoryState<T>(initialPresent: T): HistoryState<T> {
  const initialPresentRef = useRef(initialPresent);

  const [state, dispatch] = useReducer(historyStateReducer<T>, initialPresent, present => ({ past: [], present, future: [] }));

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (canUndo)
      dispatch({ type: "UNDO" });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo)
      dispatch({ type: "REDO" });
  }, [canRedo]);

  const set = useCallback((newPresent: T) => dispatch({ type: "SET", newPresent }), []);

  const clear = useCallback(() => dispatch({ type: "CLEAR", initialPresent: initialPresentRef.current }), []);

  return { state: state.present, set, undo, redo, clear, canUndo, canRedo };
}

export default useHistoryState;
