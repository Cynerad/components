import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Check, ChevronsUpDown, EyeOff, PlusCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/app/[locale]/dashboard/invoices/searchParams";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Separator } from "../separator";
import { Badge } from "../badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../command";

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
  const [{ sort }, setSort] = useProducts();

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="data-[state=open]:bg-accent -ml-3 h-8">
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? <ArrowDown /> : column.getIsSorted() === "asc" ? <ArrowUp /> : <ChevronsUpDown />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => {
              if (sort.some((s) => s.id === column.id && s.desc === false)) return;

              setSort({
                sort: [
                  ...sort.filter((s) => s.id !== column.id),
                  {
                    id: column.id,
                    desc: false,
                  },
                ],
              });
            }}
          >
            <ArrowUp />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (sort.some((s) => s.id === column.id && s.desc === true)) return;
              setSort({
                sort: [
                  ...sort.filter((s) => s.id !== column.id),
                  {
                    id: column.id,
                    desc: true,
                  },
                ],
              });
            }}
          >
            <ArrowDown />
            Desc
          </DropdownMenuItem>
          {column.getIsSorted() && (
            <DropdownMenuItem
              onClick={() => {
                setSort({
                  sort: [...sort.filter((s) => s.id !== column.id)],
                });
              }}
            >
              <X />
              Reset
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({ column, title, options }: DataTableFacetedFilterProps<TData, TValue>) {
  const [{ columnFilters }, setFilters] = useProducts();
  const currentFilter = columnFilters.find((c) => c.id === column?.id);

  const optionValues = options.map((opt) => opt.value);
  const selectedValues = new Set(
    currentFilter?.value
      ? String(currentFilter.value)
          .split(",")
          .filter((s) => optionValues.includes(s))
      : [],
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);

                      if (filterValues.length > 0) {
                        setFilters({
                          columnFilters: [
                            ...columnFilters.filter((c) => c.id !== column?.id),
                            { id: column?.id as string, value: filterValues.join(",") },
                          ],
                        });
                      } else {
                        setFilters({
                          columnFilters: columnFilters.filter((c) => c.id !== column?.id),
                        });
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input [&_svg]:invisible",
                      )}
                    >
                      <Check className="text-primary-foreground size-3.5" />
                    </div>
                    {option.icon && <option.icon className="text-muted-foreground size-4" />}
                    <span>{option.label}</span>
                    {/* {facets?.get(option.value) && (
                      <span className="text-muted-foreground ml-auto flex size-4 items-center justify-center font-mono text-xs">

                        {facets.get(option.value)}
                      </span>
                    )} */}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setFilters({
                        columnFilters: columnFilters.filter((c) => c.id !== column?.id),
                      });
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
