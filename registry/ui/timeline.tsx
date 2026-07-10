import { useDirection } from "@/components/ui/direction";
import { useComposedRefs } from "@/hooks/compose-ref";
import useIsomorphicLayoutEffect from "@/hooks/use-is-morphic-effect";
import { cn } from "@/lib/utils";
import { useRender } from "@base-ui/react";
import { mergeProps } from "@base-ui/react/merge-props";
import { cva } from "class-variance-authority";
import { ComponentProps, createContext, RefObject, useContext, useId, useMemo, useRef } from "react";

type StatusType = "pending" | "completed" | "active";
type DirectionType = "ltr" | "rtl";
type VariantType = "default" | "alternate";
type OrientationType = "vertical" | "horizontal";

type StoreStateType = {
  items: Map<string, React.RefObject<ItemElement | null>>;
};
type TimelineContextValueType = {
  dir: DirectionType;
  orientation: OrientationType;
  variant: VariantType;
  activeIndex?: number;

  getState: () => StoreStateType;
  onItemRegister: (id: string, ref: React.RefObject<ItemElement | null>) => void;
  onItemUnregister: (id: string) => void;
  getNextItemStatus: (id: string, activeIndex?: number) => StatusType | undefined;
  getItemIndex: (id: string) => number;
};

type TimelineItemContextValueType = {
  id: string;
  status: StatusType;
  isAlternateRight: boolean;
};

type TimelineType = ComponentProps<"div"> &
  useRender.ComponentProps<"div"> & { dir?: DirectionType; orientation?: OrientationType; variant?: VariantType; activeIndex?: number };

type TimelineItemType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

type TimelineContentType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

type TimelineDotType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

type TimelineConnectorType = ComponentProps<"div"> &
  useRender.ComponentProps<"div"> & {
    forceMount?: boolean;
  };

type TimelineHeaderType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

type TimelineTitleType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

type TimelineDescriptionType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

type TimelineTimeType = ComponentProps<"time"> & useRender.ComponentProps<"time">;

const ROOT_NAME = "Timeline";
const ITEM_NAME = "TimelineItem";
const CONTENT_NAME = "TimelineContent";
const DOT_NAME = "TimelineDot";
const CONNECTOR_NAME = "TimelineConnector";

function getItemStatus(itemIndex: number, activeIndex?: number): StatusType {
  if (activeIndex === undefined) return "pending";
  if (itemIndex < activeIndex) return "completed";
  if (itemIndex === activeIndex) return "active";
  return "pending";
}

type ItemElement = HTMLDivElement;

function getSortedEntries(entries: [string, RefObject<ItemElement | null>][]) {
  return entries.sort((a, b) => {
    const elementA = a[1].current;
    const elementB = b[1].current;
    if (!elementA || !elementB) return 0;
    const position = elementA.compareDocumentPosition(elementB);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

const TimelineContext = createContext<TimelineContextValueType | null>(null);

function useTimelineContext(consumerName: string) {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const TimelineItemContext = createContext<TimelineItemContextValueType | null>(null);

function useTimelineItemContext(consumerName: string) {
  const context = useContext(TimelineItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

const timelineVariants = cva("relative flex [--timeline-connector-thickness:0.125rem] [--timeline-dot-size:0.875rem]", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-start",
    },
    variant: {
      default: "",
      alternate: "",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      variant: "default",
      class: "gap-6",
    },
    {
      orientation: "horizontal",
      variant: "default",
      class: "gap-8",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      class: "relative w-full gap-3",
    },
    {
      orientation: "horizontal",
      variant: "alternate",
      class: "items-center gap-4",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
  },
});
const timelineItemVariants = cva("relative flex", {
  variants: {
    orientation: {
      vertical: "",
      horizontal: "",
    },
    variant: {
      default: "",
      alternate: "",
    },
    isAlternateRight: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      variant: "default",
      class: "gap-3 pb-8 last:pb-0",
    },
    {
      orientation: "horizontal",
      variant: "default",
      class: "flex-col gap-3",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: false,
      class: "w-1/2 gap-3 pr-6 pb-12 last:pb-0",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: true,
      class: "ml-auto w-1/2 flex-row-reverse gap-3 pb-12 pl-6 last:pb-0",
    },
    {
      orientation: "horizontal",
      variant: "alternate",
      class: "grid min-w-0 grid-rows-[1fr_auto_1fr] gap-3",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});
const timelineContentVariants = cva("flex-1", {
  variants: {
    orientation: {
      vertical: "",
      horizontal: "",
    },
    variant: {
      default: "",
      alternate: "",
    },
    isAlternateRight: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "alternate",
      orientation: "vertical",
      isAlternateRight: false,
      class: "text-right",
    },
    {
      variant: "alternate",
      orientation: "horizontal",
      isAlternateRight: false,
      class: "row-start-3 pt-2",
    },
    {
      variant: "alternate",
      orientation: "horizontal",
      isAlternateRight: true,
      class: "row-start-1 pb-2",
    },
  ],
  defaultVariants: {
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});
const timelineDotVariants = cva(
  "relative z-10 flex size-[var(--timeline-dot-size)] shrink-0 items-center justify-center rounded-full border-2 bg-background",
  {
    variants: {
      status: {
        completed: "border-primary",
        active: "border-primary",
        pending: "border-border",
      },
      orientation: {
        vertical: "",
        horizontal: "",
      },
      variant: {
        default: "",
        alternate: "",
      },
      isAlternateRight: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "alternate",
        orientation: "vertical",
        isAlternateRight: false,
        class: "absolute -right-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] bg-background",
      },
      {
        variant: "alternate",
        orientation: "vertical",
        isAlternateRight: true,
        class: "absolute -left-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] bg-background",
      },
      {
        variant: "alternate",
        orientation: "horizontal",
        class: "row-start-2 bg-background",
      },
      {
        variant: "alternate",
        status: "completed",
        class: "bg-background",
      },
      {
        variant: "alternate",
        status: "active",
        class: "bg-background",
      },
    ],
    defaultVariants: {
      status: "pending",
      orientation: "vertical",
      variant: "default",
      isAlternateRight: false,
    },
  },
);
const timelineConnectorVariants = cva("absolute z-0", {
  variants: {
    isCompleted: {
      true: "bg-primary",
      false: "bg-border",
    },
    orientation: {
      vertical: "",
      horizontal: "",
    },
    variant: {
      default: "",
      alternate: "",
    },
    isAlternateRight: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      variant: "default",
      class:
        "start-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] top-3 h-[calc(100%+0.5rem)] w-[var(--timeline-connector-thickness)]",
    },
    {
      orientation: "horizontal",
      variant: "default",
      class:
        "start-3 top-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] h-[var(--timeline-connector-thickness)] w-[calc(100%+0.5rem)]",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: false,
      class: "top-2 -right-[calc(var(--timeline-connector-thickness)/2)] h-full w-[var(--timeline-connector-thickness)]",
    },
    {
      orientation: "vertical",
      variant: "alternate",
      isAlternateRight: true,
      class: "top-2 -left-[calc(var(--timeline-connector-thickness)/2)] h-full w-[var(--timeline-connector-thickness)]",
    },
    {
      orientation: "horizontal",
      variant: "alternate",
      class:
        "top-[calc(var(--timeline-dot-size)/2-var(--timeline-connector-thickness)/2)] left-3 row-start-2 h-[var(--timeline-connector-thickness)] w-[calc(100%+0.5rem)]",
    },
  ],
  defaultVariants: {
    isCompleted: false,
    orientation: "vertical",
    variant: "default",
    isAlternateRight: false,
  },
});

function Timeline({ orientation = "vertical", variant = "default", dir: dirProp, activeIndex, render, className, ...props }: TimelineType) {
  const stateRef = useRef({
    items: new Map(),
  });

  function getState() {
    return stateRef.current;
  }

  function onItemRegister(id: string, ref: RefObject<ItemElement | null>) {
    stateRef.current.items.set(id, ref);
  }

  function onItemUnregister(id: string) {
    stateRef.current.items.delete(id);
  }

  function getNextItemStatus(id: string, activeIndex?: number) {
    const entries = Array.from(stateRef.current.items.entries());

    const sortedEntries = getSortedEntries(entries);

    const currentIndex = sortedEntries.findIndex(([key]) => key === id);
    if (currentIndex === -1 || currentIndex === sortedEntries.length - 1) {
      return undefined;
    }

    const nextItemIndex = currentIndex + 1;
    return getItemStatus(nextItemIndex, activeIndex);
  }

  function getItemIndex(id: string) {
    const entries = Array.from(stateRef.current.items.entries());
    const sortedEntries = getSortedEntries(entries);
    return sortedEntries.findIndex(([key]) => key === id);
  }

  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;

  const contextValue = useMemo<TimelineContextValueType>(
    () => ({
      dir,
      orientation,
      variant,
      activeIndex,
      getState,
      onItemRegister,
      onItemUnregister,
      getItemIndex,
      getNextItemStatus,
    }),
    [dir, orientation, variant, activeIndex],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "role": "list",
        "aria-orientation": orientation,
        dir,
        "className": cn(timelineVariants({ orientation, variant, className })),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline",
      orientation,
      variant,
    },
  });

  return <TimelineContext value={contextValue}>{element}</TimelineContext>;
}

function TimelineItem({ render, className, id, ref, ...props }: TimelineItemType) {
  const { dir, orientation, variant, activeIndex, onItemRegister, onItemUnregister, getItemIndex } = useTimelineContext(ITEM_NAME);

  const itemRef = useRef<ItemElement | null>(null);
  const composedRef = useComposedRefs(itemRef, ref);

  const instanceId = useId();
  const itemId = id ?? instanceId;

  const itemIndex = getItemIndex(itemId);
  const status = useMemo<StatusType>(() => {
    return getItemStatus(itemIndex, activeIndex);
  }, [activeIndex, itemIndex]);

  useIsomorphicLayoutEffect(() => {
    onItemRegister(itemId, itemRef);

    return () => {
      onItemUnregister(itemId);
    };
  }, [id, itemId, onItemRegister, onItemUnregister]);

  const isAlternateRight = variant === "alternate" && itemIndex % 2 === 1;

  const itemContextValue = useMemo<TimelineItemContextValueType>(
    () => ({ id: itemId, status, isAlternateRight }),
    [itemId, status, isAlternateRight],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "role": "listitem",
        "aria-current": status === "active" ? "step" : undefined,
        "id": itemId,
        dir,
        "ref": composedRef,
        "className": cn(
          timelineItemVariants({
            orientation,
            variant,
            isAlternateRight,
            className,
          }),
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-item",
      status,
      orientation,
      ...(isAlternateRight && { "alternate-right": "" }),
    },
  });

  return <TimelineItemContext value={itemContextValue}>{element}</TimelineItemContext>;
}

function TimelineContent({ render, className, ...props }: TimelineContentType) {
  const { variant, orientation } = useTimelineContext(CONTENT_NAME);
  const { status, isAlternateRight } = useTimelineItemContext(CONTENT_NAME);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          timelineContentVariants({
            orientation,
            variant,
            isAlternateRight,
            className,
          }),
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-content",
      status,
    },
  });
  return element;
}

function TimelineDot({ render, className, ...props }: TimelineDotType) {
  const { orientation, variant } = useTimelineContext(DOT_NAME);
  const { status, isAlternateRight } = useTimelineItemContext(DOT_NAME);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          timelineDotVariants({
            status,
            orientation,
            variant,
            isAlternateRight,
            className,
          }),
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-dot",
      status,
      orientation,
    },
  });

  return element;
}

function TimelineConnector({ render, forceMount, className, ...props }: TimelineConnectorType) {
  const { orientation, variant, activeIndex, getNextItemStatus } = useTimelineContext(CONNECTOR_NAME);
  const { id, status, isAlternateRight } = useTimelineItemContext(CONNECTOR_NAME);

  const nextItemStatus = getNextItemStatus(id, activeIndex);

  const isLastItem = nextItemStatus === undefined;
  const isConnectorCompleted = nextItemStatus === "completed" || nextItemStatus === "active";

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "aria-hidden": "true",
        "className": cn(
          timelineConnectorVariants({
            isCompleted: isConnectorCompleted,
            orientation,
            variant,
            isAlternateRight,
            className,
          }),
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-connector",
      ...(isConnectorCompleted && { completed: "" }),
      status,
      orientation,
    },
  });

  if (!forceMount && isLastItem) return null;

  return element;
}

function TimelineHeader({ render, className, ...props }: TimelineHeaderType) {
  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-1", className),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-header",
    },
  });

  return element;
}

function TimelineTitle({ render, className, ...props }: TimelineTitleType) {
  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("font-semibold leading-none", className),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-title",
    },
  });

  return element;
}

function TimelineDescription({ render, className, ...props }: TimelineDescriptionType) {
  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("text-muted-foreground text-sm", className),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-description",
    },
  });

  return element;
}

function TimelineTime({ render, className, ...props }: TimelineTimeType) {
  const element = useRender({
    defaultTagName: "time",
    props: mergeProps<"time">(
      {
        className: cn("text-muted-foreground text-xs", className),
      },
      props,
    ),
    render,
    state: {
      slot: "timeline-time",
    },
  });

  return element;
}

export {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
};
