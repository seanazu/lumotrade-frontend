"use client";

import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";
import type { FilterConfig } from "../types";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  onClearAll: () => void;
}

/**
 * FilterBar Component
 * Provides search and filter functionality for tables
 */
export function FilterBar({
  search,
  onSearchChange,
  filters,
  onClearAll,
}: FilterBarProps) {
  const hasActiveFilters = search || filters.some((f) => f.value !== "all");

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ticker or date..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-md border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.label} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{filter.label}:</span>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-9 rounded-md border border-border/50 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

FilterBar.displayName = "FilterBar";

