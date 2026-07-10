import { useEffect, useRef, useState } from "react";

function useIsFirstRender() {
  const [isFirst, setIsFirst] = useState(true);
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    if (!hasRenderedRef.current) {
      hasRenderedRef.current = true;
      setIsFirst(false);
    }
  }, []);

  return isFirst;
}

export default useIsFirstRender;
