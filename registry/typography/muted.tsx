import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Muted({ className, children, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </p>
  );
}
