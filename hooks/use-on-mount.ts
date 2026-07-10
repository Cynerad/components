import type { EffectCallback } from "react";

import { useEffect } from "react";

function useOnMount(callback: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
}

export default useOnMount;
