import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";

import { useSearchParams } from "@/lib/search-params";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function DataTablePagination<T>({ table }: { table: Table<T> }) {
  const [{ limit, skip }, setFilters] = useSearchParams();
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFilters({ skip: 0 });
        }}
        disabled={!table.getCanPreviousPage()}
      >
        <span className="sr-only">Go to first page</span>
        <ChevronsLeft />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newSkip = Math.max(0, skip - limit);
          setFilters({ skip: newSkip });
        }}
        disabled={!table.getCanPreviousPage()}
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newSkip = skip + limit;
          setFilters({ skip: newSkip });
        }}
        disabled={!table.getCanNextPage()}
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRight />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const totalRows = table.getRowCount();
          setFilters({ skip: totalRows - (totalRows % limit || limit) });
        }}
        disabled={!table.getCanNextPage()}
      >
        <span className="sr-only">Go to last page</span>
        <ChevronsRight />
      </Button>
    </div>
  );
}
