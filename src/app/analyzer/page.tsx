'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { queryClient } from '@/lib/tanstack-query/queryClient';
import { AppShell } from '@/components/design-system/organisms/AppShell';

// Dynamic import for heavy analyzer container
const AnalyzerContainer = dynamic(
  () =>
    import('@/features/analyzer').then((mod) => ({
      default: mod.AnalyzerContainer,
    })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading analyzer...</div>
      </div>
    ),
  }
);

/**
 * Analyzer Page
 * Stock analysis page with charts, indicators, and AI insights
 */
export default function AnalyzerPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell alertCount={0} userEmail="user@example.com">
        <AnalyzerContainer />
      </AppShell>
    </QueryClientProvider>
  );
}
