"use client";

import { cn, copyText } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { Button } from "../button";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  className,
  variant = "ghost",
  tooltip = "Copy to Clipboard",
  ...props
}: React.ComponentProps<typeof Button> & {
  value: string;
  src?: string;
  tooltip?: string;
}) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="copy-button"
          data-copied={hasCopied}
          size="icon"
          variant={variant}
          className={cn("bg-muted-foreground absolute top-3 right-2 z-10 size-7 hover:opacity-100 focus-visible:opacity-100", className)}
          onClick={() => {
            copyText(value);
            setHasCopied(true);
          }}
          {...props}
        >
          <span className="sr-only">Copy</span>
          {hasCopied ? <Check /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{hasCopied ? "Copied" : tooltip}</TooltipContent>
    </Tooltip>
  );
}
