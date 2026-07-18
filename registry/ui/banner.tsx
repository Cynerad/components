"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { ComponentProps, createContext, MouseEvent, ReactNode, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ROOT_NAME = "Banner";

const bannerVariants = cva(
  "w-full pointer-events-auto relative flex flex-col sm:flex-row justify-between sm:items-center items-start gap-3 border-b px-3 py-2 text-sm motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50",
        success: "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50",
        warning: "bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50",
        destructive: "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BannerActionType = {
  id?: string;
  content: ReactNode;
} & VariantProps<typeof bannerVariants>;

type BannerContextType = {
  id?: string;
  open: boolean;
  handleOpen: () => void;
  handleClose: () => void;
};

type BannerType = {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
} & ComponentProps<"div"> &
  useRender.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants>;

const BannerContext = createContext<BannerContextType | null>(null);

function useBannerContext(consumerName: string) {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

type BannerStoreType = {
  id: string;
  content: ReactNode;
} & VariantProps<typeof bannerVariants>;

let banners: BannerStoreType[] = [];
type Listener = (banners: BannerStoreType[]) => void;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener(banners));
}

const bannerStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getBanners: () => banners,
};

function banner({ content, variant = "default" }: BannerActionType) {
  const id = crypto.randomUUID();
  banners = [...banners, { id, content, variant }];
  notify();
  return id;
}

function dismissBanner(id: string) {
  banners = banners.filter((b) => b.id !== id);
  notify();
}

type BannerStrategyType = "fixed" | "static" | "sticky" | "absolute";
type BannerSideType = "top" | "bottom";
type BannersType = {
  side?: BannerSideType;
  strategy?: BannerStrategyType;
  container?: Element | DocumentFragment | null;
} & ComponentProps<"div">;

type BannerCloseType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

type BannerIconType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

type BannerContentType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

type BannerTitleType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

type BannerDescriptionType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

type BannerButtonType = { onOpenDismiss?: boolean } & useRender.ComponentProps<"button"> & ComponentProps<"button">;

type BannerActionsType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

type BannerContainerType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

function Banners({ container: containerProp, side = "top", strategy = "fixed", className, children, ...props }: BannersType) {
  const [banners, setBanners] = useState(bannerStore.getBanners());
  useEffect(() => bannerStore.subscribe(setBanners), []);

  const withPortal = strategy === "fixed" || strategy === "absolute";
  const container = withPortal ? (containerProp ?? globalThis.document?.body ?? null) : null;

  const bannerContainer = banners.length > 0 && (
    <div
      data-slot="banner-container"
      data-side={side}
      data-strategy={strategy}
      className={cn(
        "pointer-events-none right-0 left-0 isolate z-50",
        strategy === "fixed" && "fixed",
        strategy === "static" && "relative",
        strategy === "sticky" && "sticky",
        strategy === "absolute" && "absolute",
        side === "top" ? "top-0" : "bottom-0",
        className,
      )}
      {...props}
    >
      {banners.map((banner) => (
        <Banner key={banner.id} id={banner.id} variant={banner.variant}>
          {banner.content}
        </Banner>
      ))}
    </div>
  );
  if (!banners.length) return null;

  return (
    <>
      {strategy === "static" || strategy === "sticky" ? (
        <>
          {side === "top" && bannerContainer}
          {children}
          {side === "bottom" && bannerContainer}
        </>
      ) : (
        <>
          {children}
          {container && bannerContainer && createPortal(bannerContainer, container)}
        </>
      )}
    </>
  );
}

function Banner({ id, open: openProp, defaultOpen, onOpenChange, render, variant, className, ...props }: BannerType) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? true);
  const open = isControlled ? openProp : internalOpen;

  function handleOpen() {
    if (!isControlled) setInternalOpen(true);
    onOpenChange?.(true);
  }

  function handleClose() {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  }

  const context = {
    open,
    handleOpen,
    handleClose,
    id,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(bannerVariants({ variant }), className),
      },
      props,
    ),
    state: {
      slot: "banner",
    },
  });

  if (!open) return null;

  return <BannerContext value={context}>{element}</BannerContext>;
}

function BannerClose({ render = <Button variant="outline" size="sm" />, onClick, className, children, ...props }: BannerCloseType) {
  const { id, handleClose } = useBannerContext("BannerClose");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    handleClose();

    if (id) {
      dismissBanner(id);
    }
  }

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        className: cn("w-full sm:w-auto p-1", className),
        type: "button",
        onClick: handleClick,
        children: children ?? <X className="size-3.5" />,
      },
      props,
    ),
    state: {
      slot: "banner-close",
    },
  });

  return element;
}

function BannerBody({ render, className, ...props }: BannerContainerType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-center w-full", className),
      },
      props,
    ),
    state: {
      slot: "banner-body",
    },
  });

  return element;
}

function BannerIcon({ render, className, ...props }: BannerIconType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex shrink-0 items-center [&>svg]:size-4", className),
      },
      props,
    ),
    state: {
      slot: "banner-icon",
    },
  });
  return element;
}

function BannerContent({ render, className, ...props }: BannerContentType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        className: cn("flex min-w-0 flex-1 flex-col gap-1", className),
      },
      props,
    ),
    state: {
      slot: "banner-content",
    },
  });

  return element;
}

function BannerTitle({ render, className, ...props }: BannerTitleType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("font-medium text-sm leading-none", className),
      },
      props,
    ),
    state: {
      slot: "banner-title",
    },
  });

  return element;
}

function BannerDescription({ render, className, ...props }: BannerDescriptionType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("text-xs opacity-90", className),
      },
      props,
    ),
    state: {
      slot: "banner-description",
    },
  });

  return element;
}

function BannerActions({ render, className, ...props }: BannerActionsType) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col sm:flex-row sm:justify-end items-end gap-1 w-full", className),
      },
      props,
    ),
    state: {
      slot: "banner-actions",
    },
  });

  return element;
}

function BannerButton({ render = <Button />, onOpenDismiss, onClick, className, ...props }: BannerButtonType) {
  const { id, handleClose } = useBannerContext("BannerButton");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!onOpenDismiss) return;
    handleClose();
    onClick?.(event);
    if (id) {
      dismissBanner(id);
    }
  }
  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        type: "button",
        className: cn("w-full sm:w-auto p-1", className),
        onClick: handleClick,
      },
      props,
    ),
    state: {
      slot: "banner-button",
    },
  });

  return element;
}

export {
  Banner,
  banner,
  BannerActions,
  BannerButton,
  BannerClose,
  BannerBody as BannerContainer,
  BannerContent,
  BannerDescription,
  BannerIcon,
  Banners,
  BannerTitle,
};
