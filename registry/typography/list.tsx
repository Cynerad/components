import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function List({ className, children, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>
      {children}
    </ul>
  );
}
