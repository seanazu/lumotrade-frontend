"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { FilterBar } from "./FilterBar";
import { PredictionsTable } from "./PredictionsTable";
import { Pagination } from "./Pagination";
import type { Prediction, PaginationData, FilterConfig } from "../types";

interface PredictionsTabProps {
  predictions: Prediction[];
  isLoading: boolean;
  pagination?: PaginationData;
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * PredictionsTab Component
 * Displays all model predictions with filtering and pagination
 */
export function PredictionsTab({
  predictions,
  isLoading,
  pagination,
  search,
  onSearchChange,
  filters,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
}: PredictionsTabProps) {
  return (
    <motion.div
      key="predictions"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold mb-1">All Predictions</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${pagination?.total_items || 0} predictions`}
        </p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={onSearchChange}
        filters={filters}
        onClearAll={onClearFilters}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-0">
          <PredictionsTable predictions={predictions} />
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              totalItems={pagination.total_items}
              onPageChange={onPageChange}
              itemsPerPage={pagination.page_size}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}

PredictionsTab.displayName = "PredictionsTab";

