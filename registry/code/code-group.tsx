"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/support/utils";
import { cn } from "@/lib/utils";
import { TabsContent } from "@radix-ui/react-tabs";
import { transformerNotationDiff } from "@shikijs/transformers";
import { Check, Copy, Ellipsis } from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { bundledLanguages, bundledThemes, codeToHtml, DecorationItem } from "shiki";
import "./code.css";

export type CodeType = {
  code: string;
  language: keyof typeof bundledLanguages;
  fileName: string;
  icon?: (typeof iconNames)[number];
  focus?: string;
  highlight?: string;
  themes?: {
    light: keyof typeof bundledThemes;
    dark: keyof typeof bundledThemes;
  };
};

interface Properties {
  [PropertyName: string]: boolean | number | string | null | undefined | Array<string | number>;
}

export type HighlightedCodesType = {
  id: string | number;
  code: string;
};

export function CodeGroup({ codes, expendable = false }: { codes: CodeType[]; expendable?: boolean }) {
  const { resolvedTheme } = useTheme();
  const [HighlightedCodes, setHighlightedCodes] = useState<HighlightedCodesType[]>([]);
  const [activeCodeID, setActiveCodeID] = useState<number>(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [isExpended, setIsExpended] = useState(expendable ? true : false);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  function copyCommand() {
    const code = codes.find((c, index) => {
      return activeCodeID === index;
    });
    if (!code) return;

    copyToClipboard(code.code);
    setHasCopied(true);
  }

  function validate(ranges?: string): void {
    if (!ranges?.trim()) return;

    const rangeArray = ranges.split(",");

    const pattern = /^(?:\d+|\d+-\d+)$/;

    rangeArray.forEach((string) => {
      if (!pattern.test(string)) {
        throw new Error(`expression is not valid for ${string}`);
      }
    });
  }

  function createDecoration(ranges?: string, properties?: Properties) {
    validate(ranges);
    const decorations: DecorationItem[] = [];
    const rangesArray = ranges?.split(",");

    rangesArray?.forEach((string) => {
      if (!string.includes("-")) {
        const line = Number(string) === 0 ? 1 : Number(string);
        decorations.push({
          start: { line: line - 1, character: 0 },
          end: { line: line - 1, character: -1 },
          properties: properties,
        });
        return;
      }

      const rangesArray = string.split("-");
      const start_line = Number(rangesArray[0]);
      const end_line = Number(rangesArray[1]);

      decorations.push({
        start: { line: start_line - 1, character: 0 },
        end: { line: end_line - 1, character: -1 },
        properties: properties,
      });
    });
    return decorations.filter((d) => d);
  }

  function generateDecorations(highlight?: string, fauces?: string) {
    const focus = createDecoration(fauces, { class: "focus-line" });
    const highlighted = createDecoration(highlight, { class: "highlighted-line" });

    return [...highlighted, ...focus];
  }

  useEffect(() => {
    const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";

    async function loadHighlightedCode() {
      const highlighted: HighlightedCodesType[] = await Promise.all(
        codes.map(async (c, index) => {
          const html = await codeToHtml(c.code, {
            lang: c.language,
            theme: c.themes ? (resolvedTheme === "dark" ? c.themes.dark : c.themes.light) : theme,
            defaultColor: resolvedTheme === "dark" ? "dark" : "light",
            decorations: generateDecorations(c.highlight, c.focus),
            transformers: [transformerNotationDiff()],
          });

          return {
            id: index,
            code: html,
          };
        }),
      );
      setHighlightedCodes(highlighted);
    }
    loadHighlightedCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, codes]);

  return (
    <div>
      <div className="overflow-x-auto relative bg-accent rounded-sm min-w-62.5">
        <Tabs
          className="gap-0"
          defaultValue={"0"}
          onValueChange={(value) => {
            const code = codes.findIndex((c, index) => {
              return index === Number(value);
            });
            if (code !== -1) {
              setActiveCodeID(code);
            }
          }}
        >
          <div className="border-border/50 flex items-center gap-2 border-b px-3 py-1">
            <TabsList>
              {codes.map((h, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {h.icon && <DynamicIcon name={h.icon} className="h-6 w-5" />}
                  {h.fileName}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className={cn(" ", isExpended ? "max-h-100" : "max-h-full")}>
            {HighlightedCodes.length > 0 ? (
              HighlightedCodes.map((h) => (
                <TabsContent key={h.id} value={h.id.toString()}>
                  <div dangerouslySetInnerHTML={{ __html: h.code }} />
                </TabsContent>
              ))
            ) : (
              <pre>
                <code>{codes[0].code}</code>
              </pre>
            )}
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
      <div className={cn("flex items-center justify-between bg-muted text-muted-foreground p-2 rounded-b-sm", !expendable && "hidden")}>
        <Button
          size="sm"
          onClick={() => {
            setIsExpended((old) => !old);
          }}
        >
          {isExpended ? (
            <span className="flex items-center justify-center gap-1">
              <Ellipsis />
              <span>See all</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <Ellipsis />
              <span>Collapse</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
