"use client";

import { useUser } from "@/contexts/UserContext";
import { useAlpaca } from "@/hooks/useAlpaca";
import { AlpacaConnectionForm } from "./AlpacaConnectionForm";
import { AlpacaDashboard } from "./AlpacaDashboard";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/design-system/atoms/Skeleton";

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
