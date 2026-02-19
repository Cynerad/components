import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Lead({ className, children, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xl", className)} {...props}>
      {children}
    </p>
  );
}
