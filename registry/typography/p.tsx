import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function P({ className, children, ...props }: ComponentProps<"h4">) {
  return (
    <p className={cn("leading-7 not-first:mt-6", className)} {...props}>
      {children}
    </p>
  );
}
