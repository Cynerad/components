import { toast } from "sonner";

function safeStringify(obj: unknown, indent = 2) {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        // Skip DOM elements and React fibers
        if (value instanceof HTMLElement || value instanceof Node) {
          return "[DOM Element]";
        }
        // Handle circular references
        if (cache.has(value)) {
          return "[Circular]";
        }
        cache.add(value);
      }
      return value;
    },
    indent,
  );
}

export function dd(data: unknown) {
  toast("Debug", {
    description: () => {
      return (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] max-h-200 overflow-auto rounded-md p-4">
          <code>{safeStringify(data)}</code>
        </pre>
      );
    },
    position: "top-right",
    classNames: {
      content: "flex flex-col gap-2",
    },
    style: {
      "--border-radius": "calc(var(--radius)  + 4px)",
    } as React.CSSProperties,
  });
}
