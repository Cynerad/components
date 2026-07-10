import useMediaQuery from "@/hooks/use-media-query";

function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export default useReducedMotion;
