import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Small({ className, children, ...props }: ComponentProps<"small">) {
  return (
    <small className={cn("text-sm leading-none font-medium", className)} {...props}>
      {children}
    </small>
  );
}
