import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { useRender } from "@base-ui/react/use-render";
import { Archive } from "lucide-react";
import { ComponentProps, ReactNode } from "react";

type NoticationType = ComponentProps<typeof DropdownMenu>;
type NotificationHeaderType = ComponentProps<"div"> & useRender.ComponentProps<"div">;
type NotificationTriggerType = { children?: ReactNode } & Omit<ComponentProps<"button">, "children"> &
  Omit<useRender.ComponentProps<"button">, "children">;
type NotificationIndicatorType = ComponentProps<"div"> & useRender.ComponentProps<"div">;
type NotificationSeparatorType = SeparatorPrimitive.Props;
type NotificationContentType = ComponentProps<typeof DropdownMenuContent>;
type NotificationItemType = ComponentProps<"div"> & useRender.ComponentProps<"div">;
type NotificationItemContentType = ComponentProps<"div"> & useRender.ComponentProps<"div">;
type NotificationItemTriggerType = ComponentProps<"button"> & useRender.ComponentProps<"button">;
type NotificationItemTitleType = ComponentProps<"span"> & useRender.ComponentProps<"span">;
type NotificationItemDescriptionType = ComponentProps<"span"> & useRender.ComponentProps<"span">;
type NotificationItemTimestampType = ComponentProps<"span"> & useRender.ComponentProps<"span">;
type NotificationItemTrailingType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

function Notification({ children, ...props }: NoticationType) {
  return <DropdownMenu {...props}>{children}</DropdownMenu>;
}

function NotificationHeader({ render, className, ...props }: NotificationHeaderType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex items-baseline justify-between gap-4 px-3 py-2", className),
      },
      props,
    ),
    state: {
      slot: "notification-header",
    },
  });

  return element;
}

function NotificationTrigger({ render = <Button size="icon" variant="ghost" />, className, children, ...props }: NotificationTriggerType) {
  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        "aria-label": "Open notifications",
        "className": cn("relative size-8 rounded-full text-muted-foreground shadow-none", className),
      },
      props,
    ),
    state: {
      slot: "notification-trigger",
    },
  });

  return <DropdownMenuTrigger render={element}>{children}</DropdownMenuTrigger>;
}

function NotificationIndicator({ render, className, ...props }: NotificationIndicatorType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "aria-hidden": "true",
        "className": cn("absolute top-0.5 right-0.5 size-1 rounded-full bg-primary", className),
      },
      props,
    ),
    state: {
      slot: "notification-indicator",
    },
  });

  return element;
}

function NotificationSeparator({ className, ...props }: NotificationSeparatorType) {
  return <Separator {...props} className={cn("mb-1", className)} />;
}

function NotificationContent({ className, align = "end", side = "bottom", children }: NotificationContentType) {
  return (
    <DropdownMenuContent className={cn("w-70 p-0.5 gap-0", className)} align={align} side={side}>
      {children}
    </DropdownMenuContent>
  );
}

function NotificationItem({ render, className, ...props }: NotificationItemType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        className: cn("rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent relative flex items-start pe-3", className),
      },
      props,
    ),
    state: {
      slot: "notification-item",
    },
  });

  return element;
}

function NotificationItemContent({ render, className, ...props }: NotificationItemContentType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        className: cn("flex-1 space-y-1", className),
      },
      props,
    ),
    state: {
      slot: "notification-item-content",
    },
  });

  return element;
}

function NotificationItemTrigger({ render, className, ...props }: NotificationItemTriggerType) {
  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        className: cn("text-left text-foreground/80 after:absolute after:inset-0", className),
      },
      props,
    ),
    state: {
      slot: "notification-item-trigger",
    },
  });

  return element;
}

function NotificationItemTitle({ render, className, ...props }: NotificationItemTitleType) {
  const element = useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: cn("font-medium text-foreground hover:underline", className),
      },
      props,
    ),
    state: {
      slot: "notification-item-title",
    },
  });

  return element;
}

function NotificationItemDescription({ render, className, ...props }: NotificationItemDescriptionType) {
  const element = useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: cn("font-sm text-foreground hover:underline", className),
      },
      props,
    ),
    state: {
      slot: "notification-item-description",
    },
  });

  return element;
}

function NotificationItemTimestamp({ render, className, ...props }: NotificationItemTimestampType) {
  const element = useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: cn("text-muted-foreground text-xs", className),
      },
      props,
    ),
    state: {
      slot: "notification-item-timestamp",
    },
  });

  return element;
}

function NotificationItemTrailing({ render, className, ...props }: NotificationItemTrailingType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("absolute inset-e-0 self-center", className),
      },
      props,
    ),
    state: {
      slot: "notification-item-trailing",
    },
  });

  return element;
}

function NotificationEmptyState() {
  return (
    <span className="flex-1 flex justify-center items-center py-3">
      <div className="text-muted-foreground flex flex-col items-center gap-2">
        <div className="bg-muted rounded-full p-3">
          <Archive />
        </div>

        <span className="text-foreground text-sm font-semibold">No notifications</span>
      </div>
    </span>
  );
}

export {
  Notification,
  NotificationContent,
  NotificationEmptyState,
  NotificationHeader,
  NotificationIndicator,
  NotificationItem,
  NotificationItemContent,
  NotificationItemDescription,
  NotificationItemTimestamp,
  NotificationItemTitle,
  NotificationItemTrailing,
  NotificationItemTrigger,
  NotificationSeparator,
  NotificationTrigger,
};

// <DropdownMenuTrigger
//   render={
//     <Button
//       aria-label="Open notifications"
//       className="relative size-8 rounded-full text-muted-foreground shadow-none"
//       size="icon"
//       variant="ghost"
//     />
//   }
// >
//   <BellIcon aria-hidden="true" size={16} />
//   <div aria-hidden="true" className="absolute top-0.5 right-0.5 size-1 rounded-full bg-primary" />
// </DropdownMenuTrigger>
// <DropdownMenuContent className="w-70 p-0.5 gap-0" align="end" side="bottom">
//   {/*Header*/}
//   <div className="flex items-baseline justify-between gap-4 px-3 py-2">
//     <div className="font-semibold text-sm">Notifications</div>
//     <button className="font-medium text-xs hover:underline" type="button">
//       Mark all as read
//     </button>
//   </div>

//   <Separator className="mb-1" />

//   <span className="flex-1 flex justify-center items-center py-3">
//     <div className="text-muted-foreground flex flex-col items-center gap-2">
//       {/*icon*/}
//       <div className="bg-muted rounded-full p-3">
//         <Archive />
//       </div>

//       <span className="text-foreground text-sm font-semibold">No notifications</span>
//     </div>
//   </span>
// </DropdownMenuContent>
