"use client";

import { copyToClipboard } from "@/lib/support/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Terminal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";

export function CodeBlockCommand({
  npm,
  yarn,
  pnpm,
  bun,
}: React.ComponentProps<"pre"> & {
  npm?: string;
  yarn?: string;
  pnpm?: string;
  bun?: string;
}) {
  const [hasCopied, setHasCopied] = useState(false);
  const [packageManager, setPackageManager] = useState<"npm" | "yarn" | "pnpm" | "bun">("pnpm");

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const tabs = useMemo(() => {
    return {
      pnpm: pnpm,
      npm: npm,
      yarn: yarn,
      bun: bun,
    };
  }, [npm, pnpm, yarn, bun]);

  const copyCommand = useCallback(() => {
    const command = tabs[packageManager];

    if (!command) {
      return;
    }

    copyToClipboard(command);

    setHasCopied(true);
  }, [tabs, packageManager]);

  return (
    <div className="overflow-x-auto relative bg-accent rounded-md">
      <Tabs
        className="gap-0"
        defaultValue={pnpm ? "pnpm" : yarn ? "yarn" : bun ? "bun" : "npm"}
        onValueChange={(value) => {
          setPackageManager(value as "pnpm" | "npm" | "yarn" | "bun");
        }}
      >
        <div className="border-border/50 flex items-center gap-2 border-b px-3 py-1 min-w-62.5">
          <div className="flex size-4 items-center justify-center rounded-[1px] opacity-70">
            <Terminal className="text-code size-5" />
          </div>
          <TabsList className="rounded-none bg-transparent p-0">
            {Object.entries(tabs).map(([key, value]) => {
              return (
                value && (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="data-[state=active]:bg-accent data-[state=active]:border-input h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
                  >
                    {key}
                  </TabsTrigger>
                )
              );
            })}
          </TabsList>
        </div>
        <div className="no-scrollbar overflow-x-auto">
          {Object.entries(tabs).map(([key, value]) => {
            return (
              <TabsContent key={key} value={key} className="mt-0 px-4 py-3.5">
                <pre>
                  <code className="relative font-mono text-sm leading-none" data-language="bash">
                    {value}
                  </code>
                </pre>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-slot="copy-button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
            onClick={copyCommand}
          >
            <span className="sr-only">Copy</span>
            {hasCopied ? <Check /> : <Copy />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{hasCopied ? "Copied" : "Copy to Clipboard"}</TooltipContent>
      </Tooltip>
    </div>
  );
}
