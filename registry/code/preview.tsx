"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function Preview({
  className,
  align = "center",
  chromeLessOnMobile = false,
  component,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "center" | "start" | "end";
  chromeLessOnMobile?: boolean;
  component: React.ReactNode;
}) {
  return (
    <div className={cn("group relative mt-4 mb-12 flex flex-col gap-2 rounded-lg border", className)} {...props}>
      <div data-slot="preview">
        <div
          data-align={align}
          className={cn(
            "preview flex w-full justify-center data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start",
            chromeLessOnMobile ? "sm:p-10" : " p-10",
          )}
        >
          {component}
        </div>
      </div>
    </div>
  );
}
