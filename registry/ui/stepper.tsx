import { Button } from "@/components/ui/button";
import { useAsRef } from "@/hooks/use-as-ref";
import useIsomorphicLayoutEffect from "@/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/hooks/use-lazy-ref";
import { cn } from "@/lib/utils";
import { useRender } from "@base-ui/react";
import { mergeProps } from "@base-ui/react/merge-props";
import { Check } from "lucide-react";
import { ComponentProps, createContext, MouseEvent, ReactNode, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

type StepStateType = {
  value: string;
  completed: boolean;
  disabled: boolean;
};

type StoreStateType = {
  steps: Map<string, StepStateType>;
  currentStep: string;
};

type Store = {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreStateType;
  notify: () => void;
  addStep: (value: string, completed: boolean, disabled: boolean) => void;
  removeStep: (value: string) => void;
  setStep: (value: string, completed: boolean, disabled: boolean) => void;
  setState: <K extends keyof StoreStateType>(key: K, value: StoreStateType[K]) => void;
};

type OrientationType = "horizontal" | "vertical";

type DataStateType = "inactive" | "active" | "completed";

type StepperContextType = {
  orientation: OrientationType;
};

type StepperType = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: OrientationType;
} & ComponentProps<"div"> &
  useRender.ComponentProps<"div">;

type StepperListType = useRender.ComponentProps<"div"> & ComponentProps<"div">;

type StepperItemContextType = {
  value: string;
  stepState: StepStateType | undefined;
};

type StepperItemType = {
  value: string;
  completed?: boolean;
  disabled?: boolean;
} & useRender.ComponentProps<"div"> &
  ComponentProps<"div">;

type StepperTriggerType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

type StepperIndicatorType = {
  children?: React.ReactNode | ((dataState: DataStateType) => ReactNode);
} & Omit<useRender.ComponentProps<"div">, "children"> &
  Omit<ComponentProps<"div">, "children">;

type StepperSeparatorType = {
  forceMount?: boolean;
} & useRender.ComponentProps<"div"> &
  ComponentProps<"div">;

type StepperTitleType = useRender.ComponentProps<"span"> & ComponentProps<"span">;

type StepperDescriptionType = useRender.ComponentProps<"span"> & ComponentProps<"span">;

type StepperContentType = { value: string; forceMount?: boolean } & useRender.ComponentProps<"div"> & ComponentProps<"div">;

type StepperPrevType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

type StepperNextType = useRender.ComponentProps<"button"> & ComponentProps<"button">;

const ROOT_NAME = "Stepper";
const ITEM_NAME = "StepperItem";

function getDataState(
  value: string | undefined,
  itemValue: string,
  stepState: StepStateType | undefined,
  steps: Map<string, StepStateType>,
  variant: "item" | "separator" = "item",
): DataStateType {
  const stepKeys = Array.from(steps.keys());
  const currentIndex = stepKeys.indexOf(itemValue);

  if (stepState?.completed) return "completed";

  if (value === itemValue) {
    return variant === "separator" ? "inactive" : "active";
  }

  if (value) {
    const activeIndex = stepKeys.indexOf(value);

    if (activeIndex > currentIndex) return "completed";
  }

  return "inactive";
}

const StoreContext = createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreStateType) => T) {
  const store = useStoreContext("useStore");

  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

const StepperContext = createContext<StepperContextType | null>(null);

function useStepperContext(consumerName: string) {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function Stepper({ render, value, defaultValue, onValueChange, orientation = "horizontal", className, ...props }: StepperType) {
  const stateRef = useLazyRef<StoreStateType>(() => ({
    steps: new Map(),
    currentStep: value ?? defaultValue ?? "",
  }));

  const propsRef = useAsRef({
    onValueChange,
  });

  const listenersRef = useLazyRef(() => new Set<() => void>());

  const store = useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
      addStep: (value, completed, disabled) => {
        const newStep: StepStateType = { value, completed, disabled };
        stateRef.current.steps.set(value, newStep);
        store.notify();
      },
      removeStep: (value) => {
        stateRef.current.steps.delete(value);
        store.notify();
      },
      setStep: (value, completed, disabled) => {
        const step = stateRef.current.steps.get(value);
        if (step) {
          const updatedStep: StepStateType = { ...step, completed, disabled };
          stateRef.current.steps.set(value, updatedStep);

          store.notify();
        }
      },
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "currentStep" && typeof value === "string") {
          stateRef.current.currentStep = value;
          propsRef.current.onValueChange?.(value);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.setState("currentStep", value);
    }
  }, [value]);

  const context = useMemo<StepperContextType>(
    () => ({
      orientation,
    }),
    [orientation],
  );

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        className: cn("flex gap-6", orientation === "horizontal" ? "w-full flex-col" : "flex-row", className),
      },
      props,
    ),
    state: {
      slot: "stepper",
      orientation,
    },
  });

  return (
    <StoreContext value={store}>
      <StepperContext value={context}>{element}</StepperContext>
    </StoreContext>
  );
}

function StepperList({ render, className, ...props }: StepperListType) {
  const { orientation } = useStepperContext("StepperList");

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps(
      {
        className: cn(
          "flex outline-none",
          orientation === "horizontal" ? "flex-row items-center overflow-x-auto" : "flex-col items-start",
          className,
        ),
      },
      props,
    ),
    state: {
      slot: "stepper-list",
      orientation,
    },
  });

  return element;
}

const StepperItemContext = createContext<StepperItemContextType | null>(null);

function useStepperItemContext(consumerName: string) {
  const context = useContext(StepperItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

function StepperItem({ render, value: itemValue, completed = false, disabled = false, className, children, ...props }: StepperItemType) {
  const store = useStoreContext(ITEM_NAME);
  const { orientation } = useStepperContext(ITEM_NAME);

  const currentStep = useStore((state) => state.currentStep);

  useIsomorphicLayoutEffect(() => {
    store.addStep(itemValue, completed, disabled);
    return () => {
      store.removeStep(itemValue);
    };
  }, [itemValue, completed, disabled]);

  useIsomorphicLayoutEffect(() => {
    store.setStep(itemValue, completed, disabled);
  }, [itemValue, completed, disabled]);

  const stepState = useStore((state) => state.steps.get(itemValue));
  const steps = useStore((state) => state.steps);
  const dataState = getDataState(currentStep, itemValue, stepState, steps);

  const context = useMemo<StepperItemContextType>(
    () => ({
      value: itemValue,
      stepState,
    }),
    [itemValue, stepState],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "relative flex not-last:flex-1 items-center",
          orientation === "horizontal" ? "flex-row shrink-0 min-w-fit" : "flex-col",
          className,
        ),
        children,
      },
      props,
    ),
    render,
    state: {
      slot: "stepper-item",
      disabled: stepState?.disabled ? "" : undefined,
      orientation,
      state: dataState,
    },
  });

  return <StepperItemContext value={context}>{element}</StepperItemContext>;
}

function StepperTrigger({ render, className, onClick: onClickProp, disabled, ...props }: StepperTriggerType) {
  const { orientation } = useStepperContext("StepperTrigger");
  const itemContext = useStepperItemContext("StepperTrigger");
  const store = useStoreContext("StepperTrigger");

  const itemValue = itemContext.value;

  const currentStep = useStore((state) => state.currentStep);
  const steps = useStore((state) => state.steps);
  const stepState = useStore((state) => state.steps.get(itemValue));

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const stepIndex = Array.from(steps.keys()).indexOf(itemValue);
  const stepPosition = stepIndex + 1;
  const stepCount = steps.size;
  const isDisabled = disabled || stepState?.disabled;
  const isActive = currentStep === itemValue;

  const dataState = getDataState(currentStep, itemValue, stepState, steps);

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented) return;
      if (!isDisabled) {
        store.setState("currentStep", itemValue);
      }
    },
    [isDisabled, itemValue, propsRef, store],
  );

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps(
      // eslint-disable-next-line react-hooks/refs
      {
        "type": "button",
        "aria-current": isActive ? "step" : undefined,
        "aria-selected": isActive,
        "aria-setsize": stepCount,
        "aria-posinset": stepPosition,
        "disabled": isDisabled,
        "className": cn(
          "inline-flex items-center justify-center gap-3 rounded-md text-left outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          orientation === "vertical" ? "not-last:pb-6" : undefined,
          className,
        ),
        onClick,
      },
      props,
    ),
    state: {
      slot: "stepper-trigger",
      disabled: isDisabled ? "" : undefined,
      state: dataState,
    },
  });

  return element;
}

function StepperIndicator({ render, className, children, ...props }: StepperIndicatorType) {
  const itemContext = useStepperItemContext("StepperIndicator");

  const currentStep = useStore((state) => state.currentStep);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));
  const steps = useStore((state) => state.steps);

  const stepPosition = Array.from(steps.keys()).indexOf(itemValue) + 1;
  const dataState = getDataState(currentStep, itemValue, stepState, steps);
  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-background font-medium text-muted-foreground text-sm transition-colors data-[state=active]:border-primary data-[state=completed]:border-primary data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
          className,
        ),
        children:
          typeof children === "function" ? (
            children(dataState)
          ) : children ? (
            children
          ) : dataState === "completed" ? (
            <Check className="size-4" />
          ) : (
            stepPosition
          ),
      },
      props,
    ),
    render,
    state: {
      slot: "stepper-indicator",
      state: dataState,
    },
  });

  return element;
}

function StepperSeparator({ render, forceMount = false, className, ...props }: StepperSeparatorType) {
  const { orientation } = useStepperContext("StepperSeparator");
  const itemContext = useStepperItemContext("StepperSeparator");
  const currentStep = useStore((state) => state.currentStep);
  const steps = useStore((state) => state.steps);

  const stepIndex = Array.from(steps.keys()).indexOf(itemContext.value);
  const isLastStep = stepIndex === steps.size - 1;

  const dataState = getDataState(currentStep, itemContext.value, itemContext.stepState, steps, "separator");

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "role": "separator",
        "aria-hidden": "true",
        "aria-orientation": orientation,
        "className": cn(
          "bg-border transition-colors data-[state=active]:bg-primary data-[state=completed]:bg-primary",
          orientation === "horizontal" ? "h-px flex-1" : "h-10 w-px",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "stepper-separator",
      orientation,
      state: dataState,
    },
  });

  if (isLastStep && !forceMount) return null;

  return element;
}

function StepperTitle({ render, className, ...props }: StepperTitleType) {
  const element = useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn("font-medium text-sm", className),
      },
      props,
    ),
    render,
    state: {
      slot: "title",
    },
  });

  return element;
}

function StepperDescription({ render, className, ...props }: StepperDescriptionType) {
  const element = useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn("text-muted-foreground text-xs", className),
      },
      props,
    ),
    render,
    state: {
      slot: "description",
    },
  });

  return element;
}

function StepperContent({ render, value: valueProp, forceMount = false, className, ...props }: StepperContentType) {
  const currentStep = useStore((state) => state.currentStep);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "tabpanel",
        className: cn("flex-1 outline-none", className),
      },
      props,
    ),
    render,
    state: {
      slot: "stepper-content",
    },
  });

  if (valueProp !== currentStep && !forceMount) return null;

  return element;
}

function StepperPrev({ render = <Button />, onClick: onClickProp, disabled, ...props }: StepperPrevType) {
  const store = useStoreContext("StepperPrev");
  const currentStep = useStore((state) => state.currentStep);
  const steps = useStore((state) => state.steps);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const stepKeys = Array.from(steps.keys());
  const currentIndex = currentStep ? stepKeys.indexOf(currentStep) : -1;
  const isDisabled = disabled || currentIndex <= 0;

  const onClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;

      const prevIndex = Math.max(currentIndex - 1, 0);
      const prevStepValue = stepKeys[prevIndex];

      if (prevStepValue) {
        store.setState("currentStep", prevStepValue);
      }
    },
    [propsRef, isDisabled, currentIndex, stepKeys, store],
  );

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      // eslint-disable-next-line react-hooks/refs
      {
        type: "button",
        disabled: isDisabled,
        onClick,
      },
      props,
    ),
    state: {
      slot: "stepper-prev",
    },
  });

  return element;
}

function StepperNext({ render = <Button />, onClick: onClickProp, disabled, ...props }: StepperNextType) {
  const store = useStoreContext("StepperNext");
  const currentStep = useStore((state) => state.currentStep);
  const steps = useStore((state) => state.steps);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const stepKeys = Array.from(steps.keys());
  const currentIndex = currentStep ? stepKeys.indexOf(currentStep) : -1;
  const isDisabled = disabled || currentIndex >= stepKeys.length - 1;

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;

      const nextIndex = Math.min(currentIndex + 1, stepKeys.length - 1);
      const nextStepValue = stepKeys[nextIndex];

      if (nextStepValue) {
        store.setState("currentStep", nextStepValue);
      }
    },
    [propsRef, isDisabled, currentIndex, stepKeys, store],
  );

  const element = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      // eslint-disable-next-line react-hooks/refs
      {
        type: "button",
        disabled: isDisabled,
        onClick,
      },
      props,
    ),
    render,
    state: {
      slot: "stepper-next",
    },
  });

  return element;
}

export {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  type StepperType,
};
