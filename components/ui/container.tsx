import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type ContainerType = ComponentProps<"div">;

export default function Container({ className, children, ...props }: ContainerType) {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main
        className={cn(
          "flex gap-2 min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start",
          className,
        )}
        {...props}
      >
        {children}
      </main>
    </div>
  );
}
