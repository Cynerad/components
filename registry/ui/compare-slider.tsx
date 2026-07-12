"use client";

import { clamp } from "@/lib/support/number";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ComponentProps, createContext, useContext, useRef, useState } from "react";

type CompareSliderContextValueType = {
  value: number;
  setValue: (value: number) => void;
};

const CompareSliderContext = createContext<CompareSliderContextValueType | null>(null);

function useCompareSliderContext(name: string) {
  const context = useContext(CompareSliderContext);
  if (!context) throw new Error(`${name} must be used within CompareSlider`);
  return context;
}

type CompareSliderType = {
  defaultValue?: number;
} & ComponentProps<"div">;

function CompareSlider({ defaultValue = 50, className, children, ...props }: CompareSliderType) {
  const [value, setValue] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateFromEvent = (clientX: number) => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    setValue(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100));
  };

  const context: CompareSliderContextValueType = {
    value,
    setValue,
  };

  return (
    <CompareSliderContext value={context}>
      <div
        ref={rootRef}
        className={cn("relative isolate touch-none select-none overflow-hidden", className)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          isDragging.current = true;
          updateFromEvent(e.clientX);
        }}
        onPointerMove={(e) => isDragging.current && updateFromEvent(e.clientX)}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          isDragging.current = false;
        }}
        {...props}
      >
        {children}
      </div>
    </CompareSliderContext>
  );
}

function CompareSliderBefore({ className, ...props }: ComponentProps<"div">) {
  const { value } = useCompareSliderContext("CompareSliderBefore");
  return (
    <div
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{ clipPath: `inset(0 0 0 ${value}%)` }}
      {...props}
    />
  );
}

function CompareSliderAfter({ className, ...props }: ComponentProps<"div">) {
  const { value } = useCompareSliderContext("CompareSliderAfter");
  return (
    <div
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
      {...props}
    />
  );
}

function CompareSliderHandle({ className, ...props }: ComponentProps<"div">) {
  const { value } = useCompareSliderContext("CompareSliderHandle");
  return (
    <div
      className={cn("absolute top-0 z-50 h-full w-10 -translate-x-1/2 cursor-grab active:cursor-grabbing", className)}
      style={{ left: `${value}%` }}
      {...props}
    >
      <div className="absolute top-1/2 left-1/2 h-full w-1 -translate-x-1/2 -translate-y-1/2 bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex aspect-square size-11 shrink-0 items-center justify-center rounded-full bg-background p-2 [&_svg]:size-4 [&_svg]:select-none [&_svg]:stroke-3 [&_svg]:text-muted-foreground">
          <X />
        </div>
      </div>
    </div>
  );
}

export { CompareSlider, CompareSliderAfter, CompareSliderBefore, CompareSliderHandle };
