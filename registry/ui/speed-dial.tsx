import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRender } from "@base-ui/react";
import { mergeProps } from "@base-ui/react/merge-props";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { ComponentProps, createContext, Dispatch, MouseEvent, ReactNode, SetStateAction, useContext, useState } from "react";

type SpeedDialType = {
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  onSelectClose?: boolean;
  children?: ReactNode;
};

type SpeedDialContextValueType = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSelectClose: boolean;
};

type SpeedDialTriggerType = {
  openOnHover?: boolean;
} & ComponentProps<"button"> &
  useRender.ComponentProps<"button">;

type SpeedDialContentType = { orientation?: "horizontal" | "vertical" } & PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">;

type SpeedDialItemType = ComponentProps<"button"> & useRender.ComponentProps<"button">;

const ROOT_NAME = "SpeedDial";

const SpeedDialContext = createContext<SpeedDialContextValueType | null>(null);

function useSpeedDialContext(consumerName: string) {
  const context = useContext(SpeedDialContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function SpeedDial({ open, setOpen, children, onSelectClose = true }: SpeedDialType) {
  const [openState, setOpenState] = useState(open ?? false);
  const isOpen = open ?? openState;
  const setOpenFn = setOpen ?? setOpenState;

  const context = { open: isOpen, setOpen: setOpenFn, onSelectClose };
  return (
    <SpeedDialContext value={context}>
      <Popover open={isOpen} onOpenChange={setOpenFn}>
        {children}
      </Popover>
    </SpeedDialContext>
  );
}

function SpeedDialTrigger({ render = <Button variant="default" />, openOnHover = false, className, ...props }: SpeedDialTriggerType) {
  const { open } = useSpeedDialContext("SpeedDialTrigger");

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        className: cn("size-10 rounded-full transition-transform duration-200 ease-out", className),
      },
      props,
    ),
    state: {
      slot: "speed-dial-trigger",
      state: open ? "open" : "closed",
    },
  });
  return <PopoverTrigger render={element} openOnHover={openOnHover} />;
}

function SpeedDialContent({ className, orientation = "vertical", side = "top", align = "center", ...props }: SpeedDialContentType) {
  return (
    <PopoverContent
      className={cn(
        "flex items-center gap-2 justify-center bg-transparent w-fit ring-0 p-0.5",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      side={side}
      align={align}
      {...props}
    />
  );
}

function SpeedDialItem({ render = <Button variant="outline" />, className, onClick, ...props }: SpeedDialItemType) {
  const { setOpen, onSelectClose } = useSpeedDialContext("SpeedDialItem");

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        className: cn("size-10 rounded-full", className),
        onClick: (e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (onSelectClose) setOpen(false);
        },
      },
      props,
    ),
  });
  return element;
}

export { SpeedDial, SpeedDialContent, SpeedDialItem, SpeedDialTrigger };
