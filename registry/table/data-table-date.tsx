"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import { format, getTime, isValid } from "date-fns";
import { CalendarIcon, XCircle } from "lucide-react";
import z from "zod";

type DateFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>;
  title: string;
  className?: string;
};

const isValidString = z.string().default("");

export function DataTableDate<TData, TValue>({ column, title, className }: DateFilterProps<TData, TValue>) {
  const [{ columnFilters }, setFilters] = useSearchParams();

  const currentColumn = columnFilters.find((c) => c.id === column?.id);
  const value = isValidString.parse(currentColumn?.value);

  const [fromStr, toStr] = value.split(",");
  const fromDate = fromStr ? new Date(Number(fromStr)) : undefined;
  const toDate = toStr ? new Date(Number(toStr)) : undefined;

  const hasValidFrom = fromDate && isValid(fromDate);
  const hasValidTo = toDate && isValid(toDate);
  const haveValue = hasValidFrom || hasValidTo;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button id="date" variant={"outline"} className={cn("justify-start text-left font-normal border-dashed h-8")}>
            {haveValue && (
              <div
                role="button"
                aria-label="Clear Created At filter"
                className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:cursor-pointer"
                onClick={() => {
                  setFilters({ columnFilters: [...columnFilters.filter((c) => c.id !== column?.id)] });
                }}
              >
                <XCircle width={24} height={24} />
              </div>
            )}
            {!haveValue && <CalendarIcon />}
            <span>{title}</span>
            {haveValue ? <Separator orientation="vertical" className="w-2 h-2" /> : null}
            {hasValidFrom ? (
              hasValidTo ? (
                <>
                  {format(fromDate, "LLL dd, y")} - {format(toDate, "LLL dd, y")}
                </>
              ) : (
                format(fromDate, "LLL dd, y")
              )
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: hasValidFrom ? fromDate : undefined,
              to: hasValidTo ? toDate : undefined,
            }}
            onSelect={(event) => {
              const timestamps = [event?.from, event?.to].filter((a) => a !== undefined).map((a) => getTime(a));

              if (timestamps.length === 0) {
                setFilters({
                  columnFilters: columnFilters.filter((c) => c.id !== column?.id),
                });
                return;
              }

              setFilters({
                columnFilters: [
                  ...columnFilters.filter((c) => c.id !== column?.id),
                  {
                    id: column?.id as string,
                    value: timestamps.join(","),
                  },
                ],
              });
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
