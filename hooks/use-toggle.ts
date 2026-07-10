import { useCallback, useState } from "react";

function useToggle(initialValue: boolean) {
  const [on, setOn] = useState(() => {
    if (typeof initialValue === "boolean") {
      return initialValue;
    }

    return Boolean(initialValue);
  });

  const handleToggle = useCallback((value?: boolean) => {
    if (typeof value === "boolean") {
      return setOn(value);
    }

    return setOn(v => !v);
  }, []);

  return [on, handleToggle];
}

export default useToggle;
