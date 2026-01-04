"use client";

import { useUser } from "@/contexts/UserContext";
import { useAlpaca } from "@/hooks/useAlpaca";
import { AlpacaConnectionForm } from "./AlpacaConnectionForm";
import { AlpacaDashboard } from "./AlpacaDashboard";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/design-system/atoms/Skeleton";

/**
 * AlpacaIntegration Component
 *
 * Main wrapper for Alpaca broker integration.
 * Manages connection state and renders appropriate UI:
 * - Connection form if not connected
 * - Dashboard if connected
 *
 * Features:
 * - Secure credential management
 * - Real-time account data
 * - Automated trading toggle
 * - Position and order tracking
 */
export function AlpacaIntegration() {
  const { user } = useUser();
  const { status, isLoadingStatus } = useAlpaca(user?.id || "");

  if (isLoadingStatus) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {!status?.connected ? (
        <div className="max-w-2xl mx-auto mt-12">
          <AlpacaConnectionForm />
        </div>
      ) : (
        <AlpacaDashboard />
      )}
    </motion.div>
  );
}
