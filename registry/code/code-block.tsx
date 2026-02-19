"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { codeToHtml, bundledLanguages, bundledThemes, DecorationItem } from "shiki";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { Button } from "../button";
import { Check, Copy, Ellipsis } from "lucide-react";
import { cn, copyText } from "@/lib/utils";
import "./code.css";
import { transformerNotationDiff } from "@shikijs/transformers";
import { Badge } from "../badge";

export type CodeBlockType = {
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
  expendable?: boolean;
};

interface Properties {
  [PropertyName: string]: boolean | number | string | null | undefined | Array<string | number>;
}

export type HighlightedCodesType = {
  code: string;
};

export function CodeBlock({ code, fileName, language, icon, themes, focus, highlight, expendable = false }: CodeBlockType) {
  const { resolvedTheme } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [hasCopied, setHasCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!expendable);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  function copyCommand() {
    if (!code) return;

    copyText(code);
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

  function generateDecorations(highlight?: string, focus?: string) {
    const focusDecorations = createDecoration(focus, { class: "focus-line" });
    const highlightedDecorations = createDecoration(highlight, { class: "highlighted-line" });

    return [...highlightedDecorations, ...focusDecorations];
  }

  useEffect(() => {
    const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";

    async function loadHighlightedCode() {
      const highlighted = await codeToHtml(code, {
        lang: language,
        theme: themes ? (resolvedTheme === "dark" ? themes.dark : themes.light) : theme,
        defaultColor: resolvedTheme === "dark" ? "dark" : "light",
        decorations: generateDecorations(highlight, focus),
        transformers: [transformerNotationDiff()],
      });

      setHighlightedCode(highlighted);
    }

    loadHighlightedCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, code, language, themes, highlight, focus]);

  return (
    <div>
      <div className="overflow-x-auto relative bg-accent rounded-t-sm">
        <div className="border-border/50 flex items-center gap-2 border-b px-3 py-1">
          <Badge variant="outline" className="rounded-sm px-2 py-1 text-xs">
            {icon && <DynamicIcon name={icon} className="h-6 w-5" />}
            {fileName}
          </Badge>
        </div>

        <div className={cn("", isExpanded ? "max-h-full" : "max-h-[400px] overflow-hidden")}>
          {highlightedCode ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          ) : (
            <pre>
              <code>{code}</code>
            </pre>
          )}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-slot="copy-button"
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10 size-5 opacity-70 hover:opacity-100 focus-visible:opacity-100"
              onClick={copyCommand}
            >
              <span className="sr-only">Copy</span>
              {hasCopied ? <Check /> : <Copy />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{hasCopied ? "Copied" : "Copy to Clipboard"}</TooltipContent>
        </Tooltip>
      </div>

      {expendable && (
        <div className="flex items-center justify-between bg-muted text-muted-foreground p-2 rounded-b-sm">
          <Button
            size="sm"
            onClick={() => {
              setIsExpanded((old) => !old);
            }}
          >
            <span className="flex items-center justify-center gap-1">
              <Ellipsis />
              <span>{isExpanded ? "Collapse" : "See all"}</span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
