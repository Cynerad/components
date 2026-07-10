import { useRef } from "react";

function useRenderCount() {
  const count = useRef(0);

  // eslint-disable-next-line react-hooks/refs
  count.current++;

  // eslint-disable-next-line react-hooks/refs
  return count.current;
}

export default useRenderCount;
