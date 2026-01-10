"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  Bell,
  User,
  TrendingUp,
  Brain,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { Badge } from "../atoms/Badge";
import { ThemeToggle } from "../atoms/ThemeToggle";
import { AIChatToggle } from "../atoms/AIChatToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

export interface TopBarProps {
  onMenuClick?: () => void;
  alertCount?: number;
  userEmail?: string;
  children?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  alertCount = 0,
  userEmail,
  children,
}) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { href: "/", label: "Market", icon: TrendingUp },
    { href: "/analyzer", label: "Analyzer", icon: Brain },
    { href: "/model-monitor", label: "Models", icon: BarChart3 },
  ];

  // Scroll effect - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up, hide when scrolling down
      // Always show if at top of page (within 10px)
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past 80px
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      <motion.header
        className="fixed top-0 z-50 w-full h-12 border-b border-border/50 bg-background/80 backdrop-blur-xl"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -48 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Subtle glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="h-full flex items-center justify-between px-4">
          {/* Left section - Logo and Nav */}
          <div className="flex items-center gap-6">
            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md hover:bg-secondary transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="h-4 w-4" />
            </motion.button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center font-bold text-xs text-primary-foreground shadow-sm"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.2 }}
              >
                L
              </motion.div>
              <span className="font-semibold text-sm hidden sm:inline text-foreground group-hover:text-primary transition-colors">
                LumoTrade
              </span>
            </Link>

            {/* Desktop Navigation - Pill style */}
            <nav className="hidden md:flex items-center gap-1 bg-surface-2 rounded-lg p-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      whileHover={{ scale: isActive ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-primary rounded-md"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.4,
                          }}
                        />
                      )}
                      <Icon className="w-3.5 h-3.5 relative z-10" />
                      <span className="relative z-10">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Custom content from children */}
          {children && (
            <div className="flex-1 flex items-center justify-center px-4 max-w-md">
              {children}
            </div>
          )}

          {/* Right section - Actions */}
          <div className="flex items-center gap-1">
            {/* AI Chat Toggle */}
            <AIChatToggle />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Alerts */}
            <motion.button
              className="relative p-2 rounded-md hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {alertCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive text-destructive-foreground text-2xs font-bold rounded-full flex items-center justify-center"
                >
                  {alertCount > 9 ? "9+" : alertCount}
                </motion.span>
              )}
            </motion.button>

            {/* Settings */}
            <Link href="/settings">
              <motion.div
                className="p-2 rounded-md hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </Link>

            {/* User Menu */}
            <div className="ml-1">
              <UserMenu />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            className="absolute top-0 left-0 w-64 h-full bg-card border-r border-border p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-foreground">Menu</span>
              <motion.button
                onClick={() => setMobileMenuOpen(false)}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-md hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <motion.div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export { TopBar };
