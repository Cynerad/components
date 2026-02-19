import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Blockquote({ className, children, ...props }: ComponentProps<"blockquote">) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props}>
      {children}
    </blockquote>
  );
}
