import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { Plus, XCircle } from "lucide-react";
import { useProducts } from "./searchParams";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useMemo } from "react";
import { debounce } from "nuqs/server";
import { Separator } from "@/components/ui/separator";

type SliderFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>;
  title: string;
  className?: string;
  max?: number;
  min?: number;
  unit?: string;
};

const isString = z.string().default("");
const isNumber = z.coerce.number();

export function DataTableSlider<TData, TValue>({
  column,
  title,
  className,
  min = 1,
  max = 24,
  unit = "hr",
}: SliderFilterProps<TData, TValue>) {
  const [{ columnFilters }, setFilters] = useProducts();

  const currentColumn = useMemo(() => columnFilters.find((c) => c.id === column?.id), [columnFilters, column?.id]);

  const value = isString.parse(currentColumn?.value);
  const filterValues = value.split(",");

  const [firstNumber, secondNumber] = useMemo(() => {
    const params = filterValues
      .filter((v) => v)
      .map((val, index) => {
        const parsed = isNumber.safeParse(val);

        return parsed.success && !isNaN(parsed.data) ? parsed.data : undefined;
      });

    const firstNumber = params[0] ?? min;
    const secondNumber = params[1] ?? max;

    return [firstNumber, secondNumber];
  }, [filterValues, min, max]);

  // console.log(firstNumber, min , secondNumber)

  const updateFilters = useCallback(
    (newValues: [number, number]) => {
      if (!column) return;

      setFilters(
        {
          columnFilters: [
            ...columnFilters.filter((c) => c.id !== column.id),
            {
              id: column.id,
              value: newValues.join(","),
            },
          ],
        },
        {
          limitUrlUpdates: newValues ? debounce(250) : undefined,
        },
      );
    },
    [column, columnFilters, setFilters],
  );

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (!column || newValue > secondNumber || newValue < min) return;
      updateFilters([newValue, secondNumber]);
    },
    [column, secondNumber, min, updateFilters],
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (!column || newValue < firstNumber || newValue > max) return;
      updateFilters([firstNumber, newValue]);
    },
    [column, firstNumber, max, updateFilters],
  );

  const handleSliderChange = useCallback(
    (values: number[]) => {
      if (!column || values.length !== 2) return;
      updateFilters([values[0], values[1]]);
    },
    [column, updateFilters],
  );

  const hasValue = currentColumn?.value !== undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button id="date" variant="outline" className={cn("justify-start text-left font-normal border-dashed h-8")}>
            {currentColumn && (
              <div
                role="button"
                aria-label={`Clear ${title} filter`}
                className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:cursor-pointer"
                onClick={() => {
                  if (!column) return;
                  setFilters({
                    columnFilters: columnFilters.filter((c) => c.id !== column.id),
                  });
                }}
              >
                <XCircle width={24} height={24} />
              </div>
            )}
            {!hasValue && <Plus />}
            <span>{title}</span>
            {hasValue ? <Separator orientation="vertical" className="w-2 h-2" /> : null}
            {hasValue ? (
              <>
                {firstNumber} - {secondNumber}
              </>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex items-center w-auto p-4 gap-1" align="start">
          <div className="flex flex-col gap-3">
            <p className="font-medium leading-none">{title}</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  className="h-8 w-24 pr-8"
                  id="start"
                  type="number"
                  inputMode="numeric"
                  min={min}
                  max={max}
                  value={firstNumber}
                  onChange={handleStartChange}
                />
                <Label
                  htmlFor="start"
                  className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm"
                >
                  {unit}
                </Label>
              </div>

              <div className="relative">
                <Input
                  className="h-8 w-24 pr-8"
                  id="end"
                  type="number"
                  inputMode="numeric"
                  min={min}
                  max={max}
                  value={secondNumber}
                  onChange={handleEndChange}
                />
                <Label
                  htmlFor="end"
                  className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm"
                >
                  {unit}
                </Label>
              </div>
            </div>
            <Slider
              min={min}
              max={max}
              value={[firstNumber ?? min, secondNumber ?? max]}
              onValueChange={handleSliderChange}
              step={1}
              className={cn(className)}
            />

            <Button
              aria-label={`Clear ${title} filter`}
              variant="outline"
              size="sm"
              onClick={() => {
                if (!column) return;
                setFilters({
                  columnFilters: columnFilters.filter((c) => c.id !== column.id),
                });
              }}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
