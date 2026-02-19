import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function H4({ className, children, ...props }: ComponentProps<"h4">) {
  return (
    <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h4>
  );
}
