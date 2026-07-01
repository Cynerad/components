import { baseUrlKeys } from "@/lib/search-params";

type ColumnFilter = { id: string; value: string };
type SortItem = { id: string; desc: boolean };

const transformers: Record<string, (value: unknown) => Record<string, string>> = {
  columnFilters: (value) => {
    const filters = value as ColumnFilter[];
    return Object.fromEntries(filters.map(({ id, value: v }) => [id, v]));
  },

  sort: (value) => {
    const items = value as SortItem[];
    return {
      sortBy: items.map((s) => s.id).join(","),
      order: items.map((s) => (s.desc ? "desc" : "asc")).join(","),
    };
  },

  filters: (value) => {
    const items = value as SortItem[];
    return {
      filter: items.map((s) => s.id).join(","),
      query: items.map((s) => (s.desc ? "desc" : "asc")).join(","),
    };
  },
};

export function toQueryParams(object: { [s: string]: unknown }): URLSearchParams {
  const params = new URLSearchParams();

  if (object[baseUrlKeys.globalFilter]) {
    params.append(baseUrlKeys.globalFilter, String(object[baseUrlKeys.globalFilter]));
    return params;
  }

  Object.entries(object)
    .filter(([, v]) => v !== null && v !== undefined)
    .forEach(([key, value]) => {
      const transformed = transformers[key]?.(value) ?? { [key]: String(value) };
      Object.entries(transformed).forEach(([k, v]) => params.append(k, v));
    });

  return params;
}
