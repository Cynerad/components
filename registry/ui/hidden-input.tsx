"use client";

import { ComponentProps, CSSProperties, useMemo } from "react";

type HiddenInputType = ComponentProps<"input">;

export function HiddenInput({ style, ...props }: HiddenInputType) {
  const composedStyle = useMemo<CSSProperties>(() => {
    return {
      ...style,
      border: 0,
      clip: "rect(0 0 0 0)",
      clipPath: "inset(50%)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      whiteSpace: "nowrap",
      width: "1px",
    };
  }, [style]);

  return <input {...props} aria-hidden style={composedStyle} tabIndex={-1} />;
}
