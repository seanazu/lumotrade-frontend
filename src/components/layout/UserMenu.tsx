"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function UserMenu() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) {
    return (
      <motion.button
        onClick={() => router.push("/auth")}
        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-medium transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sign In
      </motion.button>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 hover:ring-primary/40 transition-all"
      >
        <UserIcon className="h-3.5 w-3.5 text-primary" />
      </motion.button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 w-64 bg-surface-2 border border-border rounded-lg shadow-xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {user.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.id.startsWith("guest") ? "Guest Account" : "User"}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 flex items-center gap-3 text-sm text-foreground hover:bg-surface-3 transition-colors"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

