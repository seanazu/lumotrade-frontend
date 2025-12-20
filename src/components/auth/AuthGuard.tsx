"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Protects routes from unauthenticated access
 * Redirects to /auth if user is not authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Don't redirect if we're already on the auth page
    if (pathname === "/auth") {
      setIsChecking(false);
      return;
    }

    // Wait for user context to load
    if (isLoading) {
      return;
    }

    // Redirect to auth if not authenticated
    if (!user) {
      console.log("🔒 User not authenticated, redirecting to /auth");
      router.push("/auth");
      return;
    }

    setIsChecking(false);
  }, [user, isLoading, router, pathname]);

  // Show loading screen while checking auth
  if (isChecking || (isLoading && pathname !== "/auth")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children on protected routes if not authenticated
  if (!user && pathname !== "/auth") {
    return null;
  }

  return <>{children}</>;
}
