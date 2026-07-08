"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

import type { EvidenceWorkbenchViewModel } from "@aivis/services";

const EvidenceWorkbenchInitialDataContext =
  createContext<EvidenceWorkbenchViewModel | null>(null);

export function EvidenceWorkbenchQueryProvider({
  children,
  initialData
}: Readonly<{
  children: ReactNode;
  initialData: EvidenceWorkbenchViewModel;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000
          }
        }
      })
  );

  return (
    <EvidenceWorkbenchInitialDataContext.Provider value={initialData}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </EvidenceWorkbenchInitialDataContext.Provider>
  );
}

export function useEvidenceWorkbenchInitialData(): EvidenceWorkbenchViewModel {
  const initialData = useOptionalEvidenceWorkbenchInitialData();

  if (!initialData) {
    throw new Error("Evidence Workbench initial data is missing from the query provider.");
  }

  return initialData;
}

export function useOptionalEvidenceWorkbenchInitialData(): EvidenceWorkbenchViewModel | null {
  return useContext(EvidenceWorkbenchInitialDataContext);
}
