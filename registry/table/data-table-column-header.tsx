import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, X } from "lucide-react";

import { useSearchParams } from "@/lib/search-params";

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
  const [{ sort }, setSort] = useSearchParams();

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
