"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { ComponentProps, KeyboardEvent, useRef, useState } from "react";

type TagsInputType = {
  name: string;
  filterFunction?: (tags: string[]) => string;
} & ComponentProps<"input">;

export default function TagsInput({ name, filterFunction, ...props }: TagsInputType) {
  const [value, setValue] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const filterdValue = () => {
    if (filterFunction) {
      return filterFunction(tags);
    }

    return tags.join(",");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      add();
    }

    if (event.key === "Backspace" && value === "") {
      removeLast();
    }
  };

  function add() {
    if (value === "") return;

    if (tags.includes(value)) {
      setValue("");
      return;
    }

    tags.push(value);

    setValue("");

    inputRef.current?.focus();
  }

  function remove(tag: string) {
    setTags((prevTags) => prevTags.filter((prevTag) => prevTag !== tag));
  }

  function removeLast() {
    setTags((prevTags) => prevTags.slice(0, prevTags.length - 1));
  }

  function clearAll() {
    setTags([]);
  }

  return (
    <div>
      <div className={cn("p-2 flex flex-col md:flex-row items-center gap-2 rounded-xs", props.className)}>
        <Input type="text" value={value} ref={inputRef} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown} {...props} />
        <input name={name} type="hidden" value={filterdValue()} readOnly />

        <Button variant="outline" size="xs" onClick={add} className="w-full py-4 md:w-fit md:py-2">
          <Plus />
        </Button>

        {tags.length > 0 && (
          <Button variant="outline" size="xs" onClick={clearAll} className="w-full py-4 md:w-fit md:py-2">
            Clear
          </Button>
        )}
      </div>
      <div className="flex items-center flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge variant="outline" key={tag}>
            <span>{tag}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => remove(tag)}>
              <X />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
