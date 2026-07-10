import { useSyncExternalStore } from "react";

function usePreferredLanguageSubscribe(cb: () => void) {
  window.addEventListener("languagechange", cb);
  return () => window.removeEventListener("languagechange", cb);
}

function getPreferredLanguageSnapshot() {
  return navigator.language;
}

function getPreferredLanguageServerSnapshot(): string {
  throw new Error("usePreferredLanguage is a client-only hook");
}

function usePreferredLanguage() {
  return useSyncExternalStore(
    usePreferredLanguageSubscribe,
    getPreferredLanguageSnapshot,
    getPreferredLanguageServerSnapshot,
  );
}

export default usePreferredLanguage;
