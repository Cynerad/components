import { createTypedLink } from "@/lib/utils";
import { ColumnFiltersState, type SortingState } from "@tanstack/react-table";
import { ParserMap, useQueryStates } from "nuqs";
import { createLoader, parseAsInteger, parseAsJson, parseAsString, UrlKeys } from "nuqs/server";

export const baseSearchParams = {
  limit: parseAsInteger.withDefault(10),
  skip: parseAsInteger.withDefault(0),
  sort: parseAsJson<SortingState>((value) => value as SortingState).withDefault([]),
  globalFilter: parseAsString.withDefault(""),
  columnFilters: parseAsJson<ColumnFiltersState>((value) => value as ColumnFiltersState).withDefault([]),
} as const;

export const baseUrlKeys = {
  limit: "paginate",
  skip: "skip",
  globalFilter: "q",
  columnFilters: "filters",
} as const;

export function createParams<T extends ParserMap>(
  extraParams: T,
  extraUrlKeys?: UrlKeys<T>,
  options?: Omit<Parameters<typeof useQueryStates>[1], "urlKeys">,
) {
  const mergedParams = { ...baseSearchParams, ...extraParams } as typeof baseSearchParams & T;
  const mergedUrlKeys = { ...baseUrlKeys, ...extraUrlKeys } as UrlKeys<typeof mergedParams>;

  const loadSearchParams = createLoader(mergedParams, {
    urlKeys: mergedUrlKeys,
  }) as ReturnType<typeof createLoader<typeof mergedParams>>;

  function useSearchParams() {
    return useQueryStates(mergedParams, {
      urlKeys: mergedUrlKeys,
      shallow: false,
      ...options,
    }) as ReturnType<typeof useQueryStates<typeof mergedParams>>;
  }

  return {
    searchParams: mergedParams,
    urlKeys: mergedUrlKeys,
    loadSearchParams,
    useSearchParams,
  };
}

export const { searchParams, urlKeys, loadSearchParams, useSearchParams } = createParams({});

export const getBaseSearchLinks = createTypedLink("/", baseSearchParams, { urlKeys: baseUrlKeys });
