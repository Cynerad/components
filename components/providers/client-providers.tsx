"use client";

import { ReactNode } from "react";
import { getQueryClient } from "@/components/providers/client/query-client-provider";
import { QueryClientProvider } from "@tanstack/react-query";

export default function ClientProviders({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
