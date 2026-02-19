"use client";

import { Check, ChevronsUpDown, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table } from "@tanstack/react-table";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="ml-auto hidden h-8 lg:flex">
          <Settings2 />
          View
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[168px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandList>
            <CommandEmpty>nothing found.</CommandEmpty>
            <CommandGroup>
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => (
                  <CommandItem
                    key={column.id}
                    value={column.id}
                    onSelect={() => {
                      column.toggleVisibility();
                    }}
                    className="capitalize"
                  >
                    {column.id.replace("_", " ")}
                    <Check className={cn("ml-auto", column.getIsVisible() ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
