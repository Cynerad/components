import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Large({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </div>
  );
}
