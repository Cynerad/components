import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function InlineCode({ className, children, ...props }: ComponentProps<"code">) {
  return (
    <code className={cn("bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props}>
      {children}
    </code>
  );
}
