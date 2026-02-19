import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function H3({ className, children, ...props }: ComponentProps<"h3">) {
  return (
    <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}
