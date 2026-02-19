import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function H1({ className, children, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight text-balance", className)} {...props}>
      {children}
    </h1>
  );
}
