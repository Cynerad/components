import { useCallback, useState } from "react";

import useIsomorphicLayoutEffect from "@/hooks/use-isomorphic-layout-effect";

type UseHashReturn = [string, (newHash: string) => void];

function useHash(): UseHashReturn {
  const [hash, setHash] = useState(() => window.location.hash);

  const onHashChange = useCallback(() => {
    setHash(window.location.hash);
  }, []);

  useIsomorphicLayoutEffect(() => {
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const _setHash = useCallback(
    (newHash: string) => {
      if (newHash !== hash) {
        window.location.hash = newHash;
      }
    },
    [hash],
  );

  return [hash, _setHash] as const;
}

export default useHash;
