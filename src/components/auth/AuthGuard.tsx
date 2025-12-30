"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Protects routes from unauthenticated access
 * Redirects to /auth if user is not authenticated
 * Preserves the original path and redirects back after authentication
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // On auth page, no need to check
    if (pathname === "/auth") {
      setIsInitialLoad(false);
      return;
    }

    // Wait for the initial auth check to complete
    if (isLoading) {
      return;
    }

    // Mark initial load as complete
    setIsInitialLoad(false);

    // Only redirect if user is not authenticated and we haven't redirected yet
    if (!user && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log("🔒 User not authenticated, redirecting to /auth");
      // Store the current path so we can redirect back after auth
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterAuth", pathname);
      }
      router.push("/auth");
    }
  }, [user, isLoading, router, pathname]);

  // Reset redirect flag when user becomes authenticated
  useEffect(() => {
    if (user) {
      hasRedirected.current = false;
    }
  }, [user]);

  // Show loading screen during initial auth check
  if (isInitialLoad || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If on auth page, always render
  if (pathname === "/auth") {
    return <>{children}</>;
  }

  // If authenticated, render children
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated and not on auth page, don't render (redirect is happening)
  return null;
}
