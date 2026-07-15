"use client";

import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { ComponentProps, createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import "./marquee.css";

type DirectionType = "left" | "right" | "up" | "down";

type MarqueeContextValueType = {
  direction: DirectionType;
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  pauseOnHover: boolean;
  speed: number;
};

type MarqueeRootProps = {
  direction?: DirectionType;
  speed?: number;
  gap?: string;
  pauseOnHover?: boolean;
  defaultPaused?: boolean;
} & ComponentProps<"div">;

const ROOT_NAME = "Marquee.Root";

const MarqueeContext = createContext<MarqueeContextValueType | null>(null);

function useMarqueeContext(consumerName: string) {
  const context = useContext(MarqueeContext);
  if (!context) {
    throw new Error(`Marquee.${consumerName} must be used within <${ROOT_NAME}>`);
  }
  return context;
}

function MarqueeRoot({
  direction = "left",
  speed = 30,
  gap = "1rem",
  pauseOnHover = true,
  defaultPaused = false,
  className,
  style,
  children,
  ref,
  ...props
}: MarqueeRootProps) {
  const [paused, setPaused] = useState(defaultPaused);

  return (
    <MarqueeContext.Provider value={{ direction, paused, setPaused, pauseOnHover, speed }}>
      <div
        ref={ref}
        className={cn("group relative flex w-full items-center overflow-hidden", className)}
        style={{ "--marquee-gap": gap, ...style } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </MarqueeContext.Provider>
  );
}

MarqueeRoot.displayName = "Marquee.Root";

type MarqueeContentProps = {
  repeat?: number;
  reverse?: boolean;
} & ComponentProps<"div">;

function MarqueeContent({ className, children, repeat = 4, reverse = false, ref, ...props }: MarqueeContentProps) {
  const { direction, paused, pauseOnHover, speed } = useMarqueeContext("Content");
  const isVertical = direction === "up" || direction === "down";
  const animationName = `marquee-${direction}`;

  return (
    <div ref={ref} className={cn("flex w-full gap-(--marquee-gap)", isVertical ? "flex-col" : "flex-row")} {...props}>
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          className={cn(
            "flex shrink-0 items-center gap-(--marquee-gap)",
            isVertical ? "flex-col" : "flex-row",
            pauseOnHover && "group-hover:paused!",
            className,
          )}
          style={{
            animationName,
            animationDuration: `${speed}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDirection: reverse ? "reverse" : "normal",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

MarqueeContent.displayName = "Marquee.Content";

function MarqueeItem({ className, ref, ...props }: ComponentProps<"div">) {
  return <div ref={ref} className={cn("shrink-0", className)} {...props} />;
}

MarqueeItem.displayName = "Marquee.Item";

type MarqueeEdgeProps = {
  side: "left" | "right" | "top" | "bottom";
  fromColor?: string;
  width?: string;
} & ComponentProps<"div">;

function MarqueeEdge({ side, fromColor = "from-background", width = "8rem", className, ref, ...props }: MarqueeEdgeProps) {
  const positionClasses: Record<typeof side, string> = {
    left: "left-0 top-0 h-full bg-gradient-to-r",
    right: "right-0 top-0 h-full bg-gradient-to-l",
    top: "top-0 left-0 w-full bg-gradient-to-b",
    bottom: "bottom-0 left-0 w-full bg-gradient-to-t",
  };
  const sizeStyle = side === "left" || side === "right" ? { width } : { height: width };

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute z-10 to-transparent", fromColor, positionClasses[side], className)}
      style={sizeStyle}
      {...props}
    />
  );
}

MarqueeEdge.displayName = "Marquee.Edge";

function MarqueePauseButton({ className, ref, ...props }: ComponentProps<"button">) {
  const { paused, setPaused } = useMarqueeContext("PauseButton");

  return (
    <button
      ref={ref}
      type="button"
      aria-label={paused ? "Play marquee" : "Pause marquee"}
      onClick={() => setPaused((p) => !p)}
      className={cn(
        "absolute bottom-2 right-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent",
        className,
      )}
      {...props}
    >
      {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
    </button>
  );
}

MarqueePauseButton.displayName = "Marquee.PauseButton";

export const Marquee = {
  Root: MarqueeRoot,
  Content: MarqueeContent,
  Item: MarqueeItem,
  Edge: MarqueeEdge,
  PauseButton: MarqueePauseButton,
};
