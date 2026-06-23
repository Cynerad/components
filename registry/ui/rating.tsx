"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { cloneElement, ComponentProps, ReactElement, useState } from "react";

const ratingVariants = cva("transition-colors", {
  variants: {
    variant: {
      default: "text-foreground",
      yellow: "text-amber-400 dark:text-amber-300",
      red: "text-red-500",
      blue: "text-blue-500",
    },
  },
  defaultVariants: { variant: "default" },
});

type RatingType = {
  name: string;
  defaultValue?: number;
  value?: number;
  max?: number;
  size?: number;
  icon?: ReactElement<{ "size"?: number; "className"?: string; "aria-hidden"?: boolean }>;
  variant?: VariantProps<typeof ratingVariants>["variant"];
  readOnly?: boolean;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
} & ComponentProps<"div">

function Rating({
  name,
  defaultValue = 0,
  value: controlledValue,
  max = 5,
  size = 20,
  icon = <Star />,
  variant = "default",
  readOnly = false,
  disabled = false,
  className,
  onValueChange,
  ...props
}: RatingType) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hovered, setHovered] = useState(0);

  const value = isControlled ? controlledValue : internalValue;
  const active = hovered || value;
  const isInteractive = !readOnly && !disabled;

  const handleChange = (next: number) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const activeIcon = cloneElement(icon, {
    size,
    "className": cn(ratingVariants({ variant }), "fill-current"),
    "aria-hidden": true,
  });

  const emptyIcon = cloneElement(icon, {
    size,
    "className": "fill-muted-foreground/20 text-muted-foreground/30",
    "aria-hidden": true,
  });

  return (
    <div
      data-slot="rating"
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `${value} of ${max} stars` : "Rating"}
      className={cn("flex gap-px", disabled && "opacity-50 pointer-events-none", className)}
      {...props}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((point) => (
        <label
          key={point}
          className={cn(
            "[&_svg]:pointer-events-none",
            isInteractive && "cursor-pointer transition-transform hover:scale-110",
            readOnly && "pointer-events-none",
          )}
          onMouseEnter={() => isInteractive && setHovered(point)}
          onMouseLeave={() => isInteractive && setHovered(0)}
          onClick={() => isInteractive && handleChange(point === value ? 0 : point)}
        >
          <input
            type="radio"
            name={name}
            value={point}
            className="sr-only"
            readOnly={readOnly}
            defaultChecked={value === point}
            onChange={() => handleChange(point)}
          />
          {point <= active ? activeIcon : emptyIcon}
        </label>
      ))}
    </div>
  );
}

export { Rating, ratingVariants, type RatingType };
