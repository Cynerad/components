import { useEffect, useState } from "react";

function useDocumentVisibility(): DocumentVisibilityState {
  const [documentVisibility, setDocumentVisibility] = useState<DocumentVisibilityState>(() =>
    typeof document === "undefined" ? "visible" : document.visibilityState,
  );

  useEffect(() => {
    const listener = () => setDocumentVisibility(document.visibilityState);
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, []);

  return documentVisibility;
}

export default useDocumentVisibility;
