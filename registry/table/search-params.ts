import { createLoader, parseAsInteger, parseAsJson, parseAsString, UrlKeys } from "nuqs/server";
import { createTypedLink } from "@/lib/utils";
import { ColumnFiltersState, type SortingState } from "@tanstack/react-table";

export const searchParams = {
  limit: parseAsInteger.withDefault(10),
  skip: parseAsInteger.withDefault(0),
  sort: parseAsJson<SortingState>((value) => value as SortingState).withDefault([]),
  globalFilter: parseAsString.withDefault(""),
  columnFilters: parseAsJson<ColumnFiltersState>((value) => value as ColumnFiltersState).withDefault([]),
} as const;

export const urlKeys: UrlKeys<typeof searchParams> = {
  limit: "paginate",
  skip: "skip",
  globalFilter: "q",
  columnFilters: "filters",
} as const;

export const loadSearchParams = createLoader(searchParams, { urlKeys }); //server side

export const getCategoryLinks = createTypedLink("/products", searchParams, { urlKeys });
