import { useState } from "react";

function useSet<T>(values?: T[]) {
  const [set, setSet] = useState(() => new Set(values));

  function add(...args: T[]) {
    setSet(new Set([...set, ...args]));
  }

  function clear() {
    setSet(new Set());
  }

  function deleteItem(...args: T[]) {
    setSet(new Set([...set].filter((x) => !args.includes(x))));
  }

  function hasItem(item: T) {
    return set.has(item);
  }

  return {
    add,
    clear,
    deleteItem,
    hasItem,
  };
}

export default useSet;
