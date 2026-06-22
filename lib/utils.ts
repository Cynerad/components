import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Route } from "next";
import { createSerializer, type CreateSerializerOptions, type ParserMap } from "nuqs/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createTypedLink<Parsers extends ParserMap>(route: Route, parsers: Parsers, options: CreateSerializerOptions<Parsers> = {}) {
  const serialize = createSerializer<Parsers, Route, Route>(parsers, options);
  return serialize.bind(null, route);
}
