"use client";

import { useSelectedStrategy } from "@/hooks/useSelectedStrategy";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/instant";
import { CheckCircle2, XCircle, Loader2, Database } from "lucide-react";

interface StrategyDebugPanelProps {
  symbol: string;
}

/**
 * Debug panel to verify InstantDB connection and strategy storage
 * Remove this component in production
 */
export function StrategyDebugPanel({ symbol }: StrategyDebugPanelProps) {
  const { user, isLoading: authLoading } = useUser();
  const { savedStrategy, isLoading: strategyLoading } =
    useSelectedStrategy(symbol);

  // Check InstantDB connection
  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const isConfigured = appId && appId !== "YOUR_APP_ID";

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-xs text-white shadow-2xl max-w-md z-50">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <Database className="w-4 h-4 text-blue-400" />
        <span className="font-semibold">Strategy Storage Debug</span>
      </div>

      <div className="space-y-2">
        {/* InstantDB Configuration */}
        <div className="flex items-center justify-between">
          <span className="text-white/60">InstantDB Config:</span>
          {isConfigured ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400">
              <XCircle className="w-3 h-3" />
              Not Configured
            </span>
          )}
        </div>

        {/* App ID */}
        <div className="flex items-center justify-between">
          <span className="text-white/60">App ID:</span>
          <span className="font-mono text-[10px] text-white/80">
            {appId?.slice(0, 12)}...
          </span>
        </div>

        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <span className="text-white/60">Auth Status:</span>
          {authLoading ? (
            <span className="flex items-center gap-1 text-yellow-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading
            </span>
          ) : user ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              Authenticated
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <Database className="w-3 h-3" />
              Guest Mode
            </span>
          )}
        </div>

        {/* User ID */}
        <div className="flex items-center justify-between">
          <span className="text-white/60">User ID:</span>
          <span className="font-mono text-[10px] text-white/80">
            {user?.id || "guest"}
          </span>
        </div>

        {/* Symbol */}
        <div className="flex items-center justify-between">
          <span className="text-white/60">Symbol:</span>
          <span className="font-semibold text-white">{symbol}</span>
        </div>

        {/* Saved Strategy Status */}
        <div className="flex items-center justify-between">
          <span className="text-white/60">Strategy Saved:</span>
          {strategyLoading ? (
            <span className="flex items-center gap-1 text-yellow-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading
            </span>
          ) : savedStrategy ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              Yes
            </span>
          ) : (
            <span className="flex items-center gap-1 text-white/40">
              <XCircle className="w-3 h-3" />
              None
            </span>
          )}
        </div>

        {/* Strategy Name */}
        {savedStrategy && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-white/60">Strategy:</span>
            <span className="font-semibold text-blue-400 text-right max-w-[180px] truncate">
              {savedStrategy.name}
            </span>
          </div>
        )}

        {/* Storage Methods */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-white/60 mb-1">Storage:</div>
          <div className="flex gap-2 text-[10px]">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
              InstantDB
            </span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
              localStorage
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40">
        Remove StrategyDebugPanel in production
      </div>
    </div>
  );
}
