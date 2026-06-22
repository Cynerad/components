import type { Table } from "@tanstack/react-table";

export default function DataTableFooterDetails<T>({ table }: { table: Table<T> }) {
  return (
    <div className="text-muted-foreground flex-1 text-sm">
      {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
    </div>
  );
}
