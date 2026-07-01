"use client";

import { cn } from "@/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ComponentProps, createContext, MouseEvent, useContext, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type SideType = "top" | "bottom";
type AlignType = "start" | "center" | "end";
type OrientationType = "horizontal" | "vertical";

type ActionBarType = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SideType;
  align?: AlignType;
  orientation?: OrientationType;
  portalContainer?: Element | DocumentFragment | null;
  sideOffset?: number;
  alignOffset?: number;
} & useRender.ComponentProps<"div"> &
  ComponentProps<"div">;

type ActionBarSeparatorType = {
  orientation?: OrientationType;
} & useRender.ComponentProps<"div"> &
  ComponentProps<"div">;

type ActionBarContextType = {
  onOpenChange?: (open: boolean) => void;
  orientation: OrientationType;
};

type ActionBarCloseType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

type ActionBarItemType = { close?: boolean } & useRender.ComponentProps<"button"> & ComponentProps<"button">;

const ActionBarContext = createContext<ActionBarContextType | null>(null);
const ROOT_NAME = "ActionBar";

function useActionBarContext(consumerName: string) {
  const context = useContext(ActionBarContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function ActionBar({
  open = false,
  render,
  onOpenChange,
  className,
  side = "bottom",
  align = "center",
  orientation = "horizontal",
  portalContainer: portalContainerProp,
  sideOffset = 16,
  alignOffset = 0,
  style,
  ...props
}: ActionBarType) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const contextValue = useMemo<ActionBarContextType>(
    () => ({
      onOpenChange,
      orientation,
    }),
    [onOpenChange, orientation],
  );

  const portalContainer = portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "role": "toolbar",
        "aria-orientation": orientation,
        "className": cn(
          "fixed z-50 rounded-lg border bg-card shadow-lg outline-none",
          "fade-in-0 zoom-in-95 animate-in duration-250 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=bottom]:slide-in-from-bottom-4 data-[side=top]:slide-in-from-top-4",
          "motion-reduce:animate-none motion-reduce:transition-none p-1",
          orientation === "horizontal" ? "flex flex-row items-center gap-2 " : "flex flex-col items-start gap-2 ",
          className,
        ),
        "style": {
          [side]: `${sideOffset}px`,
          ...(align === "center" && {
            left: "50%",
            translate: "-50% 0",
          }),
          ...(align === "start" && { left: `${alignOffset}px` }),
          ...(align === "end" && { right: `${alignOffset}px` }),
          ...style,
        },
      },
      props,
    ),
    state: {
      slot: "action-bar",
      side,
      align,
      orientation,
    },
  });

  if (!portalContainer || !open) return null;

  return <ActionBarContext value={contextValue}>{createPortal(element, portalContainer)}</ActionBarContext>;
}

function ActionBarSeparator({ orientation: orientationProp = "horizontal", render, className, ...props }: ActionBarSeparatorType) {
  const context = useActionBarContext("ActionBarSeparator");
  const orientation = orientationProp ?? context.orientation;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "role": "separator",
        "aria-orientation": orientation,
        "aria-hidden": "true",
        "className": cn(
          "in-data-[slot=action-bar-selection]:ml-0.5 in-data-[slot=action-bar-selection]:h-4 in-data-[slot=action-bar-selection]:w-px bg-border",
          orientation === "horizontal" ? "h-5 w-[0.5px]" : "h-px w-full",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "action-bar-separator",
      orientation,
    },
  });
}

function ActionBarClose({ render, onClick, ...props }: ActionBarCloseType) {
  const { onOpenChange } = useActionBarContext("ActionBarClose");

  function onCloseClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    onOpenChange?.(false);
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: "button",
        onClick: onCloseClick,
      },
      props,
    ),
    render,
    state: {
      slot: "action-bar-close",
    },
  });
}

function ActionBarItem({ render, className, onClick, close = true, ...props }: ActionBarItemType) {
  const { onOpenChange } = useActionBarContext("ActionBarItem");

  function onClickHandler(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    onOpenChange?.(!close);
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: "button",
        className: cn(className),
        onClick: onClickHandler,
      },
      props,
    ),
    render,
    state: {
      slot: "action-bar-item",
    },
  });
}

export { ActionBar, ActionBarClose, ActionBarItem, ActionBarSeparator };
