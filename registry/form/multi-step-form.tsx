"use client";

import React, {
  createContext,
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, CircleDot } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type StepStatus = "active" | "completed" | "inactive";

type StepType = {
  id: number;
  title: string;
  fields: string[];
  status: StepStatus;
  icon: (typeof iconNames)[number];
};

type StepContextType = {
  isLastStep: () => boolean;
  next: () => void;
  prev: () => void;
  steps: StepType[];
  setSteps: Dispatch<SetStateAction<StepType[]>>;
  getStepByTitle: (title: string) => StepType | undefined;
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  goToStep: (id: number) => void;
  form: UseFormReturn<FieldValues> | null;
  setFormData: (form: UseFormReturn) => void;
};

const IconsArray = {
  completed: CheckCircle,
  active: CircleDot,
  inactive: Lock,
};

const StatusDescribe = {
  completed: "Completed",
  active: "In Progress",
  inactive: "Pending",
};

const StepContext = createContext<null | StepContextType>(null);

function StepProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<StepType[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [form, setForm] = useState<UseFormReturn<FieldValues> | null>(null);

  function isLastStep(): boolean {
    return steps.length === currentStep;
  }

  function getStepByTitle(title: string): StepType | undefined {
    return steps.find((step) => step.title === title);
  }

  function getStepByID(id: number) {
    return steps.find((step) => step.id === id);
  }

  function setFormData<T extends FieldValues>(form: UseFormReturn<T>): void {
    setForm(form as UseFormReturn<FieldValues>);
  }

  async function next() {
    const step = getStepByID(currentStep);
    if (step) {
      const isValid = await form?.trigger(step.fields);

      if (!isValid) {
        return;
      }
    }

    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === currentStep) {
          return { ...step, status: "completed" };
        } else if (step.id === currentStep + 1) {
          return { ...step, status: "active" };
        }
        return step;
      }),
    );

    setCurrentStep((prevCurrentStep) => prevCurrentStep + 1);
  }

  async function goToStep(id: number) {
    if (id < 1 || id > steps.length) {
      return;
    }

    const stepsBeforeId = steps.filter((s) => {
      return s.id < id;
    });

    const validationResults = await Promise.all(
      stepsBeforeId.map(async (s) => {
        return await form?.trigger(s.fields);
      }),
    );

    const isValid = validationResults.every((result) => result === true);

    if (!isValid) return;

    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id < id) {
          return { ...step, status: "completed" };
        } else if (step.id === id) {
          return { ...step, status: "active" };
        } else {
          return { ...step, status: "inactive" };
        }
      }),
    );
    setCurrentStep(id);
  }

  function prev() {
    if (currentStep <= 1) return;
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === currentStep) {
          return { ...step, status: "inactive" };
        } else if (step.id === currentStep - 1) {
          return { ...step, status: "active" };
        }
        return step;
      }),
    );
    setCurrentStep((prevCurrentStep) => prevCurrentStep - 1);
  }

  const value = {
    isLastStep,
    next,
    prev,
    steps,
    setSteps,
    currentStep,
    setCurrentStep,
    getStepByTitle,
    goToStep,
    form,
    setFormData,
  };

  return <StepContext value={value}> {children}</StepContext>;
}

export function Steps<T extends FieldValues>({ form, children }: { form: UseFormReturn<T>; children: ReactNode }) {
  return (
    <>
      <StepProvider>
        <StepsWrapper form={form}>{children}</StepsWrapper>
      </StepProvider>
    </>
  );
}

export function StepsWrapper<T extends FieldValues>({ form, children }: { form: UseFormReturn<T>; children: ReactNode }) {
  const { setSteps, setFormData } = useContext(StepContext) as StepContextType;

  useEffect(() => {
    setFormData(form as UseFormReturn<FieldValues>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stepConfigs: StepType[] = [];

    React.Children.forEach(children, (child, index) => {
      if (React.isValidElement<StepComponentProps<T>>(child)) {
        const stepElement: React.ReactElement<StepComponentProps<T>> = child;

        stepConfigs.push({
          id: index + 1,
          title: stepElement.props.title,
          fields: stepElement.props.fields || [],
          status: index === 0 ? "active" : "inactive",
          icon: stepElement.props.icon,
        });
      }
    });

    setSteps(stepConfigs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Progress />
      {children}
      <Actions />
    </>
  );
}
type StepComponentProps<T extends FieldValues> = {
  title: string;
  icon: (typeof iconNames)[number];
  fields?: Path<T>[];
  children: ReactNode;
  className?: string;
};

export function Step<T extends FieldValues>({ title, children, className = "" }: StepComponentProps<T>) {
  const { currentStep, steps } = useContext(StepContext) as StepContextType;

  const stepIndex = useMemo(() => {
    const foundIndex = steps.findIndex((step) => step.title === title);
    return foundIndex !== -1 ? foundIndex + 1 : null;
  }, [steps, title]);

  const isActive = stepIndex === currentStep && stepIndex !== null;

  return (
    <div data-show={isActive} className={cn("data-[show=false]:hidden", className)}>
      {children}
    </div>
  );
}

function Progress() {
  const { steps, currentStep } = useContext(StepContext) as StepContextType;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeStepElement = scrollContainerRef.current.querySelector(`[data-step-id="${currentStep}"]`);

      if (activeStepElement) {
        activeStepElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentStep]);

  return (
    <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-2">
      <div className="flex items-center min-w-max px-4 py-4">
        {steps.map((step) => (
          <Fragment key={step.id}>
            <ProgressStep step={step} />
            {steps.length === step.id ? null : <ProgressSeparator step={step} />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function ProgressSeparator({ step }: { step: StepType }) {
  return (
    <div
      data-status={step.status}
      className="flex-1 min-w-37.5 h-0.75 rounded-xl bg-foreground mx-1 data-[status=active]:bg-accent data-[status=completed]:bg-green-500 data-[status=inactive]:bg-accent"
    ></div>
  );
}

function ProgressStep({ step }: { step: StepType }) {
  const { goToStep } = useContext(StepContext) as StepContextType;
  const StatusIcon = IconsArray[step.status];

  return (
    <div
      className="flex flex-col items-center group cursor-pointer"
      onClick={() => goToStep(step.id)}
      data-status={step.status}
      data-step-id={step.id}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors
        group-data-[status=active]:bg-blue-500 group-data-[status=active]:border-blue-500 group-data-[status=active]:text-white
        group-data-[status=completed]:bg-green-500 group-data-[status=completed]:border-green-500 group-data-[status=completed]:text-white
        group-data-[status=inactive]:bg-transparent group-data-[status=inactive]:border-gray-300 group-data-[status=inactive]:text-gray-400"
      >
        {step.status === "active" && <Spinner className="w-5 h-5" />}
        {step.status === "completed" && <StatusIcon className="h-5 w-5" />}
        {step.status === "inactive" && <DynamicIcon name={step.icon} className="h-6 w-5" />}
      </div>

      <div className="text-[10px] font-semibold uppercase mt-2 transition-colors">Step {step.id}</div>

      <div className="text-start text-base font-semibold transition-colors">{step.title}</div>

      <Badge
        className="mt-1 transition-colors px-2 py-0.5 rounded-sm
        group-data-[status=active]:bg-blue-500
        group-data-[status=completed]:bg-green-500
        group-data-[status=inactive]:border"
        variant="outline"
      >
        {StatusDescribe[step.status]}
      </Badge>
    </div>
  );
}

function Actions() {
  const { next, prev, isLastStep } = useContext(StepContext) as StepContextType;

  return (
    <div className="flex items-center justify-between w-full mt-5">
      <Button type="button" onClick={() => prev()} variant="ghost" className="border">
        Prev
      </Button>
      {isLastStep() && <Button type="submit">Submit</Button>}

      {!isLastStep() && (
        <Button type="button" onClick={() => next()} variant="ghost" className="border">
          Next
        </Button>
      )}
    </div>
  );
}
