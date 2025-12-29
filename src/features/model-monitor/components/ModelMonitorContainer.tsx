"use client";

import { useState } from "react";
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
import type { TabId } from "../types";

/**
 * ModelMonitorContainer Component
 * Main container for the model monitor page
 * Manages state and data fetching for all tabs
 */
export function ModelMonitorContainer() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
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
    30,
    predictionsPage,
    predictionsPageSize,
    predSearch,
    predDirection,
    predShouldTrade,
    predResult
  );

  const { data: tradesData, isLoading: tradesLoading } = useTrades(
    30,
    tradesPage,
    tradesPageSize,
    tradeSearch,
    tradeStatus,
    tradeDirection
  );

  const predictions = historyData?.predictions || [];
  const trades = tradesData?.trades || [];
  const stats = tradesData?.stats;
  const predictionsPagination = historyData?.pagination;
  const tradesPagination = tradesData?.pagination;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <DashboardContent
              accuracyStats={accuracyStats}
              accuracyLoading={accuracyLoading}
              statusData={statusData}
              tradingStats={stats}
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
        </AnimatePresence>
      </div>
    </div>
  );
}

ModelMonitorContainer.displayName = "ModelMonitorContainer";

