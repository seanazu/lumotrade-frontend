"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { queryClient } from "@/lib/tanstack-query/queryClient";
import { AppShell } from "@/components/design-system/organisms/AppShell";

// Dynamic import for heavy model monitor container
const ModelMonitorContainer = dynamic(
  () =>
    import("@/features/model-monitor").then((mod) => ({
      default: mod.ModelMonitorContainer,
    })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading model data...</div>
      </div>
    ),
  }
);

/**
 * Model Monitor Page
 * Displays AI trading system performance, predictions, and trades
 */
export default function ModelMonitorPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell alertCount={0} userEmail="user@example.com">
        <ModelMonitorContainer />
      </AppShell>
    </QueryClientProvider>
  );
}
