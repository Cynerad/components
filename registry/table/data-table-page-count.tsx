import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "@/lib/search-params";
import type { Table } from "@tanstack/react-table";

export function DataTablePageCount<T>({ table }: { table: Table<T> }) {
  const [{ limit }, setFilters] = useSearchParams();

  const limits = new Set([10, 20, 25, 30, 40, 50].concat([limit]));
  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">Rows per page</p>
      <Select
        value={`${table.getState().pagination.pageSize}`}
        onValueChange={(value) => {
          setFilters({ limit: Number(value) });
        }}
      >
        <SelectTrigger className="h-8 w-17.5">
          <SelectValue placeholder={table.getState().pagination.pageSize} />
        </SelectTrigger>
        <SelectContent side="top">
          {Array.from(limits)
            .sort((a, b) => a - b)
            .map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
