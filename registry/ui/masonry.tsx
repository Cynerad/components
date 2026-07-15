"use client";

import { cn } from "@/lib/utils";
import { Children, ComponentProps, ReactNode } from "react";

const COLUMN_CLASS: Record<number, string> = {
  1: "columns-1",
  2: "columns-2",
  3: "columns-3",
  4: "columns-4",
  5: "columns-5",
  6: "columns-6",
};

const SM_COLUMN_CLASS: Record<number, string> = {
  1: "sm:columns-1",
  2: "sm:columns-2",
  3: "sm:columns-3",
  4: "sm:columns-4",
  5: "sm:columns-5",
  6: "sm:columns-6",
};

const MD_COLUMN_CLASS: Record<number, string> = {
  1: "md:columns-1",
  2: "md:columns-2",
  3: "md:columns-3",
  4: "md:columns-4",
  5: "md:columns-5",
  6: "md:columns-6",
};

const LG_COLUMN_CLASS: Record<number, string> = {
  1: "lg:columns-1",
  2: "lg:columns-2",
  3: "lg:columns-3",
  4: "lg:columns-4",
  5: "lg:columns-5",
  6: "lg:columns-6",
};

const XL_COLUMN_CLASS: Record<number, string> = {
  1: "xl:columns-1",
  2: "xl:columns-2",
  3: "xl:columns-3",
  4: "xl:columns-4",
  5: "xl:columns-5",
  6: "xl:columns-6",
};

interface MasonryColumns {
  default: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

type MasonryType = {
  children: ReactNode;
  columns?: MasonryColumns;
  gap?: number;
} & ComponentProps<"div">;

function Masonry({ children, columns = { default: 1, sm: 2, lg: 3, xl: 4 }, gap = 2, className, ref, ...props }: MasonryType) {
  const gapRem = `${gap * 0.25}rem`;

  return (
    <div
      ref={ref}
      className={cn(
        COLUMN_CLASS[columns.default],
        columns.sm && SM_COLUMN_CLASS[columns.sm],
        columns.md && MD_COLUMN_CLASS[columns.md],
        columns.lg && LG_COLUMN_CLASS[columns.lg],
        columns.xl && XL_COLUMN_CLASS[columns.xl],
        className,
      )}
      style={{ columnGap: gapRem, ...props.style }}
      {...props}
    >
      {Children.map(children, (child, i) => (
        <div key={i} className="break-inside-avoid" style={{ marginBottom: gapRem }}>
          {child}
        </div>
      ))}
    </div>
  );
}

export { Masonry };
