"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  useModelAccuracyStats,
  useTrades,
  useTradingStatus,
  usePredictionHistory,
} from "@/hooks/useMLBackend";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardContent } from "./DashboardContent";
import { PredictionsTab } from "./PredictionsTab";
import { TradesTab } from "./TradesTab";
import { AlpacaTab } from "./AlpacaTab";
import type { TabId } from "../types";

/**
 * ModelMonitorContainer Component
 * Main container for the model monitor page
 * Manages state and data fetching for all tabs
 */
export function ModelMonitorContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab from URL, default to "dashboard"
  const getTabFromUrl = (): TabId => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "predictions" || tabParam === "trades" || tabParam === "dashboard" || tabParam === "alpaca") {
      return tabParam;
    }
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState<TabId>(getTabFromUrl());

  // Update URL when tab changes
  const handleTabChange = (newTab: TabId) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.push(`/model-monitor?${params.toString()}`, { scroll: false });
  };

  // Sync state with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [tradesPage, setTradesPage] = useState(1);
  const [predictionsPage, setPredictionsPage] = useState(1);
  const [predictionsPageSize, setPredictionsPageSize] = useState(50);
  const [tradesPageSize, setTradesPageSize] = useState(50);

  // Predictions filters
  const [predSearch, setPredSearch] = useState("");
  const [predDirection, setPredDirection] = useState<string>("all");
  const [predShouldTrade, setPredShouldTrade] = useState<string>("all");
  const [predResult, setPredResult] = useState<string>("all");

  // Trades filters
  const [tradeSearch, setTradeSearch] = useState("");
  const [tradeStatus, setTradeStatus] = useState<string>("all");
  const [tradeDirection, setTradeDirection] = useState<string>("all");

  // Data fetching
  const { data: accuracyStats, isLoading: accuracyLoading } =
    useModelAccuracyStats();
  const { data: statusData } = useTradingStatus();

  const { data: historyData, isLoading: historyLoading } = usePredictionHistory(
    90, // Fetch 90 days of history (3 months)
    predictionsPage,
    predictionsPageSize,
    predSearch,
    predDirection,
    predShouldTrade,
    predResult
  );

  const { data: tradesData, isLoading: tradesLoading } = useTrades(
    90, // Fetch 90 days of trades (3 months)
    tradesPage,
    tradesPageSize,
    tradeSearch,
    tradeStatus,
    tradeDirection
  );

  // Fetch full stats for dashboard (300 days to get all trades)
  const { data: fullStatsData } = useTrades(
    300,
    1,
    1,
    "",
    "all",
    "all"
  );

  const predictions = historyData?.predictions || [];
  const trades = tradesData?.trades || [];
  const stats = tradesData?.stats;
  const fullStats = fullStatsData?.stats; // Full period stats for dashboard
  const predictionsPagination = historyData?.pagination;
  const tradesPagination = tradesData?.pagination;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <DashboardContent
              accuracyStats={accuracyStats}
              accuracyLoading={accuracyLoading}
              statusData={statusData}
              tradingStats={fullStats || stats}
            />
          )}

          {activeTab === "predictions" && (
            <PredictionsTab
              predictions={predictions}
              isLoading={historyLoading}
              pagination={predictionsPagination}
              search={predSearch}
              onSearchChange={(val) => {
                setPredSearch(val);
                setPredictionsPage(1);
              }}
              filters={[
                {
                  label: "Direction",
                  value: predDirection,
                  onChange: (val) => {
                    setPredDirection(val);
                    setPredictionsPage(1);
                  },
                  options: [
                    { value: "all", label: "All" },
                    { value: "UP", label: "Up" },
                    { value: "DOWN", label: "Down" },
                  ],
                },
                {
                  label: "Signal",
                  value: predShouldTrade,
                  onChange: (val) => {
                    setPredShouldTrade(val);
                    setPredictionsPage(1);
                  },
                  options: [
                    { value: "all", label: "All" },
                    { value: "trade", label: "Trade Signal" },
                    { value: "no-trade", label: "No Trade" },
                  ],
                },
                {
                  label: "Result",
                  value: predResult,
                  onChange: (val) => {
                    setPredResult(val);
                    setPredictionsPage(1);
                  },
                  options: [
                    { value: "all", label: "All" },
                    { value: "correct", label: "Correct" },
                    { value: "wrong", label: "Wrong" },
                  ],
                },
              ]}
              onClearFilters={() => {
                setPredSearch("");
                setPredDirection("all");
                setPredShouldTrade("all");
                setPredResult("all");
                setPredictionsPage(1);
              }}
              onPageChange={setPredictionsPage}
              onPageSizeChange={(newSize) => {
                setPredictionsPageSize(newSize);
                setPredictionsPage(1);
              }}
            />
          )}

          {activeTab === "trades" && (
            <TradesTab
              trades={trades}
              isLoading={tradesLoading}
              pagination={tradesPagination}
              search={tradeSearch}
              onSearchChange={(val) => {
                setTradeSearch(val);
                setTradesPage(1);
              }}
              filters={[
                {
                  label: "Status",
                  value: tradeStatus,
                  onChange: (val) => {
                    setTradeStatus(val);
                    setTradesPage(1);
                  },
                  options: [
                    { value: "all", label: "All" },
                    { value: "closed", label: "Closed" },
                    { value: "open", label: "Open" },
                  ],
                },
                {
                  label: "Direction",
                  value: tradeDirection,
                  onChange: (val) => {
                    setTradeDirection(val);
                    setTradesPage(1);
                  },
                  options: [
                    { value: "all", label: "All" },
                    { value: "UP", label: "Up" },
                    { value: "DOWN", label: "Down" },
                  ],
                },
              ]}
              onClearFilters={() => {
                setTradeSearch("");
                setTradeStatus("all");
                setTradeDirection("all");
                setTradesPage(1);
              }}
              onPageChange={setTradesPage}
              onPageSizeChange={(newSize) => {
                setTradesPageSize(newSize);
                setTradesPage(1);
              }}
            />
          )}

          {activeTab === "alpaca" && <AlpacaTab />}
        </AnimatePresence>
      </div>
    </div>
  );
}

ModelMonitorContainer.displayName = "ModelMonitorContainer";

