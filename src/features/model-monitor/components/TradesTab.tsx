"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { FilterBar } from "./FilterBar";
import { TradesTable } from "./TradesTable";
import { Pagination } from "./Pagination";
import type { Trade, PaginationData, FilterConfig } from "../types";

interface TradesTabProps {
  trades: Trade[];
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
 * TradesTab Component
 * Displays trade history with filtering and pagination
 */
export function TradesTab({
  trades,
  isLoading,
  pagination,
  search,
  onSearchChange,
  filters,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
}: TradesTabProps) {
  return (
    <motion.div
      key="trades"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold mb-1">Trade History</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${pagination?.total_items || 0} trades`}
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
          <TradesTable trades={trades} />
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

TradesTab.displayName = "TradesTab";

