"use client";

/**
 * PageHeader Context
 *
 * Allows pages to communicate their header metadata (title, description, actions)
 * to the unified Header component via React context.
 *
 * Uses split contexts (setter vs data) so that pages calling useSetPageHeader
 * don't re-render when the header data changes, preventing infinite loops.
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { BreadcrumbItem } from "@/src/components/ui/Breadcrumbs";

export interface PageHeaderData {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  pathLabels?: Record<string, string>;
}

type SetHeaderDataFn = (data: PageHeaderData | null) => void;

// Setter context: stable function reference, never triggers consumer re-renders
const SetterContext = createContext<SetHeaderDataFn | undefined>(undefined);

// Data context: changes when header data changes, only Header subscribes
const DataContext = createContext<PageHeaderData | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerData, setHeaderData] = useState<PageHeaderData | null>(null);

  return (
    <SetterContext.Provider value={setHeaderData}>
      <DataContext.Provider value={headerData}>{children}</DataContext.Provider>
    </SetterContext.Provider>
  );
}

/**
 * Hook for pages to set their header data.
 * Runs on every render to keep dynamic actions current.
 * Pages subscribe only to SetterContext (stable value), so they don't
 * re-render when header data changes — breaking the infinite loop.
 */
export function useSetPageHeader(data: PageHeaderData) {
  const setHeaderData = useContext(SetterContext);
  if (!setHeaderData) {
    throw new Error("useSetPageHeader must be used within a PageHeaderProvider");
  }

  // Keep a ref with current data so effect always has latest
  const dataRef = useRef(data);
  dataRef.current = data;

  // Update header on every render (safe because pages don't subscribe to DataContext)
  useEffect(() => {
    setHeaderData(dataRef.current);
  });

  // Clean up on unmount only
  useEffect(() => {
    return () => setHeaderData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Hook for the Header component to read page header data.
 */
export function usePageHeaderData(): PageHeaderData | null {
  const data = useContext(DataContext);
  return data;
}
