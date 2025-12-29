"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/design-system/atoms/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onPageSizeChange?: (size: number) => void;
}

/**
 * Pagination Component
 * Provides pagination controls for tables
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
  onPageSizeChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-border/50 bg-card/30 px-4 py-3 rounded-b-lg">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
          <span className="font-medium text-foreground">{endItem}</span> of{" "}
          <span className="font-medium text-foreground">{totalItems}</span> results
        </div>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded-md border border-border/50 bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

Pagination.displayName = "Pagination";

