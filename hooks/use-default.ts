import { useState } from "react";

function useDefault<T>(initialValue: T, defaultValue: T) {
  const [state, setState] = useState(initialValue);

  if (typeof state === "undefined" || state === null) {
    return [defaultValue, setState];
  }

  return [state, setState];
}

export default useDefault;
