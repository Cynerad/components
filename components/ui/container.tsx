import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";

const containerVariants = cva("mx-auto", {
  variants: {
    variant: {
      fullMobileConstrainedPadded: "max-w-7xl sm:px-6 lg:px-8",
      constrainedPadded: "max-w-7xl px-4 sm:px-6 lg:px-8",
      fullMobileConstrainedBreakpointPadded: "max-w-screen-xl sm:px-6 lg:px-8",
      constrainedBreakpointPadded: "max-w-screen-xl px-4 sm:px-6 lg:px-8",
      narrowConstrainedPadded: "max-w-3xl px-4 sm:px-6 lg:px-8",
    },
  },
  defaultVariants: {
    variant: "narrowConstrainedPadded",
  },
});

type ContainerType = ComponentProps<"div"> & VariantProps<typeof containerVariants>;

function Container({ className, children, variant, ...props }: ContainerType) {
  return (
    <div className={cn(containerVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Container, containerVariants };
