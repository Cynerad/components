import { useAsRef } from "@/hooks/use-as-ref";
import { useComposedRefs } from "@/hooks/use-composed-refs";
import useIsomorphicLayoutEffect from "@/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/hooks/use-lazy-ref";
import { cn } from "@/lib/utils";
import { useDirection } from "@base-ui/react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Star } from "lucide-react";
import {
  AriaRole,
  ComponentProps,
  createContext,
  CSSProperties,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { HiddenInput } from "./hidden-input";

type DirectionType = "ltr" | "rtl";
type OrientationType = "horizontal" | "vertical";
type SizeType = "default" | "sm" | "lg";
type StepType = 0.5 | 1;
type DataStateType = "full" | "partial" | "empty";

type StoreStateType = {
  value: number;
  hoveredValue: number | null;
};

type StoreType = {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreStateType;
  setState: <K extends keyof StoreStateType>(key: K, value: StoreStateType[K]) => void;
  notify: () => void;
};

type RootElement = HTMLDivElement;
type ItemElement = HTMLButtonElement;

type RatingContextValue = {
  rootId: string;
  orientation: OrientationType;
  size: SizeType;
  max: number;
  step: StepType;
  clearable: boolean;
  disabled: boolean;
  readOnly: boolean;
  direction: DirectionType;
  getAutoIndex: (instanceId: string) => number;
};

const ROOT_NAME = "Rating";
const ITEM_NAME = "RatingItem";

function getItemId(id: string, value: number) {
  return `${id}-item-${value}`;
}

function getPartialFillGradientId(id: string, step: StepType) {
  return `partial-fill-gradient-${id}-${step}`;
}

const StoreContext = createContext<StoreType | null>(null);
function useStoreContext(consumerName: string) {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}
function useStore<T>(selector: (state: StoreStateType) => T, ogStore?: StoreType | null): T {
  const contextStore = useContext(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

const RatingContext = createContext<RatingContextValue | null>(null);
function useRatingContext(consumerName: string) {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

type RatingType = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max?: number;
  dir?: DirectionType;
  orientation?: OrientationType;
  size?: SizeType;
  step?: StepType;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
} & ComponentProps<"div"> &
  useRender.ComponentProps<"div">;

function Rating({
  render,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onHover,
  dir: dirProp,
  orientation = "horizontal",
  size = "default",
  max = 5,
  step = 1,
  clearable = false,
  disabled = false,
  readOnly = false,
  required = false,
  className,
  id,
  name,
  ref,
  ...props
}: RatingType) {
  const contextDir = useDirection();
  const direction = dirProp ?? contextDir;

  const instanceId = useId();
  const rootId = id ?? instanceId;

  const stateRef = useLazyRef<StoreStateType>(() => ({
    value: valueProp ?? defaultValue,
    hoveredValue: null,
  }));

  const propsRef = useAsRef({
    onValueChange,
    onHover,
    step,
  });

  const autoIndexMapRef = useRef(new Map<string, number>());
  const nextAutoIndexRef = useRef(0);
  const getAutoIndex = useCallback((instanceId: string) => {
    const existingIndex = autoIndexMapRef.current.get(instanceId);
    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const newIndex = nextAutoIndexRef.current++;
    autoIndexMapRef.current.set(instanceId, newIndex);
    return newIndex;
  }, []);

  const listenersRef = useLazyRef(() => new Set<() => void>());

  const store = useMemo<StoreType>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "value" && typeof value === "number") {
          stateRef.current.value = value;
          propsRef.current.onValueChange?.(value);
        } else if (key === "hoveredValue") {
          stateRef.current.hoveredValue = value as number | null;
          propsRef.current.onHover?.(value as number | null);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp]);

  const value = useStore((state) => state.value, store);

  const [formTrigger, setFormTrigger] = useState<RootElement | null>(null);

  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const context = useMemo<RatingContextValue>(
    () => ({
      rootId,
      orientation,
      disabled,
      readOnly,
      size,
      max,
      step,
      clearable,
      getAutoIndex,
      direction,
    }),
    [rootId, orientation, disabled, readOnly, size, max, step, clearable, getAutoIndex, direction],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "id": rootId,
        "role": "radiogroup" as React.AriaRole,
        "aria-orientation": orientation,
        "ref": composedRef,
        "className": cn(
          "flex gap-1 text-primary outline-none",
          orientation === "horizontal" ? "flex-row items-center" : "flex-col items-start",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "rating",
      orientation,
      ...(disabled && { disabled: "" }),
      ...(readOnly && { readonly: "" }),
    },
  });

  return (
    <StoreContext value={store}>
      <RatingContext value={context}>
        {element}

        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id={getPartialFillGradientId(rootId, step)}>
              {direction === "rtl" ? (
                <>
                  <stop offset="50%" stopColor="transparent" />
                  <stop offset="50%" stopColor="currentColor" />
                </>
              ) : (
                <>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>

        {isFormControl && (
          <HiddenInput
            type="hidden"
            // control={formTrigger}
            name={name}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </RatingContext>
    </StoreContext>
  );
}

type RatingItemType = {
  children?: React.ReactNode | ((dataState: DataStateType) => ReactNode);
  index?: number;
} & Omit<ComponentProps<"button">, "children"> &
  Omit<useRender.ComponentProps<"button">, "children">;

function RatingItem({
  index,
  render,
  onClick: onClickProp,
  onMouseEnter: onMouseEnterProp,
  onMouseMove: onMouseMoveProp,
  onMouseLeave: onMouseLeaveProp,
  disabled,
  className,
  children,
  style: styleProp,
  ref,
  ...props
}: RatingItemType) {
  const store = useStoreContext(ITEM_NAME);
  const context = useRatingContext(ITEM_NAME);

  const itemRef = useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);

  const instanceId = useId();

  const actualIndex = useMemo(() => {
    if (index !== undefined) {
      return index;
    }

    return context.getAutoIndex(instanceId);
  }, [index, context, instanceId]);

  const itemValue = actualIndex + 1;
  const value = useStore((state) => state.value);
  const hoveredValue = useStore((state) => state.hoveredValue);
  const clearable = context.clearable;
  const step = context.step;

  const itemId = getItemId(context.rootId, itemValue);
  const isDisabled = context.disabled || !!disabled;
  const isReadOnly = context.readOnly;

  const displayValue = hoveredValue ?? value;
  const isFilled = displayValue >= itemValue;

  const isPartiallyFilled = step < 1 && displayValue >= itemValue - step && displayValue < itemValue;
  const isHovered = hoveredValue !== null && hoveredValue < itemValue;

  const propsRef = useAsRef({
    onClick: onClickProp,
    onMouseEnter: onMouseEnterProp,
    onMouseMove: onMouseMoveProp,
    onMouseLeave: onMouseLeaveProp,
  });

  const onClick = useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly) {
        let newValue = itemValue;

        if (step < 1) {
          const rect = event.currentTarget.getBoundingClientRect();
          const clickX = event.clientX - rect.left;
          const isLeftHalf = clickX < rect.width / 2;

          if (context.direction === "rtl") {
            if (!isLeftHalf) {
              newValue = itemValue - step;
            }
          } else {
            if (isLeftHalf) {
              newValue = itemValue - step;
            }
          }
        }

        if (clearable && value === newValue) {
          newValue = 0;
        }

        store.setState("value", newValue);
      }
    },
    [isDisabled, isReadOnly, clearable, step, value, itemValue, store, context.direction, propsRef],
  );

  const onMouseEnter = useCallback(
    (event: MouseEvent<ItemElement>) => {
      propsRef.current.onMouseEnter?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly) {
        let hoverValue = itemValue;

        if (step < 1) {
          const rect = event.currentTarget.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const isLeftHalf = mouseX < rect.width / 2;

          if (context.direction === "rtl") {
            if (!isLeftHalf) {
              hoverValue = itemValue - step;
            }
          } else {
            if (isLeftHalf) {
              hoverValue = itemValue - step;
            }
          }
        }

        store.setState("hoveredValue", hoverValue);
      }
    },
    [isDisabled, isReadOnly, step, itemValue, store, context.direction, propsRef],
  );

  const onMouseLeave = useCallback(
    (event: MouseEvent<ItemElement>) => {
      propsRef.current.onMouseLeave?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly) {
        store.setState("hoveredValue", null);
      }
    },
    [isDisabled, isReadOnly, store, propsRef],
  );

  const onMouseMove = useCallback(
    (event: MouseEvent<ItemElement>) => {
      propsRef.current.onMouseMove?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly && step < 1) {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const isLeftHalf = mouseX < rect.width / 2;

        let hoverValue = itemValue;
        if (context.direction === "rtl") {
          hoverValue = !isLeftHalf ? itemValue - step : itemValue;
        } else {
          hoverValue = isLeftHalf ? itemValue - step : itemValue;
        }

        store.setState("hoveredValue", hoverValue);
      }
    },
    [isDisabled, isReadOnly, step, itemValue, store, context.direction, propsRef],
  );

  const dataState: DataStateType = isFilled ? "full" : isPartiallyFilled ? "partial" : "empty";

  const resolvedChildren = typeof children === "function" ? children(dataState) : (children ?? <Star />);

  const element = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      // eslint-disable-next-line react-hooks/refs
      {
        "role": "radio" as AriaRole,
        "type": "button" as const,
        "id": itemId,
        "aria-checked": isFilled,
        "aria-posinset": itemValue,
        "aria-setsize": context.max,
        "disabled": isDisabled,
        "style": {
          ...styleProp,
          ...(isPartiallyFilled && {
            "--partial-fill": `url(#${getPartialFillGradientId(context.rootId, step)})`,
          }),
        } as CSSProperties,
        "ref": composedRef,
        "className": cn(
          "inline-flex items-center justify-center rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          "[&_svg:not([class*='size-'])]:size-full [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-colors [&_svg]:duration-200 data-[state=empty]:[&_svg]:fill-transparent data-[state=full]:[&_svg]:fill-current data-[state=partial]:[&_svg]:fill-(--partial-fill)",
          context.size === "sm" ? "size-4" : context.size === "lg" ? "size-6" : "size-5",
          className,
        ),
        onClick,
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
        "children": resolvedChildren,
      },
      props,
    ),
    render,
    state: {
      slot: "rating-item",
      state: dataState,
      ...(isDisabled && { disabled: "" }),
      ...(isReadOnly && { readonly: "" }),
      ...(isHovered && { hovered: "" }),
    },
  });

  return element;
}

export { Rating, RatingItem, useStore as useRating };
